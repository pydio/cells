/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package mailer

import (
	"context"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/commons/jobsc"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/jobs"
)

func QueueJob(name string) *jobs.Job {
	return &jobs.Job{
		ID:             "flush-mailer-queue",
		Label:          "Flush Mails Queue",
		Owner:          common.PydioSystemUsername,
		MaxConcurrency: 1,
		AutoStart:      false,
		Schedule: &jobs.Schedule{
			Iso8601Schedule: "R/2012-06-04T19:25:16.828696-07:00/PT5M", // every 5 mn
		},
		Actions: []*jobs.Action{
			{
				ID: "actions.cmd.rpc",
				Parameters: map[string]string{
					"service": name,
					"method":  "MailerService.ConsumeQueue",
					"request": `{}`,
				},
			},
		},
	}
}

// RegisterQueueJob adds a job to the scheduler to regularly flush the queue
func RegisterQueueJob(ctx context.Context, name string) error {

	log.Logger(ctx).Info("Registering default job for consuming mailer queue")
	if _, err := jobsc.JobServiceClient(ctx).PutJob(ctx, &jobs.PutJobRequest{Job: QueueJob(name)}); err != nil {
		return err
	}

	return nil
}
