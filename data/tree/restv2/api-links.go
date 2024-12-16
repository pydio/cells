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
	"slices"

	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
)

// CreatePublicLink responds to POST /node/link/{Uuid}/link
// InputBody rest.PublicLinkRequest | Output rest.ShareLink
func (h *Handler) CreatePublicLink(req *restful.Request, resp *restful.Response) error {
	nodeUuid := req.PathParameter("Uuid")
	in := &rest.PublicLinkRequest{}
	if err := req.ReadEntity(in); err != nil {
		return err
	}
	ctx := req.Request.Context()
	// Find node by Uuid and append it to root node
	rr, er := h.UuidClient(false).ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: nodeUuid}})
	if er != nil {
		return er
	}
	// Update defaults
	in.Link.ViewTemplateName = h.linkTemplateName(in.Link, rr.GetNode())
	in.Link.RootNodes = []*tree.Node{rr.GetNode()}

	link, er := h.SharesHandler.PutOrUpdateShareLink(ctx, in.GetLink(), in)
	if er != nil {
		return er
	}

	return resp.WriteEntity(link)
}

// UpdatePublicLink responds to PATCH /node/link/{LinkUuid}
// Input rest.PublicLinkRequest | Output rest.ShareLink, Path Parameters {Uuid}
func (h *Handler) UpdatePublicLink(req *restful.Request, resp *restful.Response) error {
	in := &rest.PublicLinkRequest{}
	if err := req.ReadEntity(in); err != nil {
		return err
	}
	in.Link.Uuid = req.PathParameter("LinkUuid")
	// Load root node to check
	if len(in.Link.RootNodes) == 0 {
		return errors.WithMessage(errors.StatusBadRequest, "cannot update link without root")
	}
	ctx := req.Request.Context()
	router := h.UuidClient(false)
	rr, er := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: in.Link.RootNodes[0]})
	if er != nil {
		return er
	}
	// Update defaults (permissions may have changed)
	in.Link.ViewTemplateName = h.linkTemplateName(in.Link, rr.GetNode())

	// Update Link
	link, er := h.SharesHandler.PutOrUpdateShareLink(ctx, in.GetLink(), in)
	if er != nil {
		return er
	}

	return resp.WriteEntity(link)
}

// GetPublicLink responds to GET /node/link/{LinkUuid}
// Output rest.ShareLink
func (h *Handler) GetPublicLink(req *restful.Request, resp *restful.Response) error {
	uuid := req.PathParameter("LinkUuid")
	ctx := req.Request.Context()

	link, er := h.SharesHandler.GetShareClient().LinkById(ctx, uuid)
	if er != nil {
		return er
	}
	return resp.WriteEntity(link)
}

// DeletePublicLink responds to DELETE /node/link/{Uuid}
// Output rest.PublicLinkDeleteSuccess
func (h *Handler) DeletePublicLink(req *restful.Request, resp *restful.Response) error {
	uuid := req.PathParameter("LinkUuid")
	ctx := req.Request.Context()

	err := h.SharesHandler.GetShareClient().DeleteLink(ctx, uuid)
	if err != nil {
		return err
	}

	return resp.WriteEntity(&rest.PublicLinkDeleteSuccess{
		Uuid:    uuid,
		Message: "Successfully deleted",
	})
}

func (h *Handler) linkTemplateName(link *rest.ShareLink, node *tree.Node) string {
	// If a custom value is used, ignore
	if link.ViewTemplateName != "" && !slices.Contains([]string{"pydio_unique_strip", "pydio_unique_dl", "pydio_shared_folder"}, link.ViewTemplateName) {
		return link.ViewTemplateName
	}
	// Otherwise recheck match between node type and permissions
	if node.IsLeaf() {
		var preview bool
		for _, perm := range link.Permissions {
			if perm == rest.ShareLinkAccessType_Preview {
				preview = true
				break
			}
		}
		if preview {
			return "pydio_unique_strip"
		} else {
			return "pydio_unique_dl"
		}
	} else {
		return "pydio_shared_folder"
	}
}
