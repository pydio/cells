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

// Package service provides the GRPC persistence layer for CRUD-ing roles
package service

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/idm/role"
	grpc2 "github.com/pydio/cells/v5/idm/role/grpc"
)

const ServiceName = common.ServiceGrpcNamespace_ + common.ServiceRole

func init() {
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(ServiceName),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Description("Roles Service"),
			service.WithStorageDrivers(role.Drivers),
			service.Migrations(append([]*service.Migration{
				{
					TargetVersion: service.FirstRunOrChange(),
					Up:            manager.StorageMigration(),
				},
			}, grpc2.GrpcServiceMigrations...)),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {
				handler := grpc2.NewHandler()
				idm.RegisterRoleServiceServer(server, handler)
				// Clean role on user deletion
				cleaner := grpc2.NewCleaner(handler)
				if e := broker.SubscribeCancellable(ctx, common.TopicIdmEvent, func(ctx context.Context, message broker.Message) error {
					ic := &idm.ChangeEvent{}
					if ctx, e := message.Unmarshal(ctx, ic); e == nil {
						return cleaner.Handle(ctx, ic)
					}
					return nil
				}, broker.WithCounterName("role")); e != nil {
					panic(e)
				}
				return nil
			}),
		)
	})
}
