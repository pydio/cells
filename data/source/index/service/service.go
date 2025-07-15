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

package service

import (
	"context"
	grpc3 "github.com/pydio/cells/v5/common/client/grpc"
	service2 "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"go.uber.org/zap"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/proto/object"
	"github.com/pydio/cells/v5/common/proto/server"
	"github.com/pydio/cells/v5/common/proto/sync"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/utils/watch"
	"github.com/pydio/cells/v5/data/source"
	"github.com/pydio/cells/v5/data/source/index"
	grpc2 "github.com/pydio/cells/v5/data/source/index/grpc"
)

var (
	// Name of the current plugin
	Name = common.ServiceGrpcNamespace_ + common.ServiceDataIndex
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagDatasource),
			service.WithStorageDrivers(index.Drivers),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.FirstRunOrChange(),
					Up:            manager.StorageMigration(),
				},
			}),
			service.WithMigrateIterator(source.DataSourceContextKey, source.ListSources),
			service.WithMigrateWatcher(source.DataSourceContextKey, source.WatchSources),
			service.Description("Starter for data sources indexes"),
			service.WithGRPC(func(ctx context.Context, srv grpc.ServiceRegistrar) error {

				resolver := source.NewResolver[*object.DataSource](source.DataSourceContextKey, common.ServiceDataIndexGRPC_, source.ListSources)
				resolver.SetLoader(func(ctx context.Context, s string) (*object.DataSource, error) {
					if !source.IsFirstRunContext(ctx) {
						// This is required to launch service migration
						// when datasource is created at runtime
						log.Logger(ctx).Info("Running migration for DS " + s)
						go func() {
							cli := service2.NewMigrateServiceClient(grpc3.ResolveConn(ctx, common.ServiceInstallGRPC))
							resp, err := cli.Migrate(ctx, &service2.MigrateRequest{
								Services: []string{common.ServiceDataIndexGRPC},
								Version:  common.Version().String(),
							})
							if err != nil || !resp.Success {
								log.Logger(ctx).Warn("Migration failed for DS "+s, zap.Error(err))
							}
						}()
					}
					return config.GetSourceInfoByName(ctx, s)
				})
				shared := grpc2.NewSharedTreeServer(resolver)
				resolver.SetCleaner(func(ctx context.Context, s string, dataSource *object.DataSource) error {
					_, er := shared.CleanResourcesBeforeDelete(ctx, &object.CleanResourcesRequest{})
					return er
				})

				_ = runtime.MultiContextManager().Iterate(ctx, func(ctx context.Context, s string) error {
					return resolver.HeatCacheAndWatch(ctx, watch.WithPath("services", Name, "sources"))
				})

				tree.RegisterNodeReceiverServer(srv, shared)
				tree.RegisterNodeProviderServer(srv, shared)
				tree.RegisterNodeReceiverStreamServer(srv, shared)
				tree.RegisterNodeProviderStreamerServer(srv, shared)
				tree.RegisterSessionIndexerServer(srv, shared)
				object.RegisterResourceCleanerEndpointServer(srv, shared)
				sync.RegisterSyncEndpointServer(srv, shared)
				server.RegisterReadyzServer(srv, shared)

				return nil
			}),
		)
	})
}
