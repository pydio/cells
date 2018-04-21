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
	"strings"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/metadata"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/service/proto"
)

// MetaHandler implements handler method of the share gRPC service.
type MetaHandler struct{}

func (m *MetaHandler) ReadNodeStream(ctx context.Context, streamer tree.NodeProviderStreamer_ReadNodeStreamStream) error {

	defer streamer.Close()

	// Extract current user Id from X-Pydio-User key
	var userId string
	if meta, ok := metadata.FromContext(ctx); ok {
		if value, ok2 := meta[common.PYDIO_CONTEXT_USER_KEY]; ok2 {
			userId = value
		}
		// TODO - WTF WITH LOWER CASE ?
		if value, ok2 := meta[strings.ToLower(common.PYDIO_CONTEXT_USER_KEY)]; ok2 {
			userId = value
		}
	}

	aclClient := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
	workspaceClient := idm.NewWorkspaceServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_WORKSPACE, defaults.NewClient())

	for {
		request, err := streamer.Recv()
		if request == nil {
			break
		}
		if err != nil {
			return err
		}
		node := request.Node

		if userId == "" || node.Uuid == "" {
			streamer.Send(&tree.ReadNodeResponse{Node: node})
			continue
		}

		aclRequest, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
			NodeIDs: []string{node.Uuid},
			Actions: []*idm.ACLAction{
				{Name: "read", Value: "1"},
				{Name: "write", Value: "1"},
			},
		})
		aclStream, e := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: &service.Query{
			SubQueries: []*any.Any{aclRequest},
		}})
		nodeAcls := make(map[string][]*idm.ACL)
		if e == nil {
			defer aclStream.Close()
			for {
				aclResp, er := aclStream.Recv()
				if er != nil {
					break
				}
				if aclResp == nil {
					continue
				}
				if aclResp.ACL.WorkspaceID == "" {
					continue
				}
				if _, exists := nodeAcls[aclResp.ACL.WorkspaceID]; !exists {
					nodeAcls[aclResp.ACL.WorkspaceID] = []*idm.ACL{}
				}
				nodeAcls[aclResp.ACL.WorkspaceID] = append(nodeAcls[aclResp.ACL.WorkspaceID], aclResp.ACL)
			}
		}

		//log.Logger(ctx).Info("Read Node Stream found workspaces on node", zap.String("uuid", node.Uuid), zap.Any("n", nodeAcls))

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
			// Find some info about this node
			log.Logger(ctx).Debug("Read Node Stream for Shares : found workspaces owned by user "+userId, zap.Any("s", shares))
			node.SetMeta("workspaces_shares", shares)
		}

		streamer.Send(&tree.ReadNodeResponse{Node: node})
	}

	return nil

}
