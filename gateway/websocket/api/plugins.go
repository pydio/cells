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
	"github.com/pydio/cells/v4/common/config/routing"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/proto/activity"
	chat2 "github.com/pydio/cells/v4/common/proto/chat"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/gateway/websocket"
)

var (
	ws   *websocket.WebsocketHandler
	chat *websocket.ChatHandler
)

const (
	name           = common.ServiceGatewayNamespace_ + common.ServiceWebSocket
	RouteWebsocket = "websocket"
)

func wrap(ctx context.Context) context.Context {
	return servicecontext.WithServiceName(ctx, name)
}

func init() {

	routing.RegisterRoute(RouteWebsocket, "Websocket Endpoint", "/ws")

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(name),
			service.Context(ctx),
			service.Tag(common.ServiceTagGateway),
			service.Description("WebSocket server pushing event to the clients"),
			service.WithHTTPStop(func(ctx context.Context, mux routing.RouteRegistrar) error {
				mux.DeregisterRoute(RouteWebsocket)
				return nil
			}),
			service.WithHTTP(func(ctx context.Context, mux routing.RouteRegistrar) error {
				ws = websocket.NewWebSocketHandler(ctx)
				chat = websocket.NewChatHandler(ctx)
				ws.EventRouter = compose.ReverseClient(ctx)

				sub := mux.Route(RouteWebsocket)
				sub.Handle("/event", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					_ = ws.Websocket.HandleRequest(w, r)
				}))
				sub.Handle("/chat", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					_ = chat.Websocket.HandleRequest(w, r)
				}))
				//q1, _ := queue.OpenQueue(ctx, runtime.QueueURL("debounce", "1s", "idle", "10s", "max", "10000"))
				//q2, _ := queue.OpenQueue(ctx, runtime.QueueURL("debounce", "1s", "idle", "10s", "max", "10000"))
				counterName := broker.WithCounterName("websocket")

				_ = broker.SubscribeCancellable(ctx, common.TopicTreeChanges, func(_ context.Context, message broker.Message) error {
					event := &tree.NodeChangeEvent{}
					if _, e := message.Unmarshal(ctx, event); e == nil {
						if er := ws.HandleNodeChangeEvent(ctx, event); er != nil {
							log.Logger(ctx).Error("Cannot handle event", zap.Any("event", event), zap.Error(er))
						}
						return nil
					} else {
						return e
					}
				}, /*broker.WithLocalQueue(q1),*/ counterName)
				_ = broker.SubscribeCancellable(ctx, common.TopicMetaChanges, func(ctx context.Context, message broker.Message) error {
					event := &tree.NodeChangeEvent{}
					if _, e := message.Unmarshal(ctx, event); e == nil {
						if er := ws.HandleNodeChangeEvent(ctx, event); er != nil {
							log.Logger(ctx).Error("Cannot handle event", zap.Any("event", event), zap.Error(er))
						}
						return nil
					} else {
						return e
					}
				}, /*broker.WithLocalQueue(q2),*/ counterName)
				_ = broker.SubscribeCancellable(ctx, common.TopicJobTaskEvent, func(ctx context.Context, message broker.Message) error {
					event := &jobs.TaskChangeEvent{}
					if _, e := message.Unmarshal(ctx, event); e == nil {
						if er := ws.BroadcastTaskChangeEvent(ctx, event); er != nil {
							log.Logger(ctx).Error("Cannot handle event", zap.Any("event", event), zap.Error(er))
						}
						return nil
					} else {
						return e
					}
				})
				_ = broker.SubscribeCancellable(ctx, common.TopicIdmEvent, func(ctx context.Context, message broker.Message) error {
					event := &idm.ChangeEvent{}
					if _, e := message.Unmarshal(ctx, event); e == nil {
						if er := ws.BroadcastIDMChangeEvent(ctx, event); er != nil {
							log.Logger(ctx).Error("Cannot handle event", zap.Any("event", event), zap.Error(er))
						}
						return nil
					} else {
						return e
					}
				}, counterName)
				_ = broker.SubscribeCancellable(ctx, common.TopicActivityEvent, func(ctx context.Context, message broker.Message) error {
					event := &activity.PostActivityEvent{}
					if _, e := message.Unmarshal(ctx, event); e == nil {
						if er := ws.BroadcastActivityEvent(ctx, event); er != nil {
							log.Logger(ctx).Error("Cannot handle event", zap.Any("event", event), zap.Error(er))
						}
						return nil
					} else {
						return e
					}
				}, counterName)
				_ = broker.SubscribeCancellable(ctx, common.TopicChatEvent, func(ctx context.Context, message broker.Message) error {
					event := &chat2.ChatEvent{}
					if _, e := message.Unmarshal(ctx, event); e == nil {
						if er := chat.BroadcastChatMessage(ctx, event); er != nil {
							log.Logger(ctx).Error("Cannot handle event", zap.Any("event", event), zap.Error(er))
						}
						return nil
					} else {
						return e
					}
				}, counterName)

				return nil
			}),
		)

	})
}
