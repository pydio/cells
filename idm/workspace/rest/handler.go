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

// Package rest provides a gateway to the underlying grpc service
package rest

import (
	"context"
	"fmt"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/commons"
	"github.com/pydio/cells/v4/common/client/commons/idmc"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/resources"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/permissions"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

// WorkspaceHandler defines the specific handler struc for workspace management.
type WorkspaceHandler struct {
	runtimeCtx context.Context
	resources.ResourceProviderHandler
	runtimeVirtualPathResolver permissions.VirtualPathResolver
}

// NewWorkspaceHandler simply creates and configures a handler.
func NewWorkspaceHandler(ctx context.Context) *WorkspaceHandler {
	h := new(WorkspaceHandler)
	h.runtimeCtx = ctx
	h.ServiceName = common.ServiceWorkspace
	h.ResourceName = "workspace"
	h.PoliciesLoader = h.loadPoliciesForResource
	return h
}

// SwaggerTags lists the names of the service tags declared in the swagger json implemented by this service.
func (h *WorkspaceHandler) SwaggerTags() []string {
	return []string{"WorkspaceService"}
}

// Filter returns a function to filter the swagger path.
func (h *WorkspaceHandler) Filter() func(string) string {
	return nil
}

func (h *WorkspaceHandler) virtualPathResolver() permissions.VirtualPathResolver {
	if h.runtimeVirtualPathResolver == nil {
		h.runtimeVirtualPathResolver = func(ctx context.Context, node *tree.Node) (*tree.Node, bool) {
			return abstract.GetVirtualNodesManager(h.runtimeCtx).ByUuid(node.Uuid)
		}
	}
	return h.runtimeVirtualPathResolver
}

func (h *WorkspaceHandler) PutWorkspace(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()
	var inputWorkspace idm.Workspace
	if err := req.ReadEntity(&inputWorkspace); err != nil {
		return err
	}
	if inputWorkspace.Slug == "" {
		inputWorkspace.Slug = req.PathParameter("Slug")
	}
	log.Logger(req.Request.Context()).Debug("Received Workspace.Put API request", zap.Any("inputWorkspace", &inputWorkspace))

	cli := idmc.WorkspaceServiceClient(ctx)
	update := false
	if ws, _ := h.workspaceById(ctx, inputWorkspace.UUID, cli); ws != nil {
		update = true
		if !h.MatchPolicies(ctx, ws.UUID, ws.Policies, service.ResourcePolicyAction_WRITE) {
			return errors.WithMessage(errors.StatusForbidden, "You are not allowed to edit this workspace")
		}
	} else {
		// Create a new Uuid
		if inputWorkspace.UUID == "" {
			inputWorkspace.UUID = uuid.New()
		}
		// If Policies are empty, create default policies
		if len(inputWorkspace.Policies) == 0 {
			inputWorkspace.Policies = []*service.ResourcePolicy{
				{Subject: "profile:standard", Action: service.ResourcePolicyAction_READ, Effect: service.ResourcePolicy_allow},
				{Subject: "profile:" + common.PydioProfileAdmin, Action: service.ResourcePolicyAction_WRITE, Effect: service.ResourcePolicy_allow},
			}
		}
	}

	defaultRights, quotaValue := permissions.ExtractDefaultRights(ctx, &inputWorkspace)

	// Additional check on workspaces roots
	if er := permissions.CheckDefinedRootsForWorkspace(ctx, &inputWorkspace, h.virtualPathResolver()); er != nil {
		return er
	}

	response, er := cli.CreateWorkspace(req.Request.Context(), &idm.CreateWorkspaceRequest{
		Workspace: &inputWorkspace,
	})
	if er != nil {

		return er
	}
	if e := permissions.StoreRootNodesAsACLs(ctx, &inputWorkspace, update); e != nil {
		return e
	}
	if e := permissions.ManageDefaultRights(ctx, &inputWorkspace, false, defaultRights, quotaValue); e != nil {
		return e
	}

	u := response.Workspace
	if e := permissions.ManageDefaultRights(ctx, u, true, "", ""); e != nil {
		log.Logger(ctx).Warn("Error while calling ManageDefaultRights", zap.Error(e))
	}
	we := rsp.WriteEntity(u)
	if update {
		log.Auditer(ctx).Info(
			fmt.Sprintf("Updated workspace [%s]", u.Slug),
			log.GetAuditId(common.AuditWsUpdate),
			u.ZapUuid(),
		)

	} else {
		log.Auditer(ctx).Info(
			fmt.Sprintf("Created workspace [%s]", u.Slug),
			log.GetAuditId(common.AuditWsCreate),
			u.ZapUuid(),
		)
	}
	return we

}

func (h *WorkspaceHandler) DeleteWorkspace(req *restful.Request, rsp *restful.Response) error {

	slug := req.PathParameter("Slug")
	log.Logger(req.Request.Context()).Debug("Received Workspace.Delete API request", zap.String("Slug", slug))
	singleQ := &idm.WorkspaceSingleQuery{}
	singleQ.Slug = slug

	query, _ := anypb.New(singleQ)
	serviceQuery := &service.Query{SubQueries: []*anypb.Any{query}}

	ctx := req.Request.Context()
	cli := idmc.WorkspaceServiceClient(ctx)

	var found bool
	stream, e := cli.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: serviceQuery})
	if e = commons.ForEach(stream, e, func(resp *idm.SearchWorkspaceResponse) error {
		found = true
		if !h.MatchPolicies(ctx, resp.Workspace.UUID, resp.Workspace.Policies, service.ResourcePolicyAction_WRITE) {
			log.Auditer(ctx).Error(
				fmt.Sprintf("Forbidden action could not delete workspace [%s]", slug),
				log.GetAuditId(common.AuditWsDelete),
			)
			return errors.WithMessage(errors.StatusForbidden, "You are not allowed to edit this workspace!")
		}
		return nil
	}); e == nil {
		return e
	}
	if !found {
		return errors.WithStack(errors.WorkspaceNotFound)
	}

	n, e := cli.DeleteWorkspace(req.Request.Context(), &idm.DeleteWorkspaceRequest{Query: serviceQuery})
	if e != nil {
		return e
	}

	log.Auditer(ctx).Info(
		fmt.Sprintf("Removed workspace [%s]", slug),
		log.GetAuditId(common.AuditWsDelete),
	)
	return rsp.WriteEntity(&rest.DeleteResponse{Success: true, NumRows: n.RowsDeleted})

}

