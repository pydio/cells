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
	"github.com/micro/go-micro"
	"github.com/pydio/cells/common/plugins"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/scheduler/timer"
)

func init() {
	plugins.Register(func() {
		service.NewService(
			service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_TIMER),
			service.Tag(common.SERVICE_TAG_SCHEDULER),
			service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_JOBS, []string{}),
			service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_TASKS, []string{}),
			service.Description("Triggers events based on a scheduler pattern"),
			service.WithMicro(func(m micro.Service) error {
				m.Init(micro.AfterStart(func() error {

					producer := timer.NewEventProducer(m.Options().Context)
					subscriber := &timer.JobsEventsSubscriber{
						Producer: producer,
					}
					m.Options().Server.Subscribe(
						m.Options().Server.NewSubscriber(
							common.TOPIC_JOB_CONFIG_EVENT,
							subscriber,
						),
					)

					producer.Start()

					return nil
				}))

				return nil
			}),
		)
	})
}
