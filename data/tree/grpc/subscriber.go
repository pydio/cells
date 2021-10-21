/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

	"github.com/micro/go-micro/client"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/tree"
	c2 "github.com/pydio/cells/common/utils/context"
)

type EventSubscriber struct {
	TreeServer  *TreeServer
	EventClient client.Client

	moves    map[string]chan *tree.NodeChangeEvent
	movesMux *sync.Mutex
}

func NewEventSubscriber(t *TreeServer, c client.Client) *EventSubscriber {
	return &EventSubscriber{
		TreeServer:  t,
		EventClient: c,
		moves:       make(map[string]chan *tree.NodeChangeEvent),
		movesMux:    &sync.Mutex{},
	}
}

func (s *EventSubscriber) publish(ctx context.Context, msg *tree.NodeChangeEvent) {
	s.EventClient.Publish(ctx, s.EventClient.NewPublication(common.TopicTreeChanges, msg))
	s.TreeServer.PublishChange(msg)
}

func (s *EventSubscriber) mvGet(uuid string) (chan *tree.NodeChangeEvent, bool) {
	s.movesMux.Lock()
	defer s.movesMux.Unlock()
	c, ok := s.moves[uuid]
	return c, ok
}

func (s *EventSubscriber) mvSet(uuid string, c chan *tree.NodeChangeEvent) {
	s.movesMux.Lock()
	defer s.movesMux.Unlock()
	s.moves[uuid] = c
}

func (s *EventSubscriber) mvDel(uuid string) {
	s.movesMux.Lock()
	defer s.movesMux.Unlock()
	delete(s.moves, uuid)
}

func (s *EventSubscriber) enqueueMoves(ctx context.Context, moveUuid string, event *tree.NodeChangeEvent) {
	if c, ok := s.mvGet(moveUuid); ok {
		c <- event
	} else {
		newB := make(chan *tree.NodeChangeEvent)
		s.mvSet(moveUuid, newB)
		go func() {
			var del, create *tree.NodeChangeEvent
			defer func() {
				// Process
				if del != nil && create != nil {
					s.publish(ctx, &tree.NodeChangeEvent{
						Type:   tree.NodeChangeEvent_UPDATE_PATH,
						Source: del.Source,
						Target: create.Target,
					})
				}
				// Remove
				close(newB)
				s.mvDel(moveUuid)
			}()
			for {
				select {
				case ev := <-newB:
					if ev.Type == tree.NodeChangeEvent_DELETE {
						del = ev
					} else if ev.Type == tree.NodeChangeEvent_CREATE {
						create = ev
					}
					if del != nil && create != nil {
						return
					}
				case <-time.After(10 * time.Minute):
					return
				}
			}
		}()
		newB <- event
	}
}

// Handle incoming INDEX events and resend them as TREE events
func (s *EventSubscriber) Handle(ctx context.Context, msg *tree.NodeChangeEvent) error {
	source, target := msg.Source, msg.Target
	if meta, ok := c2.ContextMetadata(ctx); ok && (msg.Type == tree.NodeChangeEvent_CREATE || msg.Type == tree.NodeChangeEvent_DELETE) {
		if move, o := meta["x-pydio-move"]; o {
			var uuid = move
			if source != nil {
				uuid = source.Uuid
				s.TreeServer.updateDataSourceNode(source, source.GetStringMeta(common.MetaNamespaceDatasourceName))
			}
			if target != nil {
				uuid = target.Uuid
				s.TreeServer.updateDataSourceNode(target, target.GetStringMeta(common.MetaNamespaceDatasourceName))
			}
			//log.Logger(ctx).Info("Got move metadata from context - Skip event", zap.Any("uuid", uuid), zap.Any("event", msg))
			s.enqueueMoves(ctx, uuid, msg)
			return nil
		}
	}
	// Update Source & Target Nodes
	if source != nil {
		s.TreeServer.updateDataSourceNode(source, source.GetStringMeta(common.MetaNamespaceDatasourceName))
	}
	if target != nil {
		s.TreeServer.updateDataSourceNode(target, target.GetStringMeta(common.MetaNamespaceDatasourceName))
	}

	s.publish(ctx, msg)

	return nil
}
