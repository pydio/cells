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

// Package grpc provides the Pydio grpc service for querying indexer.
//
// Insertion in the index is not performed directly but via events broadcasted by the broker.
package grpc

import (
	"context"
	"github.com/pydio/cells/v4/common/dao/mongodb"
	"path/filepath"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/config"
	dao2 "github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/bleve"
	"github.com/pydio/cells/v4/common/nodes/meta"
	"github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/data/search/dao"
)

var (
	Name = common.ServiceGrpcNamespace_ + common.ServiceSearch
)

func init() {

	config.RegisterExposedConfigs(Name, ExposedConfigs)

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagData),
			service.Description("Search Engine"),
			service.Fork(true),
			service.WithIndexer(dao.NewDAO,
				service.WithStoragePrefix("searchengine"),
				service.WithStorageSupport(bleve.Driver, mongodb.Driver),
				service.WithStorageDefaultDriver(func() (string, string) {
					return bleve.Driver, filepath.Join(runtime.MustServiceDataDir(Name), "searchengine.bleve?rotationSize=-1&mapping=node")
				}),
			),
			service.WithGRPC(func(c context.Context, server *grpc.Server) error {

				cfg := config.Get("services", Name)
				nsProvider := meta.NewNsProvider(c)
				indexer := servicecontext.GetIndexer(c).(dao2.IndexDAO)
				bleveEngine, err := dao.NewEngine(c, indexer, nsProvider, cfg)
				if err != nil {
					return err
				}

				searcher := &SearchServer{
					RuntimeCtx:       c,
					Engine:           bleveEngine,
					NsProvider:       nsProvider,
					ReIndexThrottler: make(chan struct{}, 5),
				}

				tree.RegisterSearcherEnhancedServer(server, searcher)
				sync.RegisterSyncEndpointEnhancedServer(server, searcher)

				subscriber := searcher.Subscriber()
				if e := broker.SubscribeCancellable(c, common.TopicMetaChanges, func(message broker.Message) error {
					msg := &tree.NodeChangeEvent{}
					if ct, e := message.Unmarshal(msg); e == nil {
						return subscriber.Handle(ct, msg)
					}
					return nil
				}); e != nil {
					//_ = bleveEngine.Close()
					return e
				}

				return nil
			}),
		)
	})
}
