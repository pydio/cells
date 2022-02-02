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

package timer

import (
	"context"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/jobs"
)

// JobsEventsSubscriber provides an entry point to add, update or remove Scheduler Jobs.
type JobsEventsSubscriber struct {
	Producer *EventProducer
}

// Handle passes JobChangeEvents to the registered event producer.
func (e *JobsEventsSubscriber) Handle(ctx context.Context, msg *jobs.JobChangeEvent) error {

	log.Logger(ctx).Debug("JobsEvent Subscriber", zap.Any("event", msg))

	if msg.JobRemoved != "" {
		e.Producer.StopWaiter(msg.JobRemoved)
	}
	if msg.JobUpdated != nil && msg.JobUpdated.Schedule != nil {
		e.Producer.StartOrUpdateJob(msg.JobUpdated)
	}

	return nil
}
