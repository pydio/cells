/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package jobs

import (
	"context"
	"fmt"
	"io"
	"path"
	"strings"

	"github.com/pydio/cells/v4/common/client/grpc"

	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
)

type FreeStringEvaluator func(ctx context.Context, query string, node *tree.Node) bool

var (
	freeStringEvaluator FreeStringEvaluator
)

func RegisterNodesFreeStringEvaluator(f FreeStringEvaluator) {
	freeStringEvaluator = f
}

type NodeMatcher struct {
	*tree.Query
}

func (n *NodeMatcher) Matches(object interface{}) bool {
	if node, ok := object.(*tree.Node); ok {
		return evaluateSingleQuery(n.Query, node)
	} else {
		return false
	}
}

func (n *NodesSelector) MultipleSelection() bool {
	return n.Collect
}

func (n *NodesSelector) SelectorID() string {
	return "NodesSelector"
}

func (n *NodesSelector) FilterID() string {
	return "NodesFilter"
}

func (n *NodesSelector) Select(ctx context.Context, input *ActionMessage, objects chan interface{}, done chan bool) error {
	defer func() {
		done <- true
	}()
	selector := n.evaluatedClone(ctx, input)

	// Absolute Paths pre-specified, just pass them without checking for existence
	if len(selector.Pathes) > 0 {
		for _, p := range selector.Pathes {
			objects <- &tree.Node{
				Path: p,
			}
		}
		return nil
	}
	// FanOut existing values from Input.Nodes and return
	if selector.FanOutInput {
		for _, n := range input.Nodes {
			objects <- n.Clone()
		}
		return nil
	}

	// Now handle query
	q := &tree.Query{}
	if !selector.All && (selector.Query == nil || selector.Query.SubQueries == nil || len(selector.Query.SubQueries) == 0) {
		return nil
	}

	if e := anypb.UnmarshalTo(selector.Query.SubQueries[0], q, proto.UnmarshalOptions{}); e != nil {
		log.Logger(ctx).Error("Could not parse input query", zap.Error(e))
		return e
	}
	if e := q.ParseDurationDate(); e != nil {
		log.Logger(ctx).Error("Error while parsing DurationDate", zap.Error(e))
		return e
	}
	// If paths are preset, just load nodes and do not go further
	if len(q.Paths) > 0 {
		sCli := tree.NewNodeProviderClient(grpc.GetClientConnFromCtx(ctx, common.ServiceTree))
		for _, p := range q.Paths {
			if r, e := sCli.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: p}}); e == nil {
				objects <- r.GetNode()
			}
		}
		return nil
	}
	// If UUIDs are preset, just load nodes and do not go further
	if len(q.UUIDs) > 0 {
		sCli := tree.NewNodeProviderClient(grpc.GetClientConnFromCtx(ctx, common.ServiceTree))
		for _, uuid := range q.UUIDs {
			if r, e := sCli.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: uuid}}); e == nil {
				objects <- r.GetNode()
			}
		}
		return nil
	}
	filter := func(n *tree.Node) bool {
		return true
	}
	var total int
	if q.FreeString != "" || q.Content != "" || q.FileNameOrContent != "" {
		// Use the Search Service, relaunch search as long as there are results (request size cannot be empty)

		// Search Service does not support PathDepth, reapply filtering on output
		if q.PathDepth > 0 {
			filter = func(n *tree.Node) bool {
				depth := int32(len(strings.Split(strings.Trim(n.GetPath(), "/"), "/")))
				return depth == q.PathDepth
			}
		} else if q.PathDepth == -1 && len(q.PathPrefix) == 1 {
			// Special -1 case : just look for Depth(PathPrefix) + 1
			filter = func(n *tree.Node) bool {
				depth := int32(len(strings.Split(strings.Trim(n.GetPath(), "/"), "/")))
				refDepth := int32(len(strings.Split(strings.Trim(q.PathPrefix[0], "/"), "/")))
				return depth == refDepth+1
			}
		}

		var cursor int32
		size := int32(50)
		for {
			req := &tree.SearchRequest{
				Query:   q,
				Details: true,
				From:    cursor,
				Size:    size,
			}
			res, loadMore, err := n.performListing(ctx, common.ServiceSearch, req, filter, objects)
			if err != nil {
				return err
			}
			total += res
			if loadMore {
				cursor += size
			} else {
				break
			}
		}
	} else {
		// For simple requests, directly use the Tree service
		var e error
		req := &tree.SearchRequest{
			Query:   q,
			Details: true,
		}
		total, _, e = n.performListing(ctx, common.ServiceTree, req, filter, objects)
		if e != nil {
			return e
		}
	}
	log.Logger(ctx).Info("Selector finished request with query", zap.Any("q", q), zap.Int("count", total))

	return nil
}

