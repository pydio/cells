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

// Package grpc provides a GRPC access to the underlying persistence layer for files metadata
package grpc

import (
	"context"
	"github.com/pydio/cells/v4/common/dao/mysql"
	"github.com/pydio/cells/v4/common/dao/sqlite"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/data/meta"
)

var (
	ServiceName = common.ServiceGrpcNamespace_ + common.ServiceMeta
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(ServiceName),
			service.Context(ctx),
			service.Tag(common.ServiceTagData),
			service.Description("Metadata server for tree nodes"),
			service.Unique(true),
			service.WithStorage(
				"DAO",
				meta.NewDAO,
				service.WithStoragePrefix("data_meta"),
				service.WithStorageSupport(mysql.Driver, sqlite.Driver),
			),
			service.WithGRPC(func(ctx context.Context, srv grpc.ServiceRegistrar) error {
				engine := NewMetaServer(ctx)

				tree.RegisterNodeProviderServer(srv, engine)
				tree.RegisterNodeProviderStreamerServer(srv, engine)
				tree.RegisterNodeReceiverServer(srv, engine)
				tree.RegisterSearcherServer(srv, engine)

				// Register Subscribers
				sub := engine.Subscriber(ctx)
				if e := broker.SubscribeCancellable(ctx, common.TopicTreeChanges, func(ctx context.Context, message broker.Message) error {
					msg := &tree.NodeChangeEvent{}
					if e := message.Unmarshal(msg); e == nil {
						return sub.Handle(ctx, msg)
					}
					return nil
				}, broker.WithCounterName("data_meta")); e != nil {
					engine.Stop()
					panic(e)
				}

				return nil
			}),
		)
	})
}
