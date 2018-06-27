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

	"github.com/emicklei/go-restful"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	service2 "github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/service/resources"
)

// Handler definition
type WorkspaceHandler struct {
	resources.ResourceProviderHandler
}

func NewWorkspaceHandler() *WorkspaceHandler {
	h := new(WorkspaceHandler)
	h.ServiceName = common.SERVICE_WORKSPACE
	h.ResourceName = "workspace"
	h.PoliciesLoader = h.loadPoliciesForResource
	return h
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (h *WorkspaceHandler) SwaggerTags() []string {
	return []string{"WorkspaceService"}
}

// Filter returns a function to filter the swagger path
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

	cli := idm.NewWorkspaceServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_WORKSPACE, defaults.NewClient())

	if ws, _ := h.workspaceById(ctx, inputWorkspace.UUID, cli); ws != nil {
		if !h.MatchPolicies(ctx, ws.UUID, ws.Policies, service.ResourcePolicyAction_WRITE) {
			service2.RestError403(req, rsp, errors.Forbidden(common.SERVICE_WORKSPACE, "You are not allowed to edit this workspace"))
			return
		}
	}

	response, er := cli.CreateWorkspace(req.Request.Context(), &idm.CreateWorkspaceRequest{
		Workspace: &inputWorkspace,
	})
	if er != nil {
		service2.RestError500(req, rsp, er)
	} else {
		u := response.Workspace
		log.Auditer(ctx).Info(
			fmt.Sprintf("Workspace %s has been saved", u.Slug),
			log.GetAuditId(common.AUDIT_WS_UPDATE),
			u.ZapUuid(),
		)
		rsp.WriteEntity(u)
	}

}

func (h *WorkspaceHandler) DeleteWorkspace(req *restful.Request, rsp *restful.Response) {

	slug := req.PathParameter("Slug")
	log.Logger(req.Request.Context()).Debug("Received Workspace.Delete API request", zap.String("Slug", slug))
	singleQ := &idm.WorkspaceSingleQuery{}
	singleQ.Slug = slug

	query, _ := ptypes.MarshalAny(singleQ)
	serviceQuery := &service.Query{SubQueries: []*any.Any{query}}

	ctx := req.Request.Context()
	cli := idm.NewWorkspaceServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_WORKSPACE, defaults.NewClient())

	if stream, e := cli.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: serviceQuery}); e == nil {
		defer stream.Close()
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
					fmt.Sprintf("Error while trying to delete forbidden workspace %s", slug),
					log.GetAuditId(common.AUDIT_WS_DELETE),
				)
				service2.RestError403(req, rsp, errors.Forbidden(common.SERVICE_WORKSPACE, "You are not allowed to edit this workspace!"))
				return
			}
		}
	}

	n, e := cli.DeleteWorkspace(req.Request.Context(), &idm.DeleteWorkspaceRequest{Query: serviceQuery})
	if e != nil {
		service2.RestError500(req, rsp, e)
	} else {
		log.Auditer(ctx).Info(
			fmt.Sprintf("Workspace %s has been removed", slug),
			log.GetAuditId(common.AUDIT_WS_DELETE),
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
		anyfied, _ := ptypes.MarshalAny(q)
		query.SubQueries = append(query.SubQueries, anyfied)
	}

	var er error
	if query.ResourcePolicyQuery, er = h.RestToServiceResourcePolicy(ctx, restRequest.ResourcePolicyQuery); er != nil {
		log.Logger(ctx).Error("403", zap.Error(er))
		service2.RestError403(req, rsp, er)
		return
	}

	cli := idm.NewWorkspaceServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_WORKSPACE, defaults.NewClient())

	streamer, err := cli.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{
		Query: query,
	})
	if err != nil {
		service2.RestError500(req, rsp, err)
		return
	}
	defer streamer.Close()
	collection := &rest.WorkspaceCollection{}
	for {
		resp, e := streamer.Recv()
		if e != nil {
			break
		}
		if resp == nil {
			continue
		}
		resp.Workspace.PoliciesContextEditable = h.IsContextEditable(ctx, resp.Workspace.UUID, resp.Workspace.Policies)
		collection.Workspaces = append(collection.Workspaces, resp.Workspace)
		collection.Total++
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

	q, _ := ptypes.MarshalAny(&idm.WorkspaceSingleQuery{
		Uuid: wsId,
	})
	if client, err := client.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: &service.Query{SubQueries: []*any.Any{q}}}); err == nil {

		defer client.Close()
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
