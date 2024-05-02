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

// Package grpc provides the persistence for workspaces
package grpc

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
)

const (
	ServiceName = common.ServiceGrpcNamespace_ + common.ServiceWorkspace
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(ServiceName),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Description("Workspaces Service"),
			service.WithStorageDrivers("main", workspace.NewDAO),
			service.WithGRPC(func(ctx context.Context, srv grpc.ServiceRegistrar) error {
				h := NewHandler()
				idm.RegisterWorkspaceServiceServer(srv, h)
				service2.RegisterLoginModifierServer(srv, h)

				// Register a cleaner for removing a workspace when there are no more ACLs on it.
				wsCleaner := NewWsCleaner(ctx, h)
				cleaner := &resources.PoliciesCleaner{
					Options: resources.PoliciesCleanerOptions{
						SubscribeRoles: true,
						SubscribeUsers: true,
					},
					LogCtx: ctx,
				}

				if e := broker.SubscribeCancellable(ctx, common.TopicIdmEvent, func(ctx context.Context, message broker.Message) error {
					ev := &idm.ChangeEvent{}
					if ct, e := message.Unmarshal(ctx, ev); e == nil {
						dao, err := manager.Resolve[workspace.DAO](ct)
						if err != nil {
							return err
						}
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
