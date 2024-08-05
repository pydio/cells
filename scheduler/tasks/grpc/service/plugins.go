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

// Package service provides a gRPC service to effectively run task instances on multiple workers.
package service

import (
	"context"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	grpc3 "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/jobs/bleveimpl"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/tenant"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/scheduler/tasks"
	grpc2 "github.com/pydio/cells/v4/scheduler/tasks/grpc"
)

const Name = common.ServiceGrpcNamespace_ + common.ServiceTasks

func init() {
	jobs.RegisterNodesFreeStringEvaluator(bleveimpl.EvalFreeString)
	jobs.RegisterConnexionResolver(func(ctx context.Context, serviceName string) grpc.ClientConnInterface {
		return grpc3.ResolveConn(ctx, serviceName)
	})
	jobs.RegisterClaimsUsernameParser(permissions.FindUserNameInContext)
	jobs.RegisterClientUniqueUser(permissions.SearchUniqueUser)
	jobs.RegisterClientUniqueWorkspace(permissions.SearchUniqueWorkspace)

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagScheduler),
			// service.Fork(true),
			service.Description("Tasks are running jobs dispatched on multiple workers"),
			service.WithGRPC(func(c context.Context, server grpc.ServiceRegistrar) error {
				jobs.RegisterTaskServiceServer(server, new(grpc2.TaskHandler))
				return tenant.GetManager().Iterate(c, func(c context.Context, t tenant.Tenant) error {
					tc := t.Context(c)
					multiplexer := tasks.NewSubscriber(tc)
					var me error
					go func() {
						if er := multiplexer.Init(tc); er != nil {
							log.Logger(c).Error("Could not properly start tasks multiplexer: "+er.Error(), zap.Error(er))
							me = er
							return
						}
						// Else wait for c.Done()
						<-c.Done()
						multiplexer.Stop()
					}()
					// Eventually return me if it was fast enough
					return me
				})
			}),
		)
	})
}
