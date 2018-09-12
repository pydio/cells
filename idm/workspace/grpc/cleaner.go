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

	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/protobuf/ptypes"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/service/proto"
	"go.uber.org/zap"
)

// WsCleaner subscribe to ACL:Delete events to clean workspaces
// that do not have any ACLs anymore
type WsCleaner struct {
	Handler *Handler
}

func (c *WsCleaner) Handle(ctx context.Context, msg *idm.ChangeEvent) error {
	if msg.Type != idm.ChangeEventType_DELETE || msg.Acl == nil {
		return nil
	}
	acl := msg.Acl
	if acl.WorkspaceID == "" {
		return nil
	}
	// Check if there are still some ACLs for this workspace
	cl := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
	q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
		WorkspaceIDs: []string{acl.WorkspaceID},
	})
	streamer, e := cl.SearchACL(ctx, &idm.SearchACLRequest{
		Query: &service.Query{SubQueries: []*any.Any{q}},
	})
	if e != nil {
		return e
	}
	defer streamer.Close()
	hasAcl := false
	for {
		resp, e := streamer.Recv()
		if e != nil {
			break
		}
		if resp != nil {
			hasAcl = true
			break
		}
	}
	if !hasAcl {
		log.Logger(ctx).Info("[warning] Workspace should be deleted based on ACL Delete events", zap.String("wsId", acl.WorkspaceID))
		return nil
		q2, _ := ptypes.MarshalAny(&idm.WorkspaceSingleQuery{
			Uuid: acl.WorkspaceID,
		})
		e := c.Handler.DeleteWorkspace(ctx, &idm.DeleteWorkspaceRequest{
			Query: &service.Query{SubQueries: []*any.Any{q2}},
		}, &idm.DeleteWorkspaceResponse{})
		if e == nil {
			log.Logger(ctx).Info("Deleted workspace based on ACL Delete events", zap.String("wsId", acl.WorkspaceID))
		}
	}

	return nil
}
