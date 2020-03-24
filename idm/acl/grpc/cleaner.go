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
	"time"

	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/protobuf/ptypes"

	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	service "github.com/pydio/cells/common/service/proto"
)

type WsRolesCleaner struct {
	Handler *Handler
}

func (c *WsRolesCleaner) Handle(ctx context.Context, msg *idm.ChangeEvent) error {
	if msg.Type != idm.ChangeEventType_DELETE {
		return nil
	}
	queries := []*any.Any{}
	if msg.Workspace != nil {
		// Delete ACL's for this workspace
		q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
			WorkspaceIDs: []string{msg.Workspace.UUID},
		})
		queries = append(queries, q)
	}
	if msg.Role != nil {
		// Delete ACL's for this workspace
		q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
			RoleIDs: []string{msg.Role.Uuid},
		})
		queries = append(queries, q)
	}
	if len(queries) > 0 {
		return c.Handler.DeleteACL(ctx, &idm.DeleteACLRequest{
			Query: &service.Query{
				SubQueries: queries,
			},
		}, &idm.DeleteACLResponse{})
	}
	return nil
}

type NodesCleaner struct {
	Handler *Handler
}

func (c *NodesCleaner) Handle(ctx context.Context, msg *tree.NodeChangeEvent) error {
	if msg.Type != tree.NodeChangeEvent_DELETE || msg.Source == nil || msg.Source.Uuid == "" || msg.Optimistic {
		return nil
	}
	// fmt.Println("Received a nodes cleaner handle message ", msg)

	// Mark ACLs for deletion
	q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
		NodeIDs: []string{msg.Source.Uuid},
	})
	return c.Handler.ExpireACL(ctx, &idm.ExpireACLRequest{
		Query: &service.Query{
			SubQueries: []*any.Any{q},
		},
		Timestamp: time.Now().Unix(),
	}, &idm.ExpireACLResponse{})
}
