/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

// Package service provides a GRPC policy engine service
package service

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/idm/policy"
	grpc2 "github.com/pydio/cells/v4/idm/policy/grpc"
)

const Name = common.ServiceGrpcNamespace_ + common.ServicePolicy

func init() {
	runtime.Register("main", func(ctx context.Context) {

		migs := append([]*service.Migration{
			{
				TargetVersion: service.FirstRun(),
				Up:            manager.StorageMigration(),
			},
		}, policy.GrpcServiceMigrations...)
		migs = append(migs, &service.Migration{
			TargetVersion: service.ValidVersion("4.5.0"),
			Up: func(ctx context.Context) error {
				dao, er := manager.Resolve[policy.DAO](ctx)
				if er != nil {
					return er
				}
				return dao.MigrateLegacy(ctx)
			},
		})

		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Description("Policy Engine Service"),
			service.WithStorageDrivers(policy.Drivers...),
			service.Migrations(migs),
			service.WithGRPC(func(ctx context.Context, srv grpc.ServiceRegistrar) error {
				handler := grpc2.NewHandler()
				idm.RegisterPolicyEngineServiceServer(srv, handler)
				return nil
			}),
		)
	})
}
