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

// Package grpc provides a GRPC service for aggregating all indexes from all datasources
package grpc

import (
	"context"
	"sync"

	"github.com/micro/go-micro"
	"github.com/micro/go-micro/server"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
)

func init() {
	plugins.Register(func(ctx context.Context) {
		service.NewService(
			service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_TREE),
			service.Context(ctx),
			service.Tag(common.SERVICE_TAG_DATA),
			service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_META, []string{}),
			service.Description("Aggregator of all datasources into one master tree"),
			service.WithMicro(func(m micro.Service) error {

				ctx := m.Options().Context

				dataSources := map[string]DataSource{}
				treeServer := &TreeServer{
					ConfigsMutex: &sync.Mutex{},
					DataSources:  dataSources,
					meta:         tree.NewNodeProviderClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_META, defaults.NewClient()),
				}

				eventSubscriber := NewEventSubscriber(treeServer, defaults.NewClient())

				updateServicesList(ctx, treeServer)

				srv := m.Options().Server
				tree.RegisterNodeProviderHandler(srv, treeServer)
				tree.RegisterNodeReceiverHandler(srv, treeServer)
				tree.RegisterSearcherHandler(srv, treeServer)
				tree.RegisterNodeChangesStreamerHandler(srv, treeServer)
				tree.RegisterNodeProviderStreamerHandler(srv, treeServer)

				go watchRegistry(ctx, treeServer)

				if err := m.Options().Server.Subscribe(
					m.Options().Server.NewSubscriber(
						common.TopicIndexChanges,
						eventSubscriber,
						func(o *server.SubscriberOptions) {
							o.Queue = "tree"
						},
					),
				); err != nil {
					return err
				}

				return nil
			}),
		)
	})
}
