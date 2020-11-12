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

// Package grpc provides a gRPC service that triggers scheduler events based on ISO 8601 patterns.
package grpc

import (
	"context"

	"github.com/micro/go-micro"
	"github.com/pydio/cells/common/plugins"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/scheduler/timer"
)

func init() {
	plugins.Register(func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceTimer),
			service.Context(ctx),
			service.Tag(common.ServiceTagScheduler),
			service.Dependency(common.ServiceGrpcNamespace_+common.ServiceJobs, []string{}),
			service.Dependency(common.ServiceGrpcNamespace_+common.ServiceTasks, []string{}),
			service.Description("Triggers events based on a scheduler pattern"),
			service.WithMicro(func(m micro.Service) error {

				producer := timer.NewEventProducer(m.Options().Context)
				subscriber := &timer.JobsEventsSubscriber{
					Producer: producer,
				}
				m.Options().Server.Subscribe(
					m.Options().Server.NewSubscriber(
						common.TopicJobConfigEvent,
						subscriber,
					),
				)

				producer.Start()

				return nil
			}),
		)
	})
}
