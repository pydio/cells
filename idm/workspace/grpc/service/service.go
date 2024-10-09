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

// Package service provides the GRPC persistence for workspaces
package service

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/proto/idm"
	service2 "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/service/resources"
	"github.com/pydio/cells/v4/idm/workspace"
	grpc2 "github.com/pydio/cells/v4/idm/workspace/grpc"
)

const (
	Name = common.ServiceGrpcNamespace_ + common.ServiceWorkspace
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Description("Workspaces Service"),
			service.WithStorageDrivers(workspace.Drivers...),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.FirstRun(),
					Up:            manager.StorageMigration(),
				},
			}),
			service.WithGRPC(func(ctx context.Context, srv grpc.ServiceRegistrar) error {
				h := grpc2.NewHandler()
				idm.RegisterWorkspaceServiceServer(srv, h)
				service2.RegisterLoginModifierServer(srv, h)

				//// Register a cleaner for removing a workspace when there are no more ACLs on it.
				wsCleaner := grpc2.NewWsCleaner(ctx, h)
				cleaner := &resources.PoliciesCleaner{
					Options: resources.PoliciesCleanerOptions{
						SubscribeRoles: true,
						SubscribeUsers: true,
					},
				}

				if e := broker.SubscribeCancellable(ctx, common.TopicIdmEvent, func(ctx context.Context, message broker.Message) error {
					ev := &idm.ChangeEvent{}
					if ct, e := message.Unmarshal(ctx, ev); e == nil {
						dao, err := manager.Resolve[workspace.DAO](ct)
						if err != nil {
							return err
						}
						ct = runtime.WithServiceName(ct, Name)
						_ = wsCleaner.Handle(ct, ev)
						return cleaner.Handle(ct, dao, ev)
					}
					return nil
				}); e != nil {
					return e
				}
				return nil
			}),
		)
	})
}
