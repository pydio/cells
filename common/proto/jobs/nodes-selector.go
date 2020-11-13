/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
	"path"
	"strings"

	"github.com/blevesearch/bleve"
	"github.com/blevesearch/bleve/search/query"
	"github.com/golang/protobuf/proto"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/client"
	"github.com/micro/protobuf/ptypes"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service/proto"
)

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

func (n *NodesSelector) Select(cl client.Client, ctx context.Context, input ActionMessage, objects chan interface{}, done chan bool) error {
	defer func() {
		done <- true
	}()
	selector := n.evaluatedClone(ctx, input)
	if len(selector.Pathes) > 0 {
		for _, p := range selector.Pathes {
			objects <- &tree.Node{
				Path: p,
			}
		}
	} else {
		q := &tree.Query{}
		if !selector.All && (selector.Query == nil || selector.Query.SubQueries == nil || len(selector.Query.SubQueries) == 0) {
			return nil
		}

		if e := ptypes.UnmarshalAny(selector.Query.SubQueries[0], q); e != nil {
			log.Logger(ctx).Error("Could not parse input query", zap.Error(e))
			return e
		}
		if e := q.ParseDurationDate(); e != nil {
			log.Logger(ctx).Error("Error while parsing DurationDate", zap.Error(e))
			return e
		}
		// If paths are preset, just load nodes and do not go further
		if len(q.Paths) > 0 {
			sCli := tree.NewNodeProviderClient(registry.GetClient(common.ServiceTree))
			for _, p := range q.Paths {
				if r, e := sCli.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: p}}); e == nil {
					objects <- r.GetNode()
				}
			}
			return nil
		}
		// If UUIDs are preset, just load nodes and do not go further
		if len(q.UUIDs) > 0 {
			sCli := tree.NewNodeProviderClient(registry.GetClient(common.ServiceTree))
			for _, uuid := range q.UUIDs {
				if r, e := sCli.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: uuid}}); e == nil {
					objects <- r.GetNode()
				}
			}
			return nil
		}
		// For simple/quick requests
		sName := common.ServiceTree
		if q.FreeString != "" || q.Content != "" {
			// Use the Search Service instead
			sName = common.ServiceSearch
		}
		treeClient := tree.NewSearcherClient(common.ServiceGrpcNamespace_+sName, cl)
		sStream, eR := treeClient.Search(ctx, &tree.SearchRequest{
			Query:   q,
			Details: true,
		})
		if eR != nil {
			return eR
		}
		defer sStream.Close()
		for {
			resp, rE := sStream.Recv()
			if rE != nil {
				break
			}
			if resp == nil {
				continue
			}
			if q.PathDepth > 0 {
				depth := int32(len(strings.Split(strings.Trim(resp.GetNode().GetPath(), "/"), "/")))
				if depth != q.PathDepth {
					continue
				}
			}
			log.Logger(ctx).Debug("Search Request with query received Node", resp.Node.ZapPath())
			objects <- resp.Node
		}
		log.Logger(ctx).Info("Finished Search Request with query", zap.Any("q", q))
	}
	return nil
}

