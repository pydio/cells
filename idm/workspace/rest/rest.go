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
	"github.com/pydio/cells/v4/common/client/grpc"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/proto/service"
	service2 "github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/service/resources"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

// WorkspaceHandler defines the specific handler struc for workspace management.
type WorkspaceHandler struct {
	runtimeCtx context.Context
	resources.ResourceProviderHandler
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

func (h *WorkspaceHandler) PutWorkspace(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	var inputWorkspace idm.Workspace
	err := req.ReadEntity(&inputWorkspace)
	if err != nil {
		log.Logger(ctx).Error("cannot fetch idm.Workspace from request", zap.Error(err))
		service2.RestError500(req, rsp, err)
		return
	}
	log.Logger(req.Request.Context()).Debug("Received Workspace.Put API request", zap.Any("inputWorkspace", inputWorkspace))

	cli := idm.NewWorkspaceServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceWorkspace))
	update := false
	if ws, _ := h.workspaceById(ctx, inputWorkspace.UUID, cli); ws != nil {
		update = true
		if !h.MatchPolicies(ctx, ws.UUID, ws.Policies, service.ResourcePolicyAction_WRITE) {
			service2.RestError403(req, rsp, errors.Forbidden(common.ServiceWorkspace, "You are not allowed to edit this workspace"))
			return
		}
		// Check that slug is not already in use
		if ws.Slug != inputWorkspace.Slug {
			h.deduplicateSlug(ctx, &inputWorkspace, cli)
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
		// Check that slug is not already in use
		h.deduplicateSlug(ctx, &inputWorkspace, cli)
	}

	defaultRights, quotaValue := h.extractDefaultRights(ctx, &inputWorkspace)

	// Additional check on workspaces roots
	if er := h.checkDefinedRootsForWorkspace(ctx, &inputWorkspace); er != nil {
		log.Logger(ctx).Error("Cannot create workspace on a non-existing node")
		service2.RestError404(req, rsp, er)
		return
	}

	response, er := cli.CreateWorkspace(req.Request.Context(), &idm.CreateWorkspaceRequest{
		Workspace: &inputWorkspace,
	})
	if er != nil {
		service2.RestError500(req, rsp, er)
		return
	}
	if e := h.storeRootNodesAsACLs(ctx, &inputWorkspace, update); e != nil {
		service2.RestError500(req, rsp, e)
		return
	}
	if e := h.manageDefaultRights(ctx, &inputWorkspace, false, defaultRights, quotaValue); e != nil {
		service2.RestError500(req, rsp, e)
		return
	}

	u := response.Workspace
	h.manageDefaultRights(ctx, u, true, "", "")
	rsp.WriteEntity(u)
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
}

func (h *WorkspaceHandler) DeleteWorkspace(req *restful.Request, rsp *restful.Response) {

	slug := req.PathParameter("Slug")
	log.Logger(req.Request.Context()).Debug("Received Workspace.Delete API request", zap.String("Slug", slug))
	singleQ := &idm.WorkspaceSingleQuery{}
	singleQ.Slug = slug

	query, _ := anypb.New(singleQ)
	serviceQuery := &service.Query{SubQueries: []*anypb.Any{query}}

	ctx := req.Request.Context()
	cli := idm.NewWorkspaceServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceWorkspace))

	if stream, e := cli.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: serviceQuery}); e == nil {
		defer stream.CloseSend()
		for {
			resp, err := stream.Recv()
			if err != nil {
				break
			}
			if resp == nil {
				continue
			}
			if !h.MatchPolicies(ctx, resp.Workspace.UUID, resp.Workspace.Policies, service.ResourcePolicyAction_WRITE) {
				log.Auditer(ctx).Error(
					fmt.Sprintf("Forbidden action could not delete workspace [%s]", slug),
					log.GetAuditId(common.AuditWsDelete),
				)
				service2.RestError403(req, rsp, errors.Forbidden(common.ServiceWorkspace, "You are not allowed to edit this workspace!"))
				return
			}
		}
	}

	n, e := cli.DeleteWorkspace(req.Request.Context(), &idm.DeleteWorkspaceRequest{Query: serviceQuery})
	if e != nil {
		service2.RestError500(req, rsp, e)
	} else {
		log.Auditer(ctx).Info(
			fmt.Sprintf("Removed workspace [%s]", slug),
			log.GetAuditId(common.AuditWsDelete),
		)
		rsp.WriteEntity(&rest.DeleteResponse{Success: true, NumRows: n.RowsDeleted})
	}

}

func (h *WorkspaceHandler) SearchWorkspaces(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	var restRequest rest.SearchWorkspaceRequest
	err := req.ReadEntity(&restRequest)
	if err != nil {
		service2.RestError500(req, rsp, err)
		return
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
		log.Logger(ctx).Error("403", zap.Error(er))
		service2.RestError403(req, rsp, er)
		return
	}

	cli := idm.NewWorkspaceServiceClient(grpc.GetClientConnFromCtx(ctx, common.ServiceWorkspace))

	streamer, err := cli.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{
		Query: query,
	})
	if err != nil {
		service2.RestError500(req, rsp, err)
		return
	}
	defer streamer.CloseSend()
	collection := &rest.WorkspaceCollection{}
	var uuids []string
	wss := make(map[string]*idm.Workspace)
	for {
		resp, e := streamer.Recv()
		if e != nil {
			break
		}
		if resp == nil {
			continue
		}
		resp.Workspace.PoliciesContextEditable = h.IsContextEditable(ctx, resp.Workspace.UUID, resp.Workspace.Policies)
		uuids = append(uuids, resp.Workspace.UUID)
		wss[resp.Workspace.UUID] = resp.Workspace
		collection.Workspaces = append(collection.Workspaces, resp.Workspace)
		collection.Total++
	}
	if len(collection.Workspaces) > 0 {
		h.loadRootNodesForWorkspaces(ctx, uuids, wss)
		h.bulkReadDefaultRights(ctx, uuids, wss)
	}
	rsp.WriteEntity(collection)

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

		defer client.CloseSend()
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

func (h *WorkspaceHandler) deduplicateSlug(ctx context.Context, workspace *idm.Workspace, client idm.WorkspaceServiceClient) {

	// Check that slug is not already in use
	baseSlug := workspace.Slug
	index := 0
	for {
		if existing, _ := h.workspaceBySlug(ctx, workspace.Slug, client); existing != nil {
			index++
			workspace.Slug = fmt.Sprintf("%s-%d", baseSlug, index)
		} else {
			break
		}
	}

}

func (h *WorkspaceHandler) workspaceBySlug(ctx context.Context, slug string, client idm.WorkspaceServiceClient) (*idm.Workspace, error) {

	q, _ := anypb.New(&idm.WorkspaceSingleQuery{
		Slug: slug,
	})
	if client, err := client.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: &service.Query{SubQueries: []*anypb.Any{q}}}); err == nil {

		defer client.CloseSend()
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
