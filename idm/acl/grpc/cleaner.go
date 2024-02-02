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
	"fmt"
	"time"

	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/queue"
)

type WsRolesCleaner struct {
	Handler *Handler
}

func (c *WsRolesCleaner) Handle(ctx context.Context, msg *idm.ChangeEvent) error {
	if msg.Type != idm.ChangeEventType_DELETE {
		return nil
	}
	var queries []*anypb.Any
	if msg.Workspace != nil {
		// Delete ACL for this workspace
		q, _ := anypb.New(&idm.ACLSingleQuery{
			WorkspaceIDs: []string{msg.Workspace.UUID},
		})
		queries = append(queries, q)
	}
	if msg.Role != nil {
		// Delete ACL for this role
		q, _ := anypb.New(&idm.ACLSingleQuery{
			RoleIDs: []string{msg.Role.Uuid},
		})
		queries = append(queries, q)
	}
	if len(queries) > 0 {
		_, e := c.Handler.DeleteACL(ctx, &idm.DeleteACLRequest{
			Query: &service.Query{
				SubQueries: queries,
			},
		})
		return e
	}
	return nil
}

type nodesCleaner struct {
	handler *Handler
	fifo    queue.Queue
}

func newNodesCleaner(ctx context.Context, h *Handler) (*nodesCleaner, error) {
	nc := &nodesCleaner{handler: h}
	var er error
	if nc.fifo, er = queue.OpenQueue(ctx, runtime.QueueURL("debounce", "750ms", "idle", "2s", "max", "5000")); er != nil {
		return nil, er
	} else {
		er = nc.fifo.Consume(func(events ...broker.Message) {
			var uu []string
			for _, e := range events {
				t := &tree.NodeChangeEvent{}
				if er := e.Unmarshal(t); er == nil {
					uu = append(uu, t.Source.Uuid)
				}
			}
			nc.process(ctx, uu...)
		})
		return nc, er
	}
}

func (c *nodesCleaner) Handle(ctx context.Context, msg *tree.NodeChangeEvent) error {
	if msg.Type != tree.NodeChangeEvent_DELETE || msg.Source == nil || msg.Source.Uuid == "" || msg.Optimistic {
		return nil
	}
	return c.fifo.Push(ctx, msg)
}

func (c *nodesCleaner) process(ctx context.Context, eventsUUIDs ...string) {

	// Mark ACLs for deletion
	log.Logger(ctx).Debug(fmt.Sprintf("Marking %d nodes ACL as expired", len(eventsUUIDs)))
	q, _ := anypb.New(&idm.ACLSingleQuery{
		NodeIDs: eventsUUIDs,
	})
	_, _ = c.handler.ExpireACL(ctx, &idm.ExpireACLRequest{
		Query: &service.Query{
			SubQueries: []*anypb.Any{q},
		},
		Timestamp: time.Now().Unix(),
	})

}