func (n *NodesSelector) Filter(ctx context.Context, input ActionMessage) (ActionMessage, *ActionMessage, bool) {

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
		if er := multi.Parse(selector.Query, func(o *any.Any) (service.Matcher, error) {
			target := &tree.Query{}
			if e := ptypes.UnmarshalAny(o, target); e != nil {
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
		filteredOutput := input
		filteredOutput.Nodes = excluded
		xx = &filteredOutput
	}
	return output, xx, len(newNodes) > 0

}

func (n *NodesSelector) evaluatedClone(ctx context.Context, input ActionMessage) *NodesSelector {
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
			if e := ptypes.UnmarshalAny(q, singleQuery); e != nil {
				continue
			}
			singleQuery.Content = EvaluateFieldStr(ctx, input, singleQuery.Content)
			singleQuery.DurationDate = EvaluateFieldStr(ctx, input, singleQuery.DurationDate)
			singleQuery.FileName = EvaluateFieldStr(ctx, input, singleQuery.FileName)
			singleQuery.FreeString = EvaluateFieldStr(ctx, input, singleQuery.FreeString)
			singleQuery.Extension = EvaluateFieldStr(ctx, input, singleQuery.Extension)
			singleQuery.PathPrefix = EvaluateFieldStrSlice(ctx, input, singleQuery.PathPrefix)
			singleQuery.Paths = EvaluateFieldStrSlice(ctx, input, singleQuery.Paths)
			singleQuery.UUIDs = EvaluateFieldStrSlice(ctx, input, singleQuery.UUIDs)
			c.Query.SubQueries[i], _ = ptypes.MarshalAny(singleQuery)
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
	q.ParseDurationDate()
	if (q.MinDate > 0 && node.MTime < q.MinDate) || (q.MaxDate > 0 && node.MTime > q.MaxDate) {
		return false
	}

	if (q.Type == tree.NodeType_COLLECTION && node.IsLeaf()) || (q.Type == tree.NodeType_LEAF && !node.IsLeaf()) {
		return false
	}

	if q.PathDepth > 0 && len(strings.Split(strings.Trim(node.Path, "/"), "/")) != int(q.PathDepth) {
		return false
	}

	if len(q.FileName) != 0 {
		// Basic search: can have wildcard on left, right, or none (exact search)
		nodeName := node.GetStringMeta("name")
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

	if len(q.Content) != 0 {
		// Read content??
	}

	if len(q.Extension) > 0 {
		// Can be "ext1,ext2,ext3"
		exts := strings.Split(q.Extension, ",")
		nodeName := node.GetStringMeta("name")
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
		if qu, e := getBleveQuery(q.FreeString); e == nil {
			b := getMemBleveIndex()
			iNode := tree.NewMemIndexableNode(node)
			if e := b.Index(node.Uuid, iNode); e == nil {
				log.Logger(context.Background()).Debug("Indexed node, now performing request", zap.Any("node", iNode), zap.Any("q", qu))
				defer b.Delete(node.Uuid)
			} else {
				log.Logger(context.Background()).Error("Cannot index node", zap.Any("node", iNode), zap.Error(e))
				return false
			}
			req := bleve.NewSearchRequest(qu)
			req.Size = 1
			if r, e := b.Search(req); e == nil {
				log.Logger(context.Background()).Debug("In-memory bleve filter received result", zap.Any("r.Total", r.Total))
				return r.Total > 0
			} else {
				log.Logger(context.Background()).Error("Cannot search on in-memory bleve index - Discarding event node", zap.Error(e))
				return false
			}
		} else {
			log.Logger(context.Background()).Error("Cannot parse FreeString query (bleve-style) - Discarding event node", zap.Error(e))
			return false
		}
	}

	return true
}

var (
	memBleveIndex   bleve.Index
	freeStringCache map[string]query.Query
)

func getBleveQuery(freeString string) (query.Query, error) {
	if freeStringCache == nil {
		freeStringCache = make(map[string]query.Query)
	}
	if q, ok := freeStringCache[freeString]; ok {
		return q, nil
	}
	q := query.NewQueryStringQuery(freeString)
	if qu, e := q.Parse(); e == nil {
		freeStringCache[freeString] = qu
		return qu, nil
	} else {
		return nil, e
	}
}

func getMemBleveIndex() bleve.Index {
	if memBleveIndex != nil {
		return memBleveIndex
	}
	mapping := bleve.NewIndexMapping()
	nodeMapping := bleve.NewDocumentMapping()
	mapping.AddDocumentMapping("node", nodeMapping)

	// Path to keyword
	pathFieldMapping := bleve.NewTextFieldMapping()
	pathFieldMapping.Analyzer = "keyword"
	nodeMapping.AddFieldMappingsAt("Path", pathFieldMapping)

	// Node type to keyword
	nodeType := bleve.NewTextFieldMapping()
	nodeType.Analyzer = "keyword"
	nodeMapping.AddFieldMappingsAt("NodeType", nodeType)

	// Extension to keyword
	extType := bleve.NewTextFieldMapping()
	extType.Analyzer = "keyword"
	nodeMapping.AddFieldMappingsAt("Extension", extType)

	// Modification Time as Date
	modifTime := bleve.NewDateTimeFieldMapping()
	nodeMapping.AddFieldMappingsAt("ModifTime", modifTime)

	// GeoPoint
	geoPosition := bleve.NewGeoPointFieldMapping()
	nodeMapping.AddFieldMappingsAt("GeoPoint", geoPosition)

	// Text Content
	textContent := bleve.NewTextFieldMapping()
	textContent.Analyzer = "en" // See detect_lang in the blevesearch/blevex package?
	textContent.Store = false
	textContent.IncludeInAll = false
	nodeMapping.AddFieldMappingsAt("TextContent", textContent)

	memBleveIndex, _ = bleve.NewMemOnly(mapping)
	return memBleveIndex
}
