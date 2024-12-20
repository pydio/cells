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

// Package service is a GRPC service in charge of detecting updates and applying them
package service

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/proto/update"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
	grpc2 "github.com/pydio/cells/v5/discovery/update/grpc"
)

var Name = common.ServiceGrpcNamespace_ + common.ServiceUpdate

func init() {

	runtime.Register("main", func(ctx context.Context) {
		config.RegisterExposedConfigs(Name, grpc2.ExposedConfigs)

		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("Update checker service"),
			service.Migrations([]*service.Migration{
				service.DefaultConfigMigration(Name, map[string]interface{}{
					"channel": common.UpdateDefaultChannel,
				}),
			}),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {
				handler := new(grpc2.Handler)
				update.RegisterUpdateServiceServer(server, handler)
				return nil
			}),
		)
	})
}
