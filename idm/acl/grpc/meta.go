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

package grpc

import (
	"context"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/cells/idm/acl"
)

// ReadNodeStream implements method to be a MetaProvider
func (h *Handler) ReadNodeStream(ctx context.Context, stream tree.NodeProviderStreamer_ReadNodeStreamStream) error {

	dao := servicecontext.GetDAO(ctx).(acl.DAO)
	workspaceClient := idm.NewWorkspaceServiceClient(common.ServiceGrpcNamespace_+common.ServiceWorkspace, defaults.NewClient())
	defer stream.Close()

	for {
		req, er := stream.Recv()
		if req == nil {
			break
		}
		if er != nil {
			return er
		}
		node := req.Node

		acls := new([]interface{})
		q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
			NodeIDs: []string{node.Uuid},
			Actions: []*idm.ACLAction{
				{Name: "content_lock"},
				permissions.AclRead,
				permissions.AclWrite,
				permissions.AclPolicy,
			},
		})
		dao.Search(&service.Query{SubQueries: []*any.Any{q}}, acls)
		var contentLock string
		nodeAcls := map[string][]*idm.ACL{}
		for _, in := range *acls {
			a, _ := in.(*idm.ACL)
			if a.Action.Name == "content_lock" {
				contentLock = a.Action.Value
			} else if a.WorkspaceID != "" {
				if _, exists := nodeAcls[a.WorkspaceID]; !exists {
					nodeAcls[a.WorkspaceID] = []*idm.ACL{}
				}
				nodeAcls[a.WorkspaceID] = append(nodeAcls[a.WorkspaceID], a)
			}
		}

		if contentLock != "" {
			node.SetMeta("content_lock", contentLock)
		}

		var shares []*idm.Workspace
		for wsId, _ := range nodeAcls {
			roomQuery, _ := ptypes.MarshalAny(&idm.WorkspaceSingleQuery{
				Uuid:  wsId,
				Scope: idm.WorkspaceScope_ROOM,
			})
			linkQuery, _ := ptypes.MarshalAny(&idm.WorkspaceSingleQuery{
				Uuid:  wsId,
				Scope: idm.WorkspaceScope_LINK,
			})
			subjects, _ := auth.SubjectsForResourcePolicyQuery(ctx, &rest.ResourcePolicyQuery{Type: rest.ResourcePolicyQuery_CONTEXT})
			wsClient, err := workspaceClient.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{
				Query: &service.Query{
					SubQueries:          []*any.Any{roomQuery, linkQuery},
					ResourcePolicyQuery: &service.ResourcePolicyQuery{Subjects: subjects},
					Operation:           service.OperationType_OR,
				},
			})
			if err == nil {
				defer wsClient.Close()
				for {
					wsResp, er := wsClient.Recv()
					if er != nil {
						break
					}
					if wsResp == nil {
						continue
					}
					shares = append(shares, wsResp.Workspace)
				}
			}
		}

		if len(shares) > 0 {
			node.SetMeta("workspaces_shares", shares)
		}

		stream.Send(&tree.ReadNodeResponse{Node: node})
	}

	return nil
}
