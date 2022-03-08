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

// Package grpc wraps a Minio server for exposing the content of the datasource with the S3 protocol.
package grpc

import (
	"context"
	"fmt"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
)

func init() {

	runtime.Register("main", func(ctx context.Context) {

		sources := config.SourceNamesForDataServices(common.ServiceDataObjects)
		mm := config.ListMinioConfigsFromConfig()

		for _, datasource := range sources {
			service.NewService(
				service.Name(common.ServiceGrpcNamespace_+common.ServiceDataObjects_+datasource),
				service.Context(ctx),
				service.Tag(common.ServiceTagDatasource),
				service.Description("S3 Object service for a given datasource"),
				service.Source(datasource),
				service.Fork(true),
				service.Unique(true),
				service.AutoStart(false),
				service.WithGRPC(func(datasource string) func(c context.Context, server *grpc.Server) error {
					return func(c context.Context, server *grpc.Server) error {
						mc, ok := mm[datasource]
						if !ok {
							return fmt.Errorf("cannot find minio config")
						}
						mc.RunningSecure = false
						mc.RunningHost = runtime.DefaultAdvertiseAddress()
						engine := &ObjectHandler{
							handlerName: common.ServiceGrpcNamespace_ + common.ServiceDataObjects_ + datasource,
							Config:      mc,
						}
						object.RegisterObjectsEndpointEnhancedServer(server, engine)
						var startErr error
						go func() {
							startErr = engine.StartMinioServer(c, datasource)
						}()
						return startErr
					}
				}(datasource)),
			)
		}
	})
}
