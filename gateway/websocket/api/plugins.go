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
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/micro/go-micro"

	"github.com/pydio/cells/common"
	config2 "github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/activity"
	chat2 "github.com/pydio/cells/common/proto/chat"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/gateway/websocket"
)

func init() {
	service.NewService(
		service.Name(common.SERVICE_GATEWAY_NAMESPACE_+common.SERVICE_WEBSOCKET),
		service.Tag(common.SERVICE_TAG_GATEWAY),
		service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_CHAT, []string{}),
		service.Description("WebSocket server pushing event to the clients"),
		service.WithMicro(func(m micro.Service) error {

			ctx := m.Options().Context
			config := servicecontext.GetConfig(ctx)

			port := config.Int("port", 5050)

			ws := websocket.NewWebSocketHandler(ctx)
			ws.EventRouter = views.NewRouterEventFilter(views.RouterOptions{WatchRegistry: true})

			gin.SetMode(gin.ReleaseMode)
			gin.DisableConsoleColor()
			Server := gin.New()
			Server.Use(gin.Recovery())
			Server.GET("/event", func(c *gin.Context) {
				ws.Websocket.HandleRequest(c.Writer, c.Request)
			})

			chat := websocket.NewChatHandler(ctx)
			Server.GET("/chat", func(c *gin.Context) {
				chat.Websocket.HandleRequest(c.Writer, c.Request)
			})

			ssl := config2.Get("cert", "http", "ssl").Bool(false)
			certFile := config2.Get("cert", "http", "certFile").String("")
			keyFile := config2.Get("cert", "http", "keyFile").String("")

			go func() {
				if ssl {
					Server.RunTLS(fmt.Sprintf(":%d", port), certFile, keyFile)
				} else {
					Server.Run(fmt.Sprintf(":%d", port))
				}
			}()

			// Register Subscribers

			treeChangeListener := func(ctx context.Context, msg *tree.NodeChangeEvent) error {
				return ws.HandleNodeChangeEvent(ctx, msg)
			}
			taskChangeListener := func(ctx context.Context, msg *jobs.TaskChangeEvent) error {
				return ws.BroadcastTaskChangeEvent(ctx, msg)
			}
			idmChangeListener := func(ctx context.Context, msg *idm.ChangeEvent) error {
				return ws.BroadcastIDMChangeEvent(ctx, msg)
			}
			activityListener := func(ctx context.Context, msg *activity.PostActivityEvent) error {
				return ws.BroadcastActivityEvent(ctx, msg)
			}

			if err := m.Options().Server.Subscribe(m.Options().Server.NewSubscriber(common.TOPIC_TREE_CHANGES, treeChangeListener)); err != nil {
				return err
			}
			if err := m.Options().Server.Subscribe(m.Options().Server.NewSubscriber(common.TOPIC_META_CHANGES, treeChangeListener)); err != nil {
				return err
			}
			if err := m.Options().Server.Subscribe(m.Options().Server.NewSubscriber(common.TOPIC_JOB_TASK_EVENT, taskChangeListener)); err != nil {
				return err
			}
			if err := m.Options().Server.Subscribe(m.Options().Server.NewSubscriber(common.TOPIC_IDM_EVENT, idmChangeListener)); err != nil {
				return err
			}
			if err := m.Options().Server.Subscribe(m.Options().Server.NewSubscriber(common.TOPIC_ACTIVITY_EVENT, activityListener)); err != nil {
				return err
			}

			// Register Chat Subscribers
			chatEventsListener := func(ctx context.Context, msg *chat2.ChatEvent) error {
				return chat.BroadcastChatMessage(ctx, msg)
			}
			if err := m.Options().Server.Subscribe(m.Options().Server.NewSubscriber(common.TOPIC_CHAT_EVENT, chatEventsListener)); err != nil {
				return err
			}

			return nil
		}),
	)
}
