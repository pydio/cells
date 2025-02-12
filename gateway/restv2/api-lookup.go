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
	if input.Input == nil {
		return errors.WithMessage(errors.InvalidParameters, "please provide at least Locators or Query")
	}

	switch input.Input.(type) {
	case *rest.LookupRequest_Query:
		// Should switch to search
		searchRequest := &tree.SearchRequest{
			Query:       input.GetQuery(),
			Size:        int32(input.GetLimit()),
			From:        int32(input.GetOffset()),
			StatFlags:   h.parseFlags(input.GetFlags()),
			SortField:   input.GetSortField(),
			SortDirDesc: input.GetSortDirDesc(),
		}
		nn, coll.Facets, coll.Pagination, er = h.SearchHandler.PerformSearch(ctx, searchRequest)
		if er != nil {
			return er
		}
		coll.Nodes = h.TreeNodesToNodes(nn)

	case *rest.LookupRequest_Locators:
		if len(input.GetLocators().Many) == 0 {
			return errors.WithMessage(errors.InvalidParameters, "please provide at least path or uuid for locators")
		}
		var byUuids []string
		var byPaths []string
		for _, l := range input.GetLocators().Many {
			if l.GetPath() != "" {
				byPaths = append(byPaths, l.GetPath())
			} else if u := l.GetUuid(); u != "" {
				byUuids = append(byUuids, u)
			}
		}
		if len(byPaths) > 0 && len(byUuids) > 0 {
			return errors.WithMessage(errors.InvalidParameters, "do not mix uuid and path locators")
		} else if len(byPaths) == 0 && len(byUuids) == 0 {
			return errors.WithMessage(errors.InvalidParameters, "please provide at least path or uuid for locators")
		} else if len(byPaths) > 0 {
			// Use TreeHandler
			nn, coll.Pagination, er = h.TreeHandler.LoadNodes(ctx, &rest.GetBulkMetaRequest{
				NodePaths:   byPaths,
				Offset:      int32(input.GetOffset()),
				Limit:       int32(input.GetLimit()),
				SortField:   input.GetSortField(),
				SortDirDesc: input.GetSortDirDesc(),
			}, h.parseFlags(input.GetFlags()))
			if er != nil {
				return er
			}
			coll.Nodes = h.TreeNodesToNodes(nn)
		} else {
			router := h.UuidClient(true)
			for _, u := range byUuids {
				if rr, er := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: u}}); er != nil {
					return er
				} else {
					coll.Nodes = append(coll.Nodes, h.TreeNodeToNode(rr.GetNode()))
				}
			}
		}
	}
	// Make sure Nodes field is not empty but {}
	if coll.Nodes == nil {
		coll.Nodes = []*rest.Node{}
	}

	return resp.WriteEntity(coll)

}

// GetByUuid is a simple call on a node - it requires default stats
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

func (h *Handler) parseFlags(ff []rest.Flag) (flags tree.Flags) {
	for _, f := range ff {
		switch f {
		case rest.Flag_WithMetaCoreOnly:
			flags = append(flags, tree.StatFlagMetaMinimal)
		case rest.Flag_WithVersionsAll:
			flags = append(flags, tree.StatFlagVersionsAll)
		case rest.Flag_WithVersionsDraft:
			flags = append(flags, tree.StatFlagVersionsDraft)
		case rest.Flag_WithVersionsPublished:
			flags = append(flags, tree.StatFlagVersionsPublished)
		case rest.Flag_WithMetaNone:
			flags = append(flags, tree.StatFlagNone)
		}
	}
	return
}
