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
	"sync"
	"time"

	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/idm/share"
)

type contextualWsID struct {
	id  string
	ctx context.Context
}

type AclBatcher struct {
	ctx         context.Context
	timeout     time.Duration
	incoming    chan *idm.ACL
	workspaceId string
	done        chan contextualWsID
}

func NewAclBatcher(ctx context.Context, wsId string, done chan contextualWsID, timeout time.Duration) *AclBatcher {
	a := &AclBatcher{
		ctx:         ctx,
		timeout:     timeout,
		incoming:    make(chan *idm.ACL),
		workspaceId: wsId,
		done:        done,
	}
	go a.Start()
	return a
}

func (a *AclBatcher) Start() {
	defer func() {
		a.done <- contextualWsID{id: a.workspaceId, ctx: a.ctx}
	}()
	for {
		select {
		case <-a.incoming:
			// Do nothing, just select and reset timeout
		case <-time.After(a.timeout):
			return
		}
	}
}

// WsCleaner subscribe to ACL:Delete events to clean workspaces
// that do not have any ACLs anymore
type WsCleaner struct {
	Handler     idm.WorkspaceServiceServer
	batches     map[string]*AclBatcher
	listener    chan contextualWsID
	lock        *sync.Mutex
	shareClient *share.Client
}

func NewWsCleaner(ctx context.Context, h idm.WorkspaceServiceServer) *WsCleaner {
	listener := make(chan contextualWsID, 1)
	lock := &sync.Mutex{}
	w := &WsCleaner{
		Handler:  h,
		listener: listener,
		lock:     lock,
		batches:  make(map[string]*AclBatcher),
	}
	// Start listening to ws
	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case ev := <-listener:
				if err := w.deleteEmptyWs(ev.ctx, ev.id); err != nil {
					log.Logger(ctx).Info("Error while trying to delete workspace without ACLs (" + ev.id + ")")
				}
				lock.Lock()
				delete(w.batches, ev.id)
				lock.Unlock()
			}
		}
	}()
	return w
}

func (c *WsCleaner) Handle(ctx context.Context, msg *idm.ChangeEvent) error {
	if msg.Type != idm.ChangeEventType_DELETE {
		return nil
	}
	if msg.Workspace != nil && msg.Workspace.Scope == idm.WorkspaceScope_LINK {
		return c.cleanSharedDocStoreOnWsDelete(ctx, msg.Workspace)
	}
	if msg.Acl == nil {
		return nil
	}
	acl := msg.Acl
	if acl.WorkspaceID == "" {
		return nil
	}
	c.lock.Lock()
	if batcher, ok := c.batches[acl.WorkspaceID]; ok {
		batcher.incoming <- acl
	} else {
		batcher = NewAclBatcher(context.WithoutCancel(ctx), acl.WorkspaceID, c.listener, 3*time.Second)
		c.batches[acl.WorkspaceID] = batcher
		batcher.incoming <- acl
	}
	c.lock.Unlock()
	return nil
}

func (c *WsCleaner) deleteEmptyWs(ctx context.Context, workspaceId string) error {

	// Check if there are still some ACLs for this workspace
	cl := idm.NewACLServiceClient(grpc.ResolveConn(ctx, common.ServiceAclGRPC))
	q, _ := anypb.New(&idm.ACLSingleQuery{
		WorkspaceIDs: []string{workspaceId},
	})
	ct, ca := context.WithCancel(ctx)
	defer ca()
	streamer, e := cl.SearchACL(ct, &idm.SearchACLRequest{
		Query: &service.Query{SubQueries: []*anypb.Any{q}},
	})
	if e != nil {
		return e
	}
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
		q2, _ := anypb.New(&idm.WorkspaceSingleQuery{
			Uuid: workspaceId,
		})
		_, e := c.Handler.DeleteWorkspace(ctx, &idm.DeleteWorkspaceRequest{
			Query: &service.Query{SubQueries: []*anypb.Any{q2}},
		})
		if e == nil {
			log.Logger(ctx).Info("Deleted workspace based on ACL Delete events", zap.String("wsId", workspaceId))
		}
	}
	return nil

}

func (c *WsCleaner) cleanSharedDocStoreOnWsDelete(ctx context.Context, ws *idm.Workspace) error {
	if c.shareClient == nil {
		c.shareClient = share.NewClient(nil)
	}
	storedLink := &rest.ShareLink{Uuid: ws.GetUUID()}
	if er := c.shareClient.LoadHashDocumentData(ctx, storedLink, []*idm.ACL{}); er == nil {
		log.Logger(ctx).Info("Link data found for workspace " + ws.GetLabel())
		if e := c.shareClient.DeleteHashDocument(ctx, storedLink.Uuid); e != nil {
			return e
		} else {
			log.Logger(ctx).Info(" - Cleared DocStore entry")
		}
		if e := c.shareClient.DeleteHiddenUser(ctx, storedLink); e != nil {
			return e
		} else {
			log.Logger(ctx).Info(" - Cleared associated hidden user")
		}
	}
	return nil
}