func (n *NodesSelector) performListing(ctx context.Context, serviceName string, req *tree.SearchRequest, filter func(n *tree.Node) bool, objects chan interface{}) (int, bool, error) {
	treeClient := tree.NewSearcherClient(grpc.GetClientConnFromCtx(ctx, serviceName))
	sStream, eR := treeClient.Search(ctx, req)
	if eR != nil {
		return 0, false, eR
	}
	var received int32
	var count int
	var stErr error
	defer sStream.CloseSend()
	for {
		resp, rE := sStream.Recv()
		if rE != nil {
			if rE != io.EOF {
				stErr = rE
			}
			break
		}
		if resp == nil || resp.Node == nil {
			continue
		}
		received++
		if !filter(resp.GetNode()) {
			continue
		}
		log.Logger(ctx).Debug("Search Request with query received Node", resp.Node.ZapPath())
		objects <- resp.Node
		count++
	}
	mayHaveMore := req.Size > 0 && received == req.Size
	return count, mayHaveMore, stErr
}

func (n *NodesSelector) Filter(ctx context.Context, input *ActionMessage) (*ActionMessage, *ActionMessage, bool) {

	var excluded []*tree.Node
	if len(input.Nodes) == 0 {
		return input, nil, false
	}
	if n.All {
		return input, nil, true
	}
	selector := n.evaluatedClone(ctx, input)

	var newNodes []*tree.Node
	var multi *service.MultiMatcher
	if selector.Query != nil && len(selector.Query.SubQueries) > 0 {
		multi = &service.MultiMatcher{}
		if er := multi.Parse(selector.Query, func(o *anypb.Any) (service.Matcher, error) {
			target := &tree.Query{}
			if e := anypb.UnmarshalTo(o, target, proto.UnmarshalOptions{}); e != nil {
				return nil, e
			}
			return &NodeMatcher{Query: target}, nil
		}); er != nil {
			fmt.Println("Error while parsing query", er)
		}
	}

	for _, node := range input.Nodes {
		if len(selector.Pathes) > 0 {
			if contains(selector.Pathes, node.Path, false, false) {
				newNodes = append(newNodes, node)
			} else {
				excluded = append(excluded, node)
			}
			continue
		}
		if multi != nil {
			if multi.Matches(node) {
				newNodes = append(newNodes, node)
			} else {
				excluded = append(excluded, node)
			}
		}
	}
	output := input
	output.Nodes = newNodes
	var xx *ActionMessage
	if len(excluded) > 0 {
		xx = input.Clone()
		xx.Nodes = excluded
	}
	return output, xx, len(newNodes) > 0

}

func (n *NodesSelector) evaluatedClone(ctx context.Context, input *ActionMessage) *NodesSelector {
	if len(GetFieldEvaluators()) == 0 {
		return n
	}
	c := proto.Clone(n).(*NodesSelector)
	for i, p := range c.Pathes {
		c.Pathes[i] = EvaluateFieldStr(ctx, input, p)
	}
	if c.Query != nil && len(c.Query.SubQueries) > 0 {
		for i, q := range c.Query.SubQueries {
			singleQuery := &tree.Query{}
			if e := anypb.UnmarshalTo(q, singleQuery, proto.UnmarshalOptions{}); e != nil {
				continue
			}
			singleQuery.Content = EvaluateFieldStr(ctx, input, singleQuery.Content)
			singleQuery.DurationDate = EvaluateFieldStr(ctx, input, singleQuery.DurationDate)
			singleQuery.FileName = EvaluateFieldStr(ctx, input, singleQuery.FileName)
			singleQuery.FileNameOrContent = EvaluateFieldStr(ctx, input, singleQuery.FileNameOrContent)
			singleQuery.FreeString = EvaluateFieldStr(ctx, input, singleQuery.FreeString)
			singleQuery.Extension = EvaluateFieldStr(ctx, input, singleQuery.Extension)
			singleQuery.PathPrefix = EvaluateFieldStrSlice(ctx, input, singleQuery.PathPrefix)
			singleQuery.Paths = EvaluateFieldStrSlice(ctx, input, singleQuery.Paths)
			singleQuery.UUIDs = EvaluateFieldStrSlice(ctx, input, singleQuery.UUIDs)
			c.Query.SubQueries[i], _ = anypb.New(singleQuery)
		}
	}
	return c
}

