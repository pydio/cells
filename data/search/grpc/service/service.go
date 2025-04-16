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

// Package service provides the Pydio grpc service for querying indexer.
//
// Insertion in the index is not performed directly but via events broadcasted by the broker.
package service

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/proto/sync"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/data/search"
	grpc2 "github.com/pydio/cells/v5/data/search/grpc"
)

var (
	Name = common.ServiceGrpcNamespace_ + common.ServiceSearch
)

func init() {

	config.RegisterExposedConfigs(Name, grpc2.ExposedConfigs)

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagData),
			service.Description("Search Engine"),
			service.Migrations([]*service.Migration{
				service.DefaultConfigMigration(Name, map[string]interface{}{
					"indexContent":        false,
					"basenameAnalyzer":    "standard",
					"contentAnalyzer":     "en",
					"contentRef":          "pydio:ContentRef",
					"plainTextExtensions": "text,md",
				}),
			}),
			service.WithStorageDrivers(search.Drivers),
			service.WithGRPC(func(c context.Context, server grpc.ServiceRegistrar) error {

				searcher := &grpc2.SearchServer{
					// NsProvider:       nsProvider,
					ReIndexThrottler: make(chan struct{}, 5),
				}

				tree.RegisterSearcherServer(server, searcher)
				sync.RegisterSyncEndpointServer(server, searcher)

				opts := []broker.SubscribeOption{
					broker.Queue("search"),
					broker.WithCounterName("search"),
				}
				var mgr manager.Manager
				if propagator.Get(c, manager.ContextKey, &mgr) {
					if d, e := mgr.GetQueuePool(common.QueueTypePersistent); e == nil {
						opts = append(opts, broker.WithAsyncQueuePool(d, map[string]interface{}{"name": "search"}))
					}
				}

				subscriber := searcher.Subscriber()
				if e := broker.SubscribeCancellable(c, common.TopicMetaChanges, func(ctx context.Context, message broker.Message) error {
					msg := &tree.NodeChangeEvent{}
					if ct, e := message.Unmarshal(ctx, msg); e == nil {
						return subscriber.Handle(ct, msg)
					}
					return nil
				}, opts...); e != nil {
					//_ = bleveEngine.Close()
					return e
				}

				return nil
			}),
		)
	})
}
