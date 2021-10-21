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

	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/protobuf/ptypes"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service/proto"
)

type AclBatcher struct {
	timeout     time.Duration
	incoming    chan *idm.ACL
	workspaceId string
	done        chan string
}

func NewAclBatcher(wsId string, done chan string, timeout time.Duration) *AclBatcher {
	a := &AclBatcher{
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
		a.done <- a.workspaceId
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
	Handler  *Handler
	batches  map[string]*AclBatcher
	listener chan string
	lock     *sync.Mutex
	ctx      context.Context
}

func NewWsCleaner(h *Handler, ctx context.Context) *WsCleaner {
	listener := make(chan string, 1)
	lock := &sync.Mutex{}
	w := &WsCleaner{
		Handler:  h,
		ctx:      ctx,
		listener: listener,
		lock:     lock,
		batches:  make(map[string]*AclBatcher),
	}
	// Start listening to ws
	go func() {
		for wsId := range listener {
			if err := w.deleteEmptyWs(wsId); err != nil {
				log.Logger(context.Background()).Info("Error while trying to delete workspace without ACLs (" + wsId + ")")
			}
			lock.Lock()
			delete(w.batches, wsId)
			lock.Unlock()
		}
		/*
			for {
				select {
				case wsId := <-listener:
					if err := w.deleteEmptyWs(wsId); err != nil {
						log.Logger(context.Background()).Info("Error while trying to delete workspace without ACLs (" + wsId + ")")
					}
					lock.Lock()
					delete(w.batches, wsId)
					lock.Unlock()
				}
			}
		*/
	}()
	return w
}

func (c *WsCleaner) Handle(ctx context.Context, msg *idm.ChangeEvent) error {
	if msg.Type != idm.ChangeEventType_DELETE || msg.Acl == nil {
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
		batcher := NewAclBatcher(acl.WorkspaceID, c.listener, 3*time.Second)
		c.batches[acl.WorkspaceID] = batcher
		batcher.incoming <- acl
	}
	c.lock.Unlock()
	return nil
}

func (c *WsCleaner) deleteEmptyWs(workspaceId string) error {

	ctx := context.Background()

	// Check if there are still some ACLs for this workspace
	cl := idm.NewACLServiceClient(common.ServiceGrpcNamespace_+common.ServiceAcl, defaults.NewClient())
	q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
		WorkspaceIDs: []string{workspaceId},
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
		q2, _ := ptypes.MarshalAny(&idm.WorkspaceSingleQuery{
			Uuid: workspaceId,
		})
		e := c.Handler.DeleteWorkspace(c.ctx, &idm.DeleteWorkspaceRequest{
			Query: &service.Query{SubQueries: []*any.Any{q2}},
		}, &idm.DeleteWorkspaceResponse{})
		if e == nil {
			log.Logger(c.ctx).Info("Deleted workspace based on ACL Delete events", zap.String("wsId", workspaceId))
		}
	}
	return nil

}
