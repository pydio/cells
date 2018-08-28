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

package cmd

import (
	"context"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/sync"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/scheduler/actions"
)

type ResyncAction struct {
	ServiceName string
	Path        string
	DryRun      bool
	CrtTask     *jobs.Task
}

var (
	resyncActionName = "actions.cmd.resync"
)

// Unique identifier
func (c *ResyncAction) GetName() string {
	return resyncActionName
}

// Implement TaskUpdaterDelegateAction as the target
// service will update the task status on its side.
func (c *ResyncAction) SetTask(task *jobs.Task) {
	c.CrtTask = task
}

// Pass parameters
func (c *ResyncAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	c.ServiceName = action.Parameters["service"]
	if c.ServiceName == "" {
		return errors.BadRequest(common.SERVICE_JOBS, "Missing parameters for Sync Action")
	}
	if path, ok := action.Parameters["path"]; ok {
		c.Path = path
	} else {
		c.Path = "/"
	}
	if dRun, ok := action.Parameters["dry-run"]; ok && dRun == "true" {
		c.DryRun = true
	}
	return nil
}

// Run the actual action code
func (c *ResyncAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	syncClient := sync.NewSyncEndpointClient(c.ServiceName, defaults.NewClient())
	_, e := syncClient.TriggerResync(ctx, &sync.ResyncRequest{
		Path:   c.Path,
		DryRun: c.DryRun,
		Task:   c.CrtTask,
	})
	if e != nil {
		log.Logger(ctx).Debug("unable to trigger resync for "+c.ServiceName, zap.Error(e))
		return input.WithError(e), e
	}
	output := input
	output.AppendOutput(&jobs.ActionOutput{
		Success: true,
	})
	return output, nil
}
