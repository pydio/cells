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
	"path"
	"strings"

	"github.com/micro/go-micro/client"
	"github.com/micro/protobuf/ptypes"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/proto"
)

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

func (n *NodesSelector) MultipleSelection() bool {
	return n.Collect
}

/* ENRICH NodesSelector METHODS */

func (n *NodesSelector) Select(cl client.Client, ctx context.Context, objects chan interface{}, done chan bool) error {
	defer func() {
		done <- true
	}()
	if len(n.Pathes) > 0 {
		for _, p := range n.Pathes {
			objects <- &tree.Node{
				Path: p,
			}
		}
	} else {
		q := &tree.Query{}
		if n.Query == nil || n.Query.SubQueries == nil || len(n.Query.SubQueries) == 0 {
			return nil
		}

		e := ptypes.UnmarshalAny(n.Query.SubQueries[0], q)
		if e != nil {
			return e
		}
		// For simple/quick requests
		sName := common.SERVICE_TREE
		if q.FreeString != "" || q.Content != "" {
			// Use the Search Service instead
			sName = common.SERVICE_SEARCH
		}
		treeClient := tree.NewSearcherClient(common.SERVICE_GRPC_NAMESPACE_+sName, cl)
		sStream, eR := treeClient.Search(ctx, &tree.SearchRequest{
			Query:   q,
			Details: true,
		})
		if eR != nil {
			return eR
		}
		for {
			resp, rE := sStream.Recv()
			if rE != nil {
				break
			}
			if resp == nil {
				continue
			}
			log.Logger(ctx).Debug("Search Request with query received Node", resp.Node.ZapPath())
			objects <- resp.Node
		}
		log.Logger(ctx).Debug("Finished Search Request with query", zap.Any("q", q))
	}
	return nil
}

func (n *NodesSelector) Filter(input ActionMessage) ActionMessage {

	if len(input.Nodes) == 0 {
		return input
	}

	if n.All {
		return input
	}

	newNodes := []*tree.Node{}

	for _, node := range input.Nodes {

		if len(n.Pathes) > 0 {
			if !contains(n.Pathes, node.Path, false, false) {
				continue
			}
		}
		if n.Query != nil && len(n.Query.SubQueries) > 0 {
			// Parse only first level for the moment
			results := []bool{}
			for _, q := range n.Query.SubQueries {
				singleQuery := &tree.Query{}
				e := ptypes.UnmarshalAny(q, singleQuery)
				if e != nil {
					// LOG ERROR!
					continue
				}
				results = append(results, n.evaluateSingleQuery(singleQuery, node))
			}
			if !service.ReduceQueryBooleans(results, n.Query.Operation) {
				continue
			}
		}

		newNodes = append(newNodes, node)
	}
	output := input
	output.Nodes = newNodes
	return output

}

func (n *NodesSelector) evaluateSingleQuery(q *tree.Query, node *tree.Node) bool {

	if len(q.PathPrefix) > 0 {
		if !contains(q.PathPrefix, node.Path, true, false) {
			return false
		}
	}

	if (q.MinSize > 0 && node.Size < q.MinSize) || (q.MaxSize > 0 && node.Size > q.MaxSize) {
		return false
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

	return true
}
