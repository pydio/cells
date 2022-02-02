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
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/client/grpc"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/rest"
	service2 "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/utils/permissions"
)

// ListSharedResources implements the corresponding Rest API operation
func (h *SharesHandler) ListSharedResources(req *restful.Request, rsp *restful.Response) {

	var request rest.ListSharedResourcesRequest
	if e := req.ReadEntity(&request); e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	if err := h.docStoreStatus(req.Request.Context()); err != nil {
		service.RestErrorDetect(req, rsp, err)
		return
	}

	ctx := req.Request.Context()
	var subjects []string
	admin := false
	var userId string
	if claims, ok := ctx.Value(claim.ContextKey).(claim.Claims); ok {
		admin = claims.Profile == common.PydioProfileAdmin
		userId = claims.Subject
	}
	if request.Subject != "" {
		if !admin {
			service.RestError403(req, rsp, fmt.Errorf("only admins can specify a subject"))
			return
		}
		subjects = append(subjects, request.Subject)
	} else {
		var e error
		if subjects, e = auth.SubjectsForResourcePolicyQuery(ctx, &rest.ResourcePolicyQuery{Type: rest.ResourcePolicyQuery_CONTEXT}); e != nil {
			service.RestError500(req, rsp, e)
			return
		}
	}

	var qs []*anypb.Any
	if request.ShareType == rest.ListSharedResourcesRequest_CELLS || request.ShareType == rest.ListSharedResourcesRequest_ANY {
		q, _ := anypb.New(&idm.WorkspaceSingleQuery{Scope: idm.WorkspaceScope_ROOM})
		qs = append(qs, q)
	}
	if request.ShareType == rest.ListSharedResourcesRequest_LINKS || request.ShareType == rest.ListSharedResourcesRequest_ANY {
		q, _ := anypb.New(&idm.WorkspaceSingleQuery{Scope: idm.WorkspaceScope_LINK})
		qs = append(qs, q)
	}

	cl := idm.NewWorkspaceServiceClient(grpc.GetClientConnFromCtx(h.ctx, common.ServiceWorkspace))
	streamer, err := cl.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{
		Query: &service2.Query{
			SubQueries: qs,
			Operation:  service2.OperationType_OR,
			ResourcePolicyQuery: &service2.ResourcePolicyQuery{
				Subjects: subjects,
			},
		},
	})
	if err != nil {
		service.RestErrorDetect(req, rsp, err)
		return
	}
	defer streamer.CloseSend()
	response := &rest.ListSharedResourcesResponse{}
	workspaces := map[string]*idm.Workspace{}
	var workspaceIds []string
	for {
		resp, e := streamer.Recv()
		if e != nil {
			break
		}
		if request.OwnedBySubject && !h.MatchPolicies(ctx, resp.Workspace.UUID, resp.Workspace.Policies, service2.ResourcePolicyAction_OWNER, userId) {
			continue
		}
		workspaces[resp.Workspace.UUID] = resp.Workspace
		workspaceIds = append(workspaceIds, resp.Workspace.UUID)
	}

	if len(workspaces) == 0 {
		rsp.WriteEntity(response)
		return
	}

	acls, e := permissions.GetACLsForWorkspace(ctx, workspaceIds, permissions.AclRead, permissions.AclWrite, permissions.AclPolicy)
	if e != nil {
		service.RestErrorDetect(req, rsp, e)
		return
	}

	// Map roots to objects
	roots := make(map[string]map[string]*idm.Workspace)
	var detectedRoots []string
	for _, acl := range acls {
		if acl.NodeID == "" {
			continue
		}
		if _, has := roots[acl.NodeID]; !has {
			roots[acl.NodeID] = make(map[string]*idm.Workspace)
			detectedRoots = append(detectedRoots, acl.NodeID)
		}
		if ws, ok := workspaces[acl.WorkspaceID]; ok {
			roots[acl.NodeID][acl.WorkspaceID] = ws
		}
	}
	var rootNodes map[string]*tree.Node
	if request.Subject != "" {
		rootNodes = h.LoadAdminRootNodes(ctx, detectedRoots)
	} else {
		rootNodes = h.sc.LoadDetectedRootNodes(ctx, detectedRoots)
	}

	// Build resources
	for nodeId, node := range rootNodes {
		resource := &rest.ListSharedResourcesResponse_SharedResource{
			Node: node,
		}
		for _, ws := range roots[nodeId] {
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

	rsp.WriteEntity(response)

}

// LoadAdminRootNodes find actual nodes in the tree, and enrich their metadata if they appear
// in many workspaces for the current user.
func (h *SharesHandler) LoadAdminRootNodes(ctx context.Context, detectedRoots []string) (rootNodes map[string]*tree.Node) {

	rootNodes = make(map[string]*tree.Node)
	router := compose.NewClient(compose.UuidComposer(nodes.WithContext(h.ctx), nodes.AsAdmin())...)
	metaClient := tree.NewNodeProviderClient(grpc.GetClientConnFromCtx(h.ctx, common.ServiceMeta))
	for _, rootId := range detectedRoots {
		request := &tree.ReadNodeRequest{Node: &tree.Node{Uuid: rootId}}
		if resp, err := router.ReadNode(ctx, request); err == nil {
			node := resp.Node
			if metaResp, e := metaClient.ReadNode(ctx, request); e == nil && metaResp.GetNode().GetMetaBool(common.MetaFlagCellNode) {
				node.MustSetMeta(common.MetaFlagCellNode, true)
			}
			rootNodes[node.GetUuid()] = node.WithoutReservedMetas()
		} else {
			log.Logger(ctx).Error("Share Load - Ignoring Root Node, probably deleted", zap.String("nodeId", rootId), zap.Error(err))
		}
	}
	return

}
