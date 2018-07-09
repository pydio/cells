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
	"github.com/emicklei/go-restful"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/defaults"
	service2 "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils"
	"github.com/pydio/cells/common/views"
)

type GraphHandler struct {
	router *views.Router
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (h *GraphHandler) SwaggerTags() []string {
	return []string{"GraphService"}
}

// Filter returns a function to filter the swagger path
func (h *GraphHandler) Filter() func(string) string {
	return nil
}

func (h *GraphHandler) getRouter() *views.Router {
	if h.router == nil {
		h.router = views.NewStandardRouter(views.RouterOptions{WatchRegistry: true})
	}
	return h.router
}

// Alias for requests without roleID
func (h *GraphHandler) UserState(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	log.Logger(ctx).Debug("Received Graph.UserState API request for uuid")

	accessList, err := utils.AccessListFromContextClaims(ctx)
	if err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	state := &rest.UserStateResponse{
		Workspaces:         []*idm.Workspace{},
		WorkspacesAccesses: make(map[string]string),
	}
	accessListWsNodes := accessList.GetWorkspacesNodes()
	state.WorkspacesAccesses = accessList.GetAccessibleWorkspaces(ctx)

	wsCli := idm.NewWorkspaceServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_WORKSPACE, defaults.NewClient())
	query := &service2.Query{
		SubQueries: []*any.Any{},
		Operation:  service2.OperationType_OR,
	}
	for wsId, _ := range state.WorkspacesAccesses {
		q, _ := ptypes.MarshalAny(&idm.WorkspaceSingleQuery{
			Uuid: wsId,
		})
		query.SubQueries = append(query.SubQueries, q)
	}
	log.Logger(ctx).Debug("QUERY", zap.Any("q", query))
	streamer, e := wsCli.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: query})
	if e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	defer streamer.Close()
	for {
		resp, e := streamer.Recv()
		if resp == nil || e != nil {
			break
		}
		if resp.Workspace != nil {
			respWs := resp.Workspace
			for nodeId, _ := range accessListWsNodes[respWs.UUID] {
				respWs.RootUUIDs = append(respWs.RootUUIDs, nodeId)
			}
			state.Workspaces = append(state.Workspaces, respWs)
		}
	}
	rsp.WriteEntity(state)

}

// Compute workspaces shared in common, and teams belonging.
func (h *GraphHandler) Relation(req *restful.Request, rsp *restful.Response) {
	userName := req.PathParameter("UserId")
	ctx := req.Request.Context()

	// Find all workspaces in common
	contextAccessList, err := utils.AccessListFromContextClaims(ctx)
	if err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	targetUserAccessList, _, err := utils.AccessListFromUser(ctx, userName, false)
	if err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	// Intersect workspace nodes
	contextWorkspaces := contextAccessList.GetAccessibleWorkspaces(ctx)
	targetWorkspaces := targetUserAccessList.GetAccessibleWorkspaces(ctx)
	commonWorkspaces := map[string]string{}
	for uWs, _ := range contextWorkspaces {
		if _, has := targetWorkspaces[uWs]; has {
			commonWorkspaces[uWs] = uWs
		}
	}
	for tWs, _ := range targetWorkspaces {
		if _, has := targetWorkspaces[tWs]; has {
			commonWorkspaces[tWs] = tWs
		}
	}
	log.Logger(ctx).Debug("Common Workspaces", zap.Any("common", commonWorkspaces), zap.Any("context", contextWorkspaces), zap.Any("target", targetWorkspaces))

	wsCli := idm.NewWorkspaceServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_WORKSPACE, defaults.NewClient())
	query := &service2.Query{
		SubQueries: []*any.Any{},
		Operation:  service2.OperationType_OR,
	}
	// Cell Workspaces accessible by both users
	for wsId, _ := range commonWorkspaces {
		q, _ := ptypes.MarshalAny(&idm.WorkspaceSingleQuery{
			Uuid:  wsId,
			Scope: idm.WorkspaceScope_ROOM,
		})
		query.SubQueries = append(query.SubQueries, q)
	}

	log.Logger(ctx).Info("QUERY", zap.Any("q", query))
	streamer, e := wsCli.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: query})
	if e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	defer streamer.Close()
	responseObject := &rest.RelationResponse{}
	for {
		resp, e := streamer.Recv()
		if resp == nil || e != nil {
			break
		}
		responseObject.SharedCells = append(responseObject.SharedCells, resp.Workspace)
	}

	// Load the current user teams, to check if the current user is part of one of them
	roleCli := idm.NewRoleServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, defaults.NewClient())
	var uuids []string
	for _, role := range targetUserAccessList.OrderedRoles {
		uuids = append(uuids, role.Uuid)
	}
	roleQ, _ := ptypes.MarshalAny(&idm.RoleSingleQuery{
		Uuid:   uuids,
		IsTeam: true,
	})
	limitSubjects, _ := auth.SubjectsForResourcePolicyQuery(ctx, &rest.ResourcePolicyQuery{Type: rest.ResourcePolicyQuery_CONTEXT})
	rStreamer, e := roleCli.SearchRole(ctx, &idm.SearchRoleRequest{
		Query: &service2.Query{
			SubQueries: []*any.Any{roleQ},
			ResourcePolicyQuery: &service2.ResourcePolicyQuery{
				Subjects: limitSubjects,
			},
		},
	})
	if e != nil {
		return
	}
	defer rStreamer.Close()
	for {
		roleResp, er := rStreamer.Recv()
		if er != nil {
			break
		}
		if roleResp == nil {
			continue
		}
		responseObject.BelongsToTeams = append(responseObject.BelongsToTeams, roleResp.Role)
	}

	rsp.WriteEntity(responseObject)

}
