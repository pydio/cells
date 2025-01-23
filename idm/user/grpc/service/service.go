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

// Package service provides the gRPC service to communicate with the Pydio's user persistence layer.
package service

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/proto/idm"
	service2 "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/idm/user"
	grpc2 "github.com/pydio/cells/v5/idm/user/grpc"
)

const (
	Name = common.ServiceGrpcNamespace_ + common.ServiceUser
)

func init() {

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm, "users"),
			service.Description("Users persistence layer"),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.FirstRunOrChange(),
					Up:            manager.StorageMigration(),
				},
				{
					TargetVersion: service.FirstRun(),
					Up:            grpc2.InitDefaults,
				},
			}),
			service.WithStorageDrivers(user.Drivers...),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {

				handler := grpc2.NewHandler()
				idm.RegisterUserServiceServer(server, handler)
				service2.RegisterLoginModifierServer(server, handler)

				// Register a cleaner for removing a workspace when there are no more ACLs on it.
				if e := broker.SubscribeCancellable(ctx, common.TopicIdmEvent, func(ctx context.Context, message broker.Message) error {
					ev := &idm.ChangeEvent{}
					if ct, e := message.Unmarshal(ctx, ev); e == nil {
						return grpc2.HandleClean(ct, ev)
					}
					return nil
				}, broker.WithCounterName("user")); e != nil {
					return e
				}

				return nil
			}),
		)
	})
}