func contains(slice []string, value string, prefix bool, lower bool) bool {
	if lower {
		value = strings.ToLower(value)
	}
	for _, v := range slice {
		if lower {
			v = strings.ToLower(v)
		}
		if prefix && strings.HasPrefix(value, v) {
			return true
		} else if !prefix && value == v {
			return true
		}
	}
	return false
}

func evaluateSingleQuery(q *tree.Query, node *tree.Node) (result bool) {

	defer func() {
		// Invert result if q.Not
		if q.Not {
			result = !result
		}
	}()

	if len(q.Paths) > 0 {
		if !contains(q.Paths, node.Path, false, false) {
			return false
		}
	}

	if len(q.UUIDs) > 0 {
		if !contains(q.UUIDs, node.Uuid, false, false) {
			return false
		}
	}

	if len(q.PathPrefix) > 0 {
		if !contains(q.PathPrefix, node.Path, true, false) {
			return false
		}
	}

	if (q.MinSize > 0 && node.Size < q.MinSize) || (q.MaxSize > 0 && node.Size > q.MaxSize) {
		return false
	}
	if er := q.ParseDurationDate(); er != nil {
		fmt.Println("[warn] Error while parsing Duration: " + er.Error())
	}
	if (q.MinDate > 0 && node.MTime < q.MinDate) || (q.MaxDate > 0 && node.MTime > q.MaxDate) {
		return false
	}

	if (q.Type == tree.NodeType_COLLECTION && node.IsLeaf()) || (q.Type == tree.NodeType_LEAF && !node.IsLeaf()) {
		return false
	}

	if q.PathDepth > 0 && len(strings.Split(strings.Trim(node.Path, "/"), "/")) != int(q.PathDepth) {
		return false
	}

	if len(q.FileNameOrContent) > 0 {
		fmt.Println("[warn] Filtering on FileNameOrContent is not supported yet, switching to Filename")
		q.FileName = q.FileNameOrContent
	}

	if len(q.Content) != 0 {
		// Read content??
		fmt.Println("[warn] Dynamic filtering on Content is not supported yet - ignoring")
	}

	if len(q.FileName) != 0 {
		// Basic search: can have wildcard on left, right, or none (exact search)
		nodeName := node.GetStringMeta(common.MetaNamespaceNodeName)
		if len(nodeName) == 0 {
			nodeName = path.Base(node.Path)
		}
		var left, right bool
		if strings.HasPrefix(q.FileName, "*") {
			left = true
		}
		if strings.HasSuffix(q.FileName, "*") {
			right = true
		}
		search := strings.Trim(q.FileName, "*")
		if left || right {
			// If not exact search, lowerCase
			nodeName = strings.ToLower(nodeName)
			search = strings.ToLower(search)
		}
		if left && right && !strings.Contains(nodeName, search) { // *part*
			return false
		} else if right && !left && !strings.HasPrefix(nodeName, search) { // start*
			return false
		} else if left && !right && !strings.HasSuffix(nodeName, search) { // *end
			return false
		} else if !left && !right && nodeName != search { // exact term
			return false
		}
	}

	if len(q.Extension) > 0 {
		// Can be "ext1,ext2,ext3"
		exts := strings.Split(q.Extension, ",")
		nodeName := node.GetStringMeta(common.MetaNamespaceNodeName)
		if len(nodeName) == 0 {
			nodeName = path.Base(node.Path)
		}
		nodeExt := strings.TrimLeft(path.Ext(nodeName), ".")
		if !contains(exts, nodeExt, false, true) {
			return false
		}
	}

	// Bleve-style query string
	if len(q.FreeString) > 0 {
		if freeStringEvaluator == nil {
			log.Logger(context.Background()).Error("Warning, no FreeStringEvaluator was registered for nodes selector")
			return false
		} else {
			return freeStringEvaluator(context.Background(), q.FreeString, node)
		}
	}

	return true
}
