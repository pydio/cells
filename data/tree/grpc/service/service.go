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

// Package service provides a GRPC service for aggregating all indexes from all datasources
package service

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/config"
	service2 "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/utils/configx"
	grpc2 "github.com/pydio/cells/v4/data/tree/grpc"
)

var Name = common.ServiceGrpcNamespace_ + common.ServiceTree

func init() {
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagData),
			service.Description("Aggregator of all datasources into one master tree"),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {

				treeServer := grpc2.NewTreeServer(Name)
				eventSubscriber := grpc2.NewEventSubscriber(treeServer)

				_ = runtime.MultiContextManager().Iterate(ctx, func(ct context.Context, s string) error {
					// TODO - should be a callback
					go func() {
						w, err := config.Watch(ctx, configx.WithPath("services", common.ServiceDataSyncGRPC, "sources"))
						if err != nil {
							return
						}

						defer w.Stop()

						for {
							_, err := w.Next()
							if err != nil {
								return
							}

							treeServer.UpdateServicesList(ct, 0)
						}
					}()

					go treeServer.UpdateServicesList(ct, 0)
					go treeServer.WatchRegistry(ct)
					return nil
				})

				tree.RegisterNodeProviderServer(server, treeServer)
				tree.RegisterNodeReceiverServer(server, treeServer)
				tree.RegisterSearcherServer(server, treeServer)
				tree.RegisterNodeChangesStreamerServer(server, treeServer)
				tree.RegisterNodeProviderStreamerServer(server, treeServer)
				service2.RegisterLoginModifierServer(server, treeServer)

				if err := broker.SubscribeCancellable(ctx, common.TopicIndexChanges, func(ctx context.Context, message broker.Message) error {
					msg := &tree.NodeChangeEvent{}
					if ctx, e := message.Unmarshal(ctx, msg); e == nil {
						return eventSubscriber.Handle(ctx, msg)
					}
					return nil
				}, broker.Queue("tree")); err != nil {
					return err
				}

				return nil
			}),
		)
	})
}
