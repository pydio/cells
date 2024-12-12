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

	"github.com/pydio/cells/v5/common/errors"
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

	if input.GetQuery() != nil {

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

	} else {

		// Switch to Tree Nodes
		metaRequest := &rest.GetBulkMetaRequest{
			AllMetaProviders: !tree.StatFlags(input.GetStatFlags()).MinimalMetas(),
			Offset:           int32(input.GetOffset()),
			Limit:            int32(input.GetLimit()),
			SortField:        input.GetSortField(),
			SortDirDesc:      input.GetSortDirDesc(),
		}
		// Todo: Handle Uuid Case
		for _, l := range input.GetLocators() {
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

func (h *Handler) GetByPath(req *restful.Request, resp *restful.Response) error {
	nPath := req.PathParameter("Path")
	nn, _, er := h.TreeHandler.LoadNodes(req.Request.Context(), &rest.GetBulkMetaRequest{
		NodePaths:        []string{nPath},
		AllMetaProviders: true,
	})
	if er != nil {
		return er
	}
	if len(nn) == 0 {
		return errors.Tag(er, errors.NodeNotFound)
	}
	return resp.WriteEntity(h.TreeNodeToNode(nn[0]))
}

func (h *Handler) GetByUuid(req *restful.Request, resp *restful.Response) error {
	//nPath := req.PathParameter("Uuid")
	return errors.WithMessage(errors.StatusNotImplemented, "method not implemented yet")
}

func (h *Handler) ListVersions(req *restful.Request, resp *restful.Response) error {
	return errors.WithMessage(errors.StatusNotImplemented, "method not implemented yet")
}
