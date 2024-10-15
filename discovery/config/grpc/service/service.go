/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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
	"github.com/pydio/cells/v4/common/config"
	json "github.com/pydio/cells/v4/common/utils/jsonx"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	pb "github.com/pydio/cells/v4/common/proto/config"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	grpc2 "github.com/pydio/cells/v4/discovery/config/grpc"
)

const (
	serviceName = common.ServiceGrpcNamespace_ + common.ServiceConfig
)

func init() {
	runtime.Register("discovery", func(ctx context.Context) {
		service.NewService(
			service.Name(serviceName),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("Grpc service for serving configurations to forks"),
			// service.WithStorageDrivers(configsql.NewDAO),
			service.Migrations([]*service.Migration{
				//{
				//	TargetVersion: service.FirstRun(),
				//	Up:            manager.StorageMigration(),
				//},
				{
					TargetVersion: service.FirstRun(),
					Up: func(ctx context.Context) error {
						var data any
						if err := json.Unmarshal([]byte(config.SampleConfig), &data); err == nil {
							if err := config.Get(ctx).Set(data); err == nil {
								_ = config.Save(ctx, common.PydioSystemUsername, "Initialize with sample config")
							}
						}

						return nil
					},
				},
			}),
			service.WithGRPC(func(c context.Context, srv grpc.ServiceRegistrar) error {
				pb.RegisterConfigServer(srv, grpc2.NewHandler())

				return nil
			}),
		)
	})
}
