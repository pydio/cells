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

// Package api starts the actual WebSocket service
package api

import (
	"context"
	"net/http"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/proto/activity"
	chat2 "github.com/pydio/cells/v4/common/proto/chat"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/gateway/websocket"
)

var (
	ws   *websocket.WebsocketHandler
	chat *websocket.ChatHandler
	name = common.ServiceGatewayNamespace_ + common.ServiceWebSocket
)

func wrap(ctx context.Context) context.Context {
	return servicecontext.WithServiceName(ctx, name)
}

func init() {

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(name),
			service.Context(ctx),
			service.Tag(common.ServiceTagGateway),
			service.Dependency(common.ServiceGrpcNamespace_+common.ServiceChat, []string{}),
			service.Description("WebSocket server pushing event to the clients"),
			service.Fork(true),
			service.WithHTTP(func(ctx context.Context, mux server.HttpMux) error {
				ws = websocket.NewWebSocketHandler(ctx)
				chat = websocket.NewChatHandler(ctx)
				ws.EventRouter = compose.ReverseClient(ctx)

				mux.HandleFunc("/ws/event", func(w http.ResponseWriter, r *http.Request) {
					ws.Websocket.HandleRequest(w, r)
				})
				mux.HandleFunc("/ws/chat", func(w http.ResponseWriter, r *http.Request) {
					chat.Websocket.HandleRequest(w, r)
				})

				_ = broker.SubscribeCancellable(ctx, common.TopicTreeChanges, func(message broker.Message) error {
					event := &tree.NodeChangeEvent{}
					if c, e := message.Unmarshal(event); e == nil {
						if er := ws.HandleNodeChangeEvent(wrap(c), event); er != nil {
							log.Logger(ctx).Error("Cannot handle event", zap.Any("event", event), zap.Error(er))
						}
						return nil
					} else {
						return e
					}
				})
				_ = broker.SubscribeCancellable(ctx, common.TopicMetaChanges, func(message broker.Message) error {
					event := &tree.NodeChangeEvent{}
					if c, e := message.Unmarshal(event); e == nil {
						if er := ws.HandleNodeChangeEvent(wrap(c), event); er != nil {
							log.Logger(ctx).Error("Cannot handle event", zap.Any("event", event), zap.Error(er))
						}
						return nil
					} else {
						return e
					}
				})
				_ = broker.SubscribeCancellable(ctx, common.TopicJobTaskEvent, func(message broker.Message) error {
					event := &jobs.TaskChangeEvent{}
					if c, e := message.Unmarshal(event); e == nil {
						if er := ws.BroadcastTaskChangeEvent(wrap(c), event); er != nil {
							log.Logger(ctx).Error("Cannot handle event", zap.Any("event", event), zap.Error(er))
						}
						return nil
					} else {
						return e
					}
				})
				_ = broker.SubscribeCancellable(ctx, common.TopicIdmEvent, func(message broker.Message) error {
					event := &idm.ChangeEvent{}
					if c, e := message.Unmarshal(event); e == nil {
						if er := ws.BroadcastIDMChangeEvent(wrap(c), event); er != nil {
							log.Logger(ctx).Error("Cannot handle event", zap.Any("event", event), zap.Error(er))
						}
						return nil
					} else {
						return e
					}
				})
				_ = broker.SubscribeCancellable(ctx, common.TopicActivityEvent, func(message broker.Message) error {
					event := &activity.PostActivityEvent{}
					if c, e := message.Unmarshal(event); e == nil {
						if er := ws.BroadcastActivityEvent(wrap(c), event); er != nil {
							log.Logger(ctx).Error("Cannot handle event", zap.Any("event", event), zap.Error(er))
						}
						return nil
					} else {
						return e
					}
				})
				_ = broker.SubscribeCancellable(ctx, common.TopicChatEvent, func(message broker.Message) error {
					event := &chat2.ChatEvent{}
					if c, e := message.Unmarshal(event); e == nil {
						if er := chat.BroadcastChatMessage(wrap(c), event); er != nil {
							log.Logger(ctx).Error("Cannot handle event", zap.Any("event", event), zap.Error(er))
						}
						return nil
					} else {
						return e
					}
				})

				return nil
			}),
		)

	})
}
