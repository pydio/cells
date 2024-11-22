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

// Package objects is in charge of exposing the content of the datasource with the S3 protocol.
package service

import (
	"context"

	"go.uber.org/multierr"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/object"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/data/source"
	"github.com/pydio/cells/v5/data/source/objects"
	grpc2 "github.com/pydio/cells/v5/data/source/objects/grpc"
)

func init() {

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceDataObjectsGRPC),
			service.Context(ctx),
			service.Tag(common.ServiceTagDatasource),
			service.Description("Starter for different sources objects"),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {

				fsBrowser := objects.NewFsBrowser()
				tree.RegisterNodeProviderServer(server, fsBrowser)
				tree.RegisterNodeReceiverServer(server, fsBrowser)

				resolver := source.NewResolver[*grpc2.RunningMinioHandler](source.ObjectServiceContextKey, common.ServiceDataObjectsGRPC_, source.ListObjects)
				sharedHandler := grpc2.NewSharedObjectHandler(resolver)
				resolver.SetLoader(func(ctx context.Context, s string) (*grpc2.RunningMinioHandler, error) {
					var er error
					mc := config.GetMinioConfigForName(ctx, s, true)
					if mc == nil {
						return nil, errors.New("no config for " + s)
					}
					mc, er = grpc2.InitMinioConfig(mc)
					if er != nil {
						return nil, er
					}
					mCtx, mCan := context.WithCancel(ctx)
					go func() {
						er = sharedHandler.StartMinioServer(mCtx, mc, s)
					}()
					return &grpc2.RunningMinioHandler{MinioConfig: mc, Cancel: mCan}, er
				})
				resolver.SetCleaner(func(ctx context.Context, s string, handler *grpc2.RunningMinioHandler) error {
					// Stop minio service with Cancel
					handler.Cancel()
					_, er := sharedHandler.CleanResourcesBeforeDelete(ctx, &object.CleanResourcesRequest{})
					return er
				})
				var mErr []error
				_ = runtime.MultiContextManager().Iterate(ctx, func(ctx context.Context, s string) error {
					return resolver.HeatCacheAndWatch(ctx, configx.WithPath("services", common.ServiceGrpcNamespace_+common.ServiceDataObjects, "sources"))
				})
				object.RegisterObjectsEndpointServer(server, sharedHandler)
				object.RegisterResourceCleanerEndpointServer(server, sharedHandler)

				return multierr.Combine(mErr...)
			}),
		)
	})
}

// Manage datasources deletion operations : clean minio server configuration folder
func onDeleteObjectsConfig(ctx context.Context, objectConfigName string) {
	if err := objects.DeleteMinioConfigDir(objectConfigName); err != nil {
		log.Logger(ctx).Error("Could not remove configuration folder for object service " + objectConfigName)
	} else {
		log.Logger(ctx).Info("Removed configuration folder for object service " + objectConfigName)
	}
}
