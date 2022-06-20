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

// Package grpc provides a gRPC service to effectively run task instances on multiple workers.
package grpc

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/jobs/bleveimpl"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/scheduler/tasks"
)

const ServiceName = common.ServiceGrpcNamespace_ + common.ServiceTasks

func init() {
	jobs.RegisterNodesFreeStringEvaluator(bleveimpl.EvalFreeString)

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(ServiceName),
			service.Context(ctx),
			service.Tag(common.ServiceTagScheduler),
			service.Fork(true),
			service.Description("Tasks are running jobs dispatched on multiple workers"),
			service.WithGRPC(func(c context.Context, server *grpc.Server) error {
				jobs.RegisterTaskServiceEnhancedServer(server, new(Handler))
				multiplexer := tasks.NewSubscriber(c)
				multiplexer.Init()
				go func() {
					<-c.Done()
					multiplexer.Stop()
				}()
				return nil
			}),
		)
	})
}
