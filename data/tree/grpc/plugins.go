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

// Package grpc provides a GRPC service for aggregating all indexes from all datasources
package grpc

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
)

var ServiceName = common.ServiceGrpcNamespace_ + common.ServiceTree

func init() {
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(ServiceName),
			service.Context(ctx),
			service.Tag(common.ServiceTagData),
			service.Description("Aggregator of all datasources into one master tree"),
			service.WithGRPC(func(ctx context.Context, server *grpc.Server) error {

				treeServer := &TreeServer{
					name:        ServiceName,
					MainCtx:     ctx,
					DataSources: map[string]DataSource{},
				}
				eventSubscriber := NewEventSubscriber(treeServer)

				go updateServicesList(ctx, treeServer, 0)

				tree.RegisterNodeProviderEnhancedServer(server, treeServer)
				tree.RegisterNodeReceiverEnhancedServer(server, treeServer)
				tree.RegisterSearcherEnhancedServer(server, treeServer)
				tree.RegisterNodeChangesStreamerEnhancedServer(server, treeServer)
				tree.RegisterNodeProviderStreamerEnhancedServer(server, treeServer)

				go watchRegistry(ctx, treeServer)

				if err := broker.SubscribeCancellable(ctx, common.TopicIndexChanges, func(message broker.Message) error {
					msg := &tree.NodeChangeEvent{}
					if ct, e := message.Unmarshal(msg); e == nil {
						return eventSubscriber.Handle(ct, msg)
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
