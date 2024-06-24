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

// Package service provides a GRPC access to the underlying persistence layer for files metadata
package service

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/data/meta"
	grpc2 "github.com/pydio/cells/v4/data/meta/grpc"
)

var (
	Name = common.ServiceGrpcNamespace_ + common.ServiceMeta
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagData),
			service.Description("Metadata server for tree nodes"),
			service.Unique(true),
			service.WithStorageDrivers(meta.Drivers...),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.FirstRun(),
					Up: func(ctx context.Context) error {
						dao, err := manager.Resolve[meta.DAO](ctx)
						if err != nil {
							return err
						}

						return dao.Migrate(ctx)
					},
				},
			}),
			service.WithGRPC(func(ctx context.Context, srv grpc.ServiceRegistrar) error {
				engine := grpc2.NewMetaServer(ctx, Name)

				tree.RegisterNodeProviderServer(srv, engine)
				tree.RegisterNodeProviderStreamerServer(srv, engine)
				tree.RegisterNodeReceiverServer(srv, engine)
				//tree.RegisterSearcherServer(srv, engine) // TODO ?

				// Register Subscriber
				if e := broker.SubscribeCancellable(ctx, common.TopicTreeChanges, func(ctx context.Context, message broker.Message) error {
					msg := &tree.NodeChangeEvent{}
					if ct, e := message.Unmarshal(ctx, msg); e == nil {
						if msg.Optimistic {
							return nil
						}
						ct = runtime.WithServiceName(ct, common.ServiceGrpcNamespace_+common.ServiceMeta)
						return engine.ProcessEvent(ct, msg)
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
