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

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/proto/object"
	protosync "github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/data/source"
	"github.com/pydio/cells/v4/data/source/sync"
	grpc_sync "github.com/pydio/cells/v4/data/source/sync/grpc"
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
				resolver := source.NewResolver[*grpc_sync.Handler](source.DataSourceContextKey, common.ServiceDataSyncGRPC_, source.ListSources)
				endpoint := &grpc_sync.Endpoint{
					Resolver: resolver,
				}
				var errs []error
				resolver.SetLoader(func(ctx context.Context, s string) (*grpc_sync.Handler, error) {
					sync := grpc_sync.NewHandler(ctx, s)
					go func() {
						errs = append(errs, sync.InitAndStart())
					}()
					return sync, nil
				})
				resolver.SetCleaner(func(ctx context.Context, s string, _ *grpc_sync.Handler) error {
					_, er := endpoint.CleanResourcesBeforeDelete(ctx, &object.CleanResourcesRequest{})
					return er
				})
				_ = runtime.MultiContextManager().Iterate(ctx, func(ctx context.Context, s string) error {
					return resolver.HeatCacheAndWatch(ctx, configx.WithPath("services", common.ServiceDataSyncGRPC, "sources"))
				})
				tree.RegisterNodeProviderServer(registrar, endpoint)
				tree.RegisterNodeReceiverServer(registrar, endpoint)
				tree.RegisterNodeChangesReceiverStreamerServer(registrar, endpoint)
				protosync.RegisterSyncEndpointServer(registrar, endpoint)
				object.RegisterDataSourceEndpointServer(registrar, endpoint)
				object.RegisterResourceCleanerEndpointServer(registrar, endpoint)

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
