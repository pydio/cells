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
	"sync"

	micro "github.com/micro/go-micro"
	"github.com/micro/go-micro/server"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/defaults"
)

func init() {
	service.NewService(
		service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_TREE),
		service.Tag(common.SERVICE_TAG_DATA),
		service.Description("Aggregator of all datasources into one master tree"),
		service.WithMicro(func(m micro.Service) error {

			ctx := m.Options().Context

			dataSources := map[string]DataSource{}
			// metaServiceClient := tree.NewNodeProviderClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_META, srv.Client())
			//metaServiceStreamer := tree.NewNodeProviderStreamerClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_META, srv.Client())

			treeServer := &TreeServer{
				ConfigsMutex: &sync.Mutex{},
				DataSources:  dataSources,
				meta:         tree.NewNodeProviderClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_META, defaults.NewClient()),
			}

			eventSubscriber := &EventSubscriber{
				TreeServer:  treeServer,
				EventClient: defaults.NewClient(),
			}

			updateServicesList(ctx, treeServer)

			tree.RegisterNodeProviderHandler(m.Options().Server, treeServer)
			tree.RegisterNodeReceiverHandler(m.Options().Server, treeServer)

			go watchRegistry(ctx, treeServer)

			// Register Subscribers
			if err := m.Options().Server.Subscribe(
				m.Options().Server.NewSubscriber(
					common.TOPIC_INDEX_CHANGES,
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
}
