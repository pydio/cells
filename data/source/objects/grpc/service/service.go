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

// Package service wraps a Minio server for exposing the content of the datasource with the S3 protocol.
package service

import (
	"context"
	"os"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	grpc2 "github.com/pydio/cells/v4/data/source/objects/grpc"
)

func init() {

	runtime.Register("datasource-objects", func(ctx context.Context) {

		datasource := os.Getenv("DATASOURCE")

		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceDataObjects_+datasource),
			service.Context(ctx),
			service.Tag(common.ServiceTagDatasource),
			service.Description("S3 Object service for a given datasource"),
			service.Source(datasource),
			service.WithGRPC(func(datasource string) func(c context.Context, server grpc.ServiceRegistrar) error {
				return func(c context.Context, server grpc.ServiceRegistrar) error {
					conf := config.GetMinioConfigForName(c, datasource, true)
					mc, er := grpc2.InitMinioConfig(conf)
					if er != nil {
						return er
					}
					engine := &grpc2.ObjectHandler{
						PresetConfig: mc,
					}
					object.RegisterObjectsEndpointServer(server, engine)
					object.RegisterResourceCleanerEndpointServer(server, engine)
					var startErr error
					go func() {
						startErr = engine.StartMinioServer(c, mc, datasource)
					}()
					return startErr
				}
			}(datasource)),
		)
	})
}
