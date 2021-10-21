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

package scheduler

import (
	"context"
	"fmt"

	"github.com/micro/go-micro/client"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/forms"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/scheduler/actions"
)

var (
	pruneJobsActionName = "actions.internal.prune-jobs"
)

type PruneJobsAction struct {
	maxTasksParam string
}

// GetDescription returns action description
func (c *PruneJobsAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              pruneJobsActionName,
		IsInternal:      true,
		Label:           "Prune Jobs",
		Icon:            "delete-sweep",
		Category:        actions.ActionCategoryScheduler,
		Description:     "Delete finished scheduler jobs marked as AutoClean",
		SummaryTemplate: "",
		HasForm:         true,
	}
}

// GetParametersForm returns a UX form
func (c *PruneJobsAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "number",
					Type:        forms.ParamInteger,
					Label:       "Maximum tasks",
					Description: "Maximum number of tasks to keep",
					Default:     50,
					Mandatory:   true,
					Editable:    true,
				},
			},
		},
	}}
}

// GetName returns this action unique identifier
func (c *PruneJobsAction) GetName() string {
	return pruneJobsActionName
}

// Init passes parameters to the action
func (c *PruneJobsAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	if n, o := action.Parameters["number"]; o {
		c.maxTasksParam = n
	} else {
		c.maxTasksParam = "50"
	}
	return nil
}

// Run the actual action code
func (c *PruneJobsAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	pruneLimit, e := jobs.EvaluateFieldInt(ctx, input, c.maxTasksParam)
	if e != nil {
		return input.WithError(e), e
	}
	cli := jobs.NewJobServiceClient(registry.GetClient(common.ServiceJobs))
	// Fix Stuck Tasks
	resp, e := cli.DetectStuckTasks(ctx, &jobs.DetectStuckTasksRequest{
		Since: 60 * 60 * 6,
	})
	if e != nil {
		return input.WithError(e), e
	}
	log.TasksLogger(ctx).Info(fmt.Sprintf("Pruned %d stuck jobs", len(resp.FixedTaskIds)))

	// Prune number of tasks per jobs
	resp2, e := cli.DeleteTasks(ctx, &jobs.DeleteTasksRequest{
		Status: []jobs.TaskStatus{
			jobs.TaskStatus_Finished,
			jobs.TaskStatus_Interrupted,
			jobs.TaskStatus_Error,
		},
		PruneLimit: int32(pruneLimit),
	})
	if e != nil {
		return input.WithError(e), e
	}
	log.TasksLogger(ctx).Info(fmt.Sprintf("Pruned number of tasks to %d for each job (deleted %d tasks)", pruneLimit, len(resp2.Deleted)))

	// Prune cleanable jobs
	resp3, e := cli.DeleteJob(ctx, &jobs.DeleteJobRequest{CleanableJobs: true})
	if e != nil {
		return input.WithError(e), e
	}
	msg := fmt.Sprintf("Deleted %d AutoClean jobs", resp3.DeleteCount)
	log.TasksLogger(ctx).Info(msg)

	return input, nil
}
