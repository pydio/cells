/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package restv2

import (
	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v5/common/client/commons"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
)

// Lookup Combines LS and FIND in one endpoint
func (h *Handler) Lookup(req *restful.Request, resp *restful.Response) error {

	input := &rest.LookupRequest{}
	if err := req.ReadEntity(input); err != nil {
		return err
	}
	ctx := req.Request.Context()
	coll := &rest.NodeCollection{}
	var nn []*tree.Node
	var er error

	switch input.Input.(type) {
	case *rest.LookupRequest_Query:
		// Should switch to search
		searchRequest := &tree.SearchRequest{
			Query:       input.GetQuery(),
			Size:        int32(input.GetLimit()),
			From:        int32(input.GetOffset()),
			StatFlags:   input.GetStatFlags(),
			SortField:   input.GetSortField(),
			SortDirDesc: input.GetSortDirDesc(),
		}
		nn, coll.Facets, coll.Pagination, er = h.SearchHandler.PerformSearch(ctx, searchRequest)
		if er != nil {
			return er
		}
		coll.Nodes = h.TreeNodesToNodes(nn)

	case *rest.LookupRequest_Locators:
		// Switch to Tree Nodes
		metaRequest := &rest.GetBulkMetaRequest{
			AllMetaProviders: !tree.StatFlags(input.GetStatFlags()).MinimalMetas(),
			Offset:           int32(input.GetOffset()),
			Limit:            int32(input.GetLimit()),
			SortField:        input.GetSortField(),
			SortDirDesc:      input.GetSortDirDesc(),
		}
		// Todo: Handle Uuid Case ?
		for _, l := range input.GetLocators().Many {
			metaRequest.NodePaths = append(metaRequest.NodePaths, l.GetPath())
		}
		nn, coll.Pagination, er = h.TreeHandler.LoadNodes(ctx, metaRequest)
		if er != nil {
			return er
		}
		coll.Nodes = h.TreeNodesToNodes(nn)
	}

	return resp.WriteEntity(coll)

}

// GetByUuid is a simple call on a node
func (h *Handler) GetByUuid(req *restful.Request, resp *restful.Response) error {
	nodeUuid := req.PathParameter("Uuid")
	router := h.UuidClient(true)
	ctx := req.Request.Context()
	rr, er := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: nodeUuid}})
	if er != nil {
		return er
	}
	return resp.WriteEntity(h.TreeNodeToNode(rr.GetNode()))
}

// ListVersions lists all versions of a node
func (h *Handler) ListVersions(req *restful.Request, resp *restful.Response) error {
	nodeUuid := req.PathParameter("Uuid")
	ctx := req.Request.Context()
	rn, er := h.UuidClient(true).ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: nodeUuid}})
	if er != nil {
		return er
	}
	node := rn.GetNode()
	st, er := compose.PathClient().ListNodes(ctx, &tree.ListNodesRequest{
		Node:         node,
		WithVersions: true,
	})
	if er != nil {
		return er
	}
	var nn []*rest.Node
	er = commons.ForEach(st, er, func(response *tree.ListNodesResponse) error {
		vNode := response.GetNode()
		nn = append(nn, h.TreeNodeToNode(vNode))
		return nil
	})
	if er != nil {
		return er
	}
	return resp.WriteEntity(&rest.NodeCollection{Nodes: nn})
}
