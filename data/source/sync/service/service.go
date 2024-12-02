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

// Package sync ties the "objects" and "index" together
package service

import (
	"context"

	"go.uber.org/multierr"
	"google.golang.org/grpc"
	"google.golang.org/grpc/health"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/proto/object"
	"github.com/pydio/cells/v5/common/proto/server"
	protosync "github.com/pydio/cells/v5/common/proto/sync"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/data/source"
	"github.com/pydio/cells/v5/data/source/sync"
	grpc_sync "github.com/pydio/cells/v5/data/source/sync/grpc"
)

func init() {

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceDataSyncGRPC),
			service.Context(ctx),
			service.Tag(common.ServiceTagDatasource),
			service.Description("Starter for data sources synchronizations"),
			service.WithMigrateIterator(source.DataSourceContextKey, source.ListSources),
			service.WithStorageDrivers(sync.Drivers...),
			service.WithGRPC(func(ctx context.Context, registrar grpc.ServiceRegistrar) error {
				resolver := source.NewResolver[*grpc_sync.Syncer](source.DataSourceContextKey, common.ServiceDataSyncGRPC_, source.ListSources)
				handler := &grpc_sync.Handler{
					Resolver:     resolver,
					HealthServer: health.NewServer(),
				}
				var errs []error
				resolver.SetLoader(func(ctx context.Context, s string) (*grpc_sync.Syncer, error) {
					syncer, err := grpc_sync.NewSyncer(ctx, s)
					if err != nil {
						return nil, err
					}
					go func() {
						errs = append(errs, syncer.InitAndStart())
					}()
					return syncer, nil
				})
				resolver.SetCleaner(func(ctx context.Context, s string, _ *grpc_sync.Syncer) error {
					_, er := handler.CleanResourcesBeforeDelete(ctx, &object.CleanResourcesRequest{})
					return er
				})
				_ = runtime.MultiContextManager().Iterate(ctx, func(ctx context.Context, s string) error {
					return resolver.HeatCacheAndWatch(ctx, configx.WithPath("services", common.ServiceDataSyncGRPC, "sources"))
				})
				tree.RegisterNodeProviderServer(registrar, handler)
				tree.RegisterNodeReceiverServer(registrar, handler)
				tree.RegisterNodeChangesReceiverStreamerServer(registrar, handler)
				protosync.RegisterSyncEndpointServer(registrar, handler)
				object.RegisterDataSourceEndpointServer(registrar, handler)
				object.RegisterResourceCleanerEndpointServer(registrar, handler)
				server.RegisterReadyzServer(registrar, handler)

				return multierr.Combine(errs...)
			}),
		)
	})
}

// Manage datasources deletion operations : clean index tables
func onDataSourceDelete(ctx context.Context, deletedSource string) {

	log.Logger(ctx).Info("Sync = Send Event Server-wide for " + deletedSource)
	broker.MustPublish(ctx, common.TopicDatasourceEvent, &object.DataSourceEvent{
		Type: object.DataSourceEvent_DELETE,
		Name: deletedSource,
	})

}
