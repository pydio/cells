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
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/cache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

type EventSubscriber struct {
	TreeServer *TreeServer
}

var (
	cacheConfig = cache.Config{Eviction: "10m"}
)

func NewEventSubscriber(t *TreeServer) *EventSubscriber {
	return &EventSubscriber{
		TreeServer: t,
	}
}

func (s *EventSubscriber) publish(ctx context.Context, msg *tree.NodeChangeEvent) {
	broker.MustPublish(ctx, common.TopicTreeChanges, msg)
	s.TreeServer.PublishChange(ctx, msg)
}

func (s *EventSubscriber) enqueueInCache(ctx context.Context, moveUuid string, event *tree.NodeChangeEvent, loop bool) {
	other := &tree.NodeChangeEvent{}
	var key, opposite string
	key = moveUuid + "-" + event.Type.String()
	if event.Type == tree.NodeChangeEvent_CREATE {
		opposite = moveUuid + "-" + tree.NodeChangeEvent_DELETE.String()
	} else {
		opposite = moveUuid + "-" + tree.NodeChangeEvent_CREATE.String()
	}
	ca, _ := cache_helper.ResolveCache(ctx, "shared", cacheConfig)
	if d, o := ca.GetBytes(opposite); o {
		_ = json.Unmarshal(d, &other)
		update := &tree.NodeChangeEvent{
			Type: tree.NodeChangeEvent_UPDATE_PATH,
		}
		if event.Type == tree.NodeChangeEvent_CREATE {
			update.Target = event.Target
		} else {
			update.Source = event.Source
		}
		if other.Type == tree.NodeChangeEvent_CREATE {
			update.Target = other.Target
		} else {
			update.Source = other.Source
		}
		if update.Source == nil || update.Target == nil {
			log.Logger(ctx).Error("Incomplete update event", zap.Any("event", event), zap.Any("other", other))
		} else {
			//log.Logger(ctx).Info(" => Complete update event", zap.Bool("loop", loop), zap.Any("update source", update.Source.Path), zap.Any("update target", update.Target.Path))
			s.publish(ctx, update)
		}
		_ = ca.Delete(opposite)
		return
	}

	if !loop {
		//log.Logger(ctx).Info("Enqueue in cache", zap.String("key", key), zap.Any("type", event.Type.String()))
		d, _ := json.Marshal(event)
		_ = ca.Set(key, d)
		go func() {
			<-time.After(300 * time.Millisecond)
			// Retry once if other key was stored just at the same time
			s.enqueueInCache(ctx, moveUuid, event, true)
		}()
	}
}

// Handle incoming INDEX events and resend them as TREE events. Events that carry an XPydioMoveUuid metadata
// are enqueued in a cache to re-create CREATE+DELETE pairs across datasources.
func (s *EventSubscriber) Handle(ctx context.Context, msg *tree.NodeChangeEvent) error {
	source, target := msg.Source, msg.Target
	if meta, ok := propagator.FromContextRead(ctx); ok && (msg.Type == tree.NodeChangeEvent_CREATE || msg.Type == tree.NodeChangeEvent_DELETE) {
		if moveSess, o := meta[common.XPydioMoveUuid]; o {
			var uuid string
			if source != nil {
				uuid = source.Uuid
				s.TreeServer.updateDataSourceNode(source, source.GetStringMeta(common.MetaNamespaceDatasourceName))
			}
			if target != nil {
				uuid = target.Uuid
				if target.Etag == "temporary" {
					// Ignore temporary events !
					return nil
				}
				s.TreeServer.updateDataSourceNode(target, target.GetStringMeta(common.MetaNamespaceDatasourceName))
			}
			log.Logger(ctx).Debug("Got move metadata from context - Skip event", zap.Any("uuid", uuid), zap.Any("event", msg))
			uuid += "-" + moveSess
			s.enqueueInCache(ctx, uuid, msg, false)
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