func (h *WorkspaceHandler) SearchWorkspaces(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()
	var restRequest rest.SearchWorkspaceRequest
	if err := req.ReadEntity(&restRequest); err != nil {
		return err
	}

	// Transform to standard query
	query := &service.Query{
		Limit:     restRequest.Limit,
		Offset:    restRequest.Offset,
		GroupBy:   restRequest.GroupBy,
		Operation: restRequest.Operation,
	}

	for _, q := range restRequest.Queries {
		anyfied, _ := anypb.New(q)
		query.SubQueries = append(query.SubQueries, anyfied)
	}

	var er error
	if query.ResourcePolicyQuery, er = h.RestToServiceResourcePolicy(ctx, restRequest.ResourcePolicyQuery); er != nil {
		return errors.Tag(er, errors.StatusForbidden)
	}

	cli := idmc.WorkspaceServiceClient(ctx)

	collection := &rest.WorkspaceCollection{}
	var uuids []string
	wss := make(map[string]*idm.Workspace)

	streamer, err := cli.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{
		Query: query,
	})
	if err = commons.ForEach(streamer, err, func(resp *idm.SearchWorkspaceResponse) error {
		resp.Workspace.PoliciesContextEditable = h.IsContextEditable(ctx, resp.Workspace.UUID, resp.Workspace.Policies)
		uuids = append(uuids, resp.Workspace.UUID)
		wss[resp.Workspace.UUID] = resp.Workspace
		collection.Workspaces = append(collection.Workspaces, resp.Workspace)
		collection.Total++
		return nil
	}); err != nil {
		return err
	}
	if len(collection.Workspaces) > 0 {
		if e := permissions.LoadRootNodesForWorkspaces(ctx, uuids, wss, h.virtualPathResolver()); e != nil {
			log.Logger(ctx).Warn("Error while calling LoadRootNodesForWorkspaces", zap.Error(e))
		}
		if e := permissions.BulkReadDefaultRights(ctx, uuids, wss); e != nil {
			log.Logger(ctx).Warn("Error while calling BulkReadDefaultRights", zap.Error(e))
		}
	}
	return rsp.WriteEntity(collection)

}

func (h *WorkspaceHandler) loadPoliciesForResource(ctx context.Context, resourceId string, resourceClient interface{}) (policies []*service.ResourcePolicy, e error) {

	cli := (resourceClient).(idm.WorkspaceServiceClient)
	ws, err := h.workspaceById(ctx, resourceId, cli)
	if err != nil {
		return nil, err
	}
	if ws == nil {
		return
	}
	return ws.Policies, nil

}

func (h *WorkspaceHandler) workspaceById(ctx context.Context, wsId string, client idm.WorkspaceServiceClient) (*idm.Workspace, error) {

	if wsId == "" {
		return nil, nil
	}
	q, _ := anypb.New(&idm.WorkspaceSingleQuery{
		Uuid: wsId,
	})
	if client, err := client.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: &service.Query{SubQueries: []*anypb.Any{q}}}); err == nil {
		for {
			resp, e := client.Recv()
			if e != nil {
				break
			}
			if resp == nil {
				continue
			}
			return resp.Workspace, nil
		}

	} else {
		return nil, err
	}
	return nil, nil

}
