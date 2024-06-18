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

package rest

import (
	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/rest"
)

// ListSharedResources implements the corresponding Rest API operation
func (h *SharesHandler) ListSharedResources(req *restful.Request, rsp *restful.Response) error {

	var request rest.ListSharedResourcesRequest
	if e := req.ReadEntity(&request); e != nil {
		return e
	}
	if err := h.docStoreStatus(req.Request.Context()); err != nil {
		return err
	}
	response := &rest.ListSharedResourcesResponse{}

	ctx := req.Request.Context()
	var scope idm.WorkspaceScope
	switch request.ShareType {
	case rest.ListSharedResourcesRequest_ANY:
		scope = idm.WorkspaceScope_ANY
	case rest.ListSharedResourcesRequest_CELLS:
		scope = idm.WorkspaceScope_ROOM
	case rest.ListSharedResourcesRequest_LINKS:
		scope = idm.WorkspaceScope_LINK
	default:
		scope = idm.WorkspaceScope_ANY
	}
	rr, e := h.sc.ListSharedResources(ctx, request.Subject, scope, request.OwnedBySubject, h.ResourceProviderHandler)
	if e != nil {
		return e
	}

	for _, res := range rr {
		resource := &rest.ListSharedResourcesResponse_SharedResource{
			Node: res.Node,
		}
		for _, ws := range res.Workspaces {
			if ws.Scope == idm.WorkspaceScope_LINK {
				resource.Link = &rest.ShareLink{
					Uuid:                    ws.UUID,
					Label:                   ws.Label,
					Description:             ws.Description,
					Policies:                ws.Policies,
					PoliciesContextEditable: h.IsContextEditable(ctx, ws.UUID, ws.Policies),
				}
			} else {
				resource.Cells = append(resource.Cells, &rest.Cell{
					Uuid:                    ws.UUID,
					Label:                   ws.Label,
					Description:             ws.Description,
					Policies:                ws.Policies,
					PoliciesContextEditable: h.IsContextEditable(ctx, ws.UUID, ws.Policies),
				})
			}
		}
		response.Resources = append(response.Resources, resource)
	}

	return rsp.WriteEntity(response)

}
