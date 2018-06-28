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

// Package rest exposes a simple API used by admins to query the whole tree directly without going through routers.
package rest

import (
	"github.com/emicklei/go-restful"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/views"
	rest_meta "github.com/pydio/cells/data/meta/rest"
	"go.uber.org/zap"
	"gopkg.in/h2non/gentleman.v1/utils"
)

type Handler struct {
	rest_meta.Handler
}

var (
	providerClient tree.NodeProviderClient
)

func getClient() tree.NodeProviderClient {
	if providerClient == nil {
		providerClient = views.NewStandardRouter(views.RouterOptions{AdminView: true, BrowseVirtualNodes: true, AuditEvent: false})
	}
	return providerClient
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (a *Handler) SwaggerTags() []string {
	return []string{"TreeService", "AdminTreeService"}
}

// Filter returns a function to filter the swagger path
func (a *Handler) Filter() func(string) string {
	return nil
}

func (h *Handler) BulkStatNodes(req *restful.Request, resp *restful.Response) {

	// This is exactly the same a MetaService => BulkStatNodes
	h.GetBulkMeta(req, resp)

}

func (h *Handler) CreateNodes(req *restful.Request, resp *restful.Response) {

	var input rest.CreateNodesRequest
	if e := req.ReadEntity(&input); e != nil {
		service.RestError500(req, resp, e)
		return
	}
	ctx := req.Request.Context()
	output := &rest.NodesCollection{}

	log.Logger(ctx).Info("Got CreateNodes Request", zap.Any("r", input))
	router := h.GetRouter()
	for _, n := range input.Nodes {
		if !n.IsLeaf() {
			r, e := router.CreateNode(ctx, &tree.CreateNodeRequest{Node: n})
			if e != nil {
				service.RestError500(req, resp, e)
				return
			}
			output.Children = append(output.Children, r.Node)
		} else {
			_, e := router.PutObject(ctx, n, utils.StringReader(" "), &views.PutRequestData{Size: 1})
			if e != nil {
				service.RestError500(req, resp, e)
				return
			}
			output.Children = append(output.Children, n)
		}
	}

	resp.WriteEntity(output)

}

func (h *Handler) ListAdminTree(req *restful.Request, resp *restful.Response) {

	var input tree.ListNodesRequest
	if err := req.ReadEntity(&input); err != nil {
		resp.WriteError(500, err)
		return
	}

	parentResp, err := getClient().ReadNode(req.Request.Context(), &tree.ReadNodeRequest{
		Node:        input.Node,
		WithCommits: input.WithCommits,
	})
	if err != nil {
		resp.WriteError(404, err)
		return
	}

	streamer, err := getClient().ListNodes(req.Request.Context(), &input)
	if err != nil {
		resp.WriteError(500, err)
		return
	}
	defer streamer.Close()
	output := &rest.NodesCollection{
		Parent: parentResp.Node.WithoutReservedMetas(),
	}
	for {
		if resp, e := streamer.Recv(); e == nil {
			if resp.Node == nil {
				continue
			}
			output.Children = append(output.Children, resp.Node.WithoutReservedMetas())
		} else {
			break
		}
	}

	resp.WriteEntity(output)

}

func (h *Handler) StatAdminTree(req *restful.Request, resp *restful.Response) {

	var input tree.ReadNodeRequest
	if err := req.ReadEntity(&input); err != nil {
		resp.WriteError(500, err)
		return
	}

	response, err := getClient().ReadNode(req.Request.Context(), &input)
	if err != nil {
		resp.WriteError(500, err)
		return
	}

	response.Node = response.Node.WithoutReservedMetas()
	resp.WriteEntity(response)

}
