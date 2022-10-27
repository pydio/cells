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
	"fmt"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server/generic"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/scheduler/timer"
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		var producer *timer.EventProducer

		service.NewService(
			service.Name(common.ServiceGenericNamespace_+common.ServiceTimer),
			service.Context(ctx),
			service.Tag(common.ServiceTagScheduler),
			service.Description("Triggers events based on a scheduler pattern"),
			service.Unique(true),
			service.WithGeneric(func(c context.Context, server *generic.Server) error {
				producer := timer.NewEventProducer(c)
				subscriber := &timer.JobsEventsSubscriber{
					Producer: producer,
				}
				if er := broker.SubscribeCancellable(c, common.TopicJobConfigEvent, func(message broker.Message) error {
					msg := &jobs.JobChangeEvent{}
					if ctx, e := message.Unmarshal(msg); e == nil {
						return subscriber.Handle(ctx, msg)
					}
					return nil
				}); er != nil {
					return fmt.Errorf("cannot subscribe on JobConfigEvent topic %v", er)
				}

				go producer.Start()
				return nil

			}),
			service.WithGenericStop(func(c context.Context, server *generic.Server) error {
				if producer != nil {
					producer.StopAll()
				}

				return nil
			}),
		)
	})
}
