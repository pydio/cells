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

// Package service starts the actual WebSocket service
package service

import (
	"context"
	"net/http"

	"github.com/olahol/melody"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/config/routing"
	"github.com/pydio/cells/v5/common/middleware"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/proto/activity"
	chat2 "github.com/pydio/cells/v5/common/proto/chat"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/gateway/websocket"
)

var (
	ws   *websocket.WebsocketHandler
	chat *websocket.ChatHandler
)

const (
	name = common.ServiceGatewayNamespace_ + common.ServiceWebSocket
)

func wrap(ctx context.Context) context.Context {
	return runtime.WithServiceName(ctx, name)
}

func init() {

	routing.RegisterRoute(common.RouteWebsocket, "Websocket Endpoint", common.DefaultRouteWebsocket, routing.WithWebSocket())

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(name),
			service.Context(ctx),
			service.Tag(common.ServiceTagGateway),
			service.Description("WebSocket server pushing event to the clients"),
			service.WithHTTPStop(func(ctx context.Context, mux routing.RouteRegistrar) error {
				mux.DeregisterRoute(common.RouteWebsocket)
				return nil
			}),
			service.WithHTTPOptions(func(rootCtx context.Context, mux routing.RouteRegistrar, o *service.ServiceOptions) error {
				ws = websocket.NewWebSocketHandler(rootCtx)
				chat = websocket.NewChatHandler(rootCtx)
				ws.EventRouter = compose.ReverseClient()

				sub := mux.Route(common.RouteWebsocket)
				melodyAsHandler := func(mel *melody.Melody) http.Handler {
					hf := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
						if er := mel.HandleRequest(w, r); er != nil {
							log.Logger(ctx).Warn("websocket error", zap.Error(er))
						}
					})
					handler := middleware.HttpWrapperMeta(http.Handler(hf))
					handler = middleware.WebIncomingContextMiddleware(rootCtx, "", service.ContextKey, o.Server, handler)
					return handler
				}
				sub.Handle("/event", melodyAsHandler(ws.Websocket))
				sub.Handle("/chat", melodyAsHandler(chat.Websocket))
				counterName := broker.WithCounterName("websocket")

				_ = broker.SubscribeCancellable(rootCtx, common.TopicTreeChanges, func(ctx context.Context, message broker.Message) error {
					event := &tree.NodeChangeEvent{}
					if ctx, e := message.Unmarshal(ctx, event); e == nil {
						if er := ws.HandleNodeChangeEvent(ctx, event); er != nil {
							log.Logger(rootCtx).Error("Cannot handle event", zap.Any("event", event), zap.Error(er))
						}
						return nil
					} else {
						return e
					}
				}, /*broker.WithLocalQueue(q1),*/ counterName)
				_ = broker.SubscribeCancellable(rootCtx, common.TopicMetaChanges, func(ctx context.Context, message broker.Message) error {
					event := &tree.NodeChangeEvent{}
					if ctx, e := message.Unmarshal(ctx, event); e == nil {
						if er := ws.HandleNodeChangeEvent(ctx, event); er != nil {
							log.Logger(ctx).Error("Cannot handle event", zap.Any("event", event), zap.Error(er))
						}
						return nil
					} else {
						return e
					}
				}, /*broker.WithLocalQueue(q2),*/ counterName)
				_ = broker.SubscribeCancellable(rootCtx, common.TopicJobTaskEvent, func(ctx context.Context, message broker.Message) error {
					event := &jobs.TaskChangeEvent{}
					if ctx, e := message.Unmarshal(ctx, event); e == nil {
						if er := ws.BroadcastTaskChangeEvent(ctx, event); er != nil {
							log.Logger(ctx).Error("Cannot handle event", zap.Any("event", event), zap.Error(er))
						}
						return nil
					} else {
						return e
					}
				})
				_ = broker.SubscribeCancellable(rootCtx, common.TopicIdmEvent, func(ctx context.Context, message broker.Message) error {
					event := &idm.ChangeEvent{}
					if ctx, e := message.Unmarshal(ctx, event); e == nil {
						if er := ws.BroadcastIDMChangeEvent(ctx, event); er != nil {
							log.Logger(ctx).Error("Cannot handle event", zap.Any("event", event), zap.Error(er))
						}
						return nil
					} else {
						return e
					}
				}, counterName)
				_ = broker.SubscribeCancellable(rootCtx, common.TopicActivityEvent, func(ctx context.Context, message broker.Message) error {
					event := &activity.PostActivityEvent{}
					if ctx, e := message.Unmarshal(ctx, event); e == nil {
						if er := ws.BroadcastActivityEvent(ctx, event); er != nil {
							log.Logger(ctx).Error("Cannot handle event", zap.Any("event", event), zap.Error(er))
						}
						return nil
					} else {
						return e
					}
				}, counterName)
				_ = broker.SubscribeCancellable(rootCtx, common.TopicChatEvent, func(ctx context.Context, message broker.Message) error {
					event := &chat2.ChatEvent{}
					if ctx, e := message.Unmarshal(ctx, event); e == nil {
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
