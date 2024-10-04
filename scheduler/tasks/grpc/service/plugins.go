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
	"github.com/pydio/cells/v4/common/broker"
	grpc3 "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/jobs/bleveimpl"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/scheduler/tasks"
	grpc2 "github.com/pydio/cells/v4/scheduler/tasks/grpc"
)

const Name = common.ServiceGrpcNamespace_ + common.ServiceTasks

func init() {
	jobs.RegisterNodesFreeStringEvaluator(bleveimpl.EvalFreeString)
	jobs.RegisterConnexionResolver(func(ctx context.Context, serviceName string) grpc.ClientConnInterface {
		return grpc3.ResolveConn(ctx, common.ServiceGrpcNamespace_+serviceName)
	})
	jobs.RegisterClaimsUsernameParser(permissions.FindUserNameInContext)
	jobs.RegisterClientUniqueUser(permissions.SearchUniqueUser)
	jobs.RegisterClientUniqueWorkspace(permissions.SearchUniqueWorkspace)

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagScheduler),
			service.Description("Tasks are running jobs dispatched on multiple workers"),
			service.WithGRPC(func(c context.Context, server grpc.ServiceRegistrar) error {
				// Prepare opener
				subs, er := openurl.MemPool[*tasks.Subscriber](c, func(ctx context.Context, url string) (*tasks.Subscriber, error) {
					multiplexer := tasks.NewSubscriber(ctx)
					var me error
					// Start in a go func as it can be blocking waiting for grpc connection to other services
					go func() {
						if er := multiplexer.Init(ctx); er != nil {
							log.Logger(c).Error("Could not properly start tasks multiplexer: "+er.Error(), zap.Error(er))
							me = er
							return
						}
						<-ctx.Done()
						multiplexer.Stop()
					}()
					return multiplexer, me
				})
				if er != nil {
					return er
				}
				jobs.RegisterTaskServiceServer(server, new(grpc2.TaskHandler))
				er = runtime.MultiContextManager().Iterate(c, func(tc context.Context, _ string) error {
					// Force initialization of all subscribers now
					_, e := subs.Get(tc)
					return e
				})
				if er != nil {
					return er
				}
				queueOpt := broker.Queue("tasks")
				counterOpt := broker.WithCounterName("tasks")

				topics := []string{
					common.TopicIdmEvent,
					common.TopicTimerEvent,
					common.TopicJobConfigEvent,
					common.TopicTreeChanges,
					common.TopicMetaChanges,
				}
				for _, topic := range topics {
					if er = broker.SubscribeCancellable(c, topic, func(ctx context.Context, msg broker.Message) error {
						sub, e := subs.Get(ctx)
						if e != nil {
							return e
						}
						ctx = context.WithoutCancel(ctx)
						ctx = runtime.WithServiceName(ctx, common.ServiceTasksGRPC)
						return sub.Consume(ctx, topic, msg, false)
					}, queueOpt, counterOpt); er != nil {
						return er
					}
				}

				return nil
			}),
		)
	})
}
