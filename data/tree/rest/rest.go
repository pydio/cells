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

// Package rest exposes a simple API used by admins to query the whole tree directly without going through routers.
package rest

import (
	"context"
	"strings"

	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v5/common/client/commons"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/middleware"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	rest_meta "github.com/pydio/cells/v5/data/meta/rest"
	"github.com/pydio/cells/v5/scheduler/jobs/userspace"
)

type Handler struct {
	rest_meta.Handler
}

var (
	providerClient tree.NodeProviderClient
)

func getClient(ctx context.Context) tree.NodeProviderClient {
	if providerClient == nil {
		providerClient = compose.PathClient(nodes.AsAdmin(), nodes.WithVirtualNodesBrowsing())
	}
	return providerClient
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (h *Handler) SwaggerTags() []string {
	return []string{"TreeService", "AdminTreeService"}
}

// Filter returns a function to filter the swagger path
func (h *Handler) Filter() func(string) string {
	return func(s string) string {
		return strings.Replace(s, "{Node}", "{Node:*}", 1)
	}
}

func (h *Handler) BulkStatNodes(req *restful.Request, resp *restful.Response) error {

	// This is exactly the same a MetaService => BulkStatNodes
	return h.GetBulkMeta(req, resp)

}

func (h *Handler) HeadNode(req *restful.Request, resp *restful.Response) error {

	nodeRequest := &tree.ReadNodeRequest{
		Node: &tree.Node{
			Path: req.PathParameter("Node"),
		},
	}

	router := h.GetRouter()

	response, err := router.ReadNode(req.Request.Context(), nodeRequest)
	if err != nil {
		return err
	}

	response.Node = response.Node.WithoutReservedMetas()
	return resp.WriteEntity(response)

}

func (h *Handler) CreateNodes(req *restful.Request, resp *restful.Response) error {

	var input rest.CreateNodesRequest
	if e := req.ReadEntity(&input); e != nil {
		return e
	}
	if len(input.Nodes) == 0 {
		return errors.WithMessage(errors.InvalidParameters, "please provide at least one node to create")
	}

	ctx := req.Request.Context()
	nn, er := userspace.MkDirsOrFiles(ctx, h.GetRouter(), input.Nodes, input.Recursive, input.TemplateUUID)
	if er != nil {
		return er
	}
	return resp.WriteEntity(&rest.NodesCollection{Children: nn})

}

// DeleteNodes either moves to recycle bin or definitively removes nodes.
func (h *Handler) DeleteNodes(req *restful.Request, resp *restful.Response) error {

	var input rest.DeleteNodesRequest
	if e := req.ReadEntity(&input); e != nil {
		return e
	} else if len(input.Nodes) == 0 {
		return errors.WithMessage(errors.InvalidParameters, "please provide at least one node")
	}
	ctx := req.Request.Context()
	languages := middleware.DetectedLanguages(ctx)
	var paths []string
	for _, n := range input.Nodes {
		paths = append(paths, n.GetPath())
	}
	jj, er := userspace.DeleteNodesTask(ctx, h.GetRouter(), paths, input.RemovePermanently, languages...)
	if er != nil {
		return errors.Tag(er, errors.StatusInternalServerError)
	}
	output := &rest.DeleteNodesResponse{}
	for _, j := range jj {
		output.DeleteJobs = append(output.DeleteJobs, &rest.BackgroundJobResult{Uuid: j.GetID(), Label: j.GetLabel()})
	}
	return resp.WriteEntity(output)

}

// CreateSelection creates a temporary selection to be stored and used by a later action, currently only download.
func (h *Handler) CreateSelection(req *restful.Request, resp *restful.Response) error {

	var input rest.CreateSelectionRequest
	if e := req.ReadEntity(&input); e != nil {
		return e
	} else if len(input.Nodes) == 0 {
		return errors.WithMessage(errors.InvalidParameters, "please provide at least one node")
	}
	selectionUuid, err := userspace.PersistSelection(req.Request.Context(), input.Nodes)
	if err != nil {
		return err
	}
	response := &rest.CreateSelectionResponse{
		Nodes:         input.Nodes,
		SelectionUUID: selectionUuid,
	}
	return resp.WriteEntity(response)

}

// RestoreNodes moves corresponding nodes to their initial location before deletion.
func (h *Handler) RestoreNodes(req *restful.Request, resp *restful.Response) error {

	var input rest.RestoreNodesRequest
	if e := req.ReadEntity(&input); e != nil {
		return e
	} else if len(input.Nodes) == 0 {
		return errors.WithMessage(errors.InvalidParameters, "please provide at least one node")
	}
	output := &rest.RestoreNodesResponse{}
	ctx := req.Request.Context()
	languages := middleware.DetectedLanguages(ctx)
	router := h.GetRouter()
	var pp []string
	for _, n := range input.Nodes {
		pp = append(pp, n.GetPath())
	}

	jj, nn, er := userspace.RestoreTask(ctx, router, pp, languages...)
	if er != nil {
		return errors.Tag(er, errors.StatusInternalServerError)
	}
	for idx, j := range jj {
		output.RestoreJobs = append(output.RestoreJobs, &rest.BackgroundJobResult{
			Uuid:     j.GetID(),
			Label:    j.GetLabel(),
			NodeUuid: nn[idx].GetUuid(),
		})
	}
	return resp.WriteEntity(output)

}

func (h *Handler) ListAdminTree(req *restful.Request, resp *restful.Response) error {

	var input tree.ListNodesRequest
	if err := req.ReadEntity(&input); err != nil {
		return err
	}
	ctx := req.Request.Context()

	parentResp, err := getClient(ctx).ReadNode(ctx, &tree.ReadNodeRequest{
		Node:      input.Node,
		StatFlags: input.StatFlags,
	})
	if err != nil {
		return err
	}

	streamer, err := getClient(ctx).ListNodes(ctx, &input)
	output := &rest.NodesCollection{
		Parent: parentResp.Node.WithoutReservedMetas(),
	}
	if er := commons.ForEach(streamer, err, func(t *tree.ListNodesResponse) error {
		output.Children = append(output.Children, t.GetNode().WithoutReservedMetas())
		return nil
	}); er != nil {
		return err
	}

	return resp.WriteEntity(output)

}

func (h *Handler) StatAdminTree(req *restful.Request, resp *restful.Response) error {

	var input tree.ReadNodeRequest
	if err := req.ReadEntity(&input); err != nil {
		return err
	}
	ctx := req.Request.Context()

	response, err := getClient(ctx).ReadNode(ctx, &input)
	if err != nil {
		return err
	}

	response.Node = response.Node.WithoutReservedMetas()
	return resp.WriteEntity(response)

}
