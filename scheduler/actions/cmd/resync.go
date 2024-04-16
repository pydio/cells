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
	"strings"

	"go.uber.org/zap"
	grpc2 "google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/forms"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/scheduler/actions"
)

var (
	resyncActionName = "actions.cmd.resync"
)

type ResyncAction struct {
	common.RuntimeHolder
	ServiceName string
	Path        string
	DryRun      bool
	CrtTask     *jobs.Task
}

// GetDescription returns action description
func (c *ResyncAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              resyncActionName,
		Label:           "Resynchronize",
		Category:        actions.ActionCategoryCmd,
		Icon:            "database-refresh",
		Description:     "Trigger a Resync command on a SyncProvider microservice endpoint",
		SummaryTemplate: "",
		HasForm:         true,
	}
}

// GetParametersForm returns a UX form
func (c *ResyncAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "service",
					Type:        forms.ParamString,
					Label:       "Service Name",
					Description: "Full name of the cells micro service",
					Default:     "",
					Mandatory:   true,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "path",
					Type:        forms.ParamString,
					Label:       "Path",
					Description: "Internal path on which to trigger the resync",
					Default:     "/",
					Mandatory:   false,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "dry-run",
					Type:        forms.ParamBool,
					Label:       "Dry Run",
					Description: "For services supporting this, perform a dry-run, no changes are applied",
					Default:     nil,
					Mandatory:   false,
					Editable:    true,
				},
			},
		},
	}}
}

// GetName provides unique identifier
func (c *ResyncAction) GetName() string {
	return resyncActionName
}

// SetTask implements TaskUpdaterDelegateAction as the target
// service will update the task status on its side.
func (c *ResyncAction) SetTask(task *jobs.Task) {
	c.CrtTask = task
}

// Init passes parameters
func (c *ResyncAction) Init(job *jobs.Job, action *jobs.Action) error {
	c.ServiceName = action.Parameters["service"]
	if c.ServiceName == "" {
		return errors.BadRequest(common.ServiceJobs, "Missing parameters for Sync Action")
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

// Run perform actual action code
func (c *ResyncAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {

	//ctx, _ = context.WithTimeout(ctx, 1*time.Hour)
	srvName := jobs.EvaluateFieldStr(ctx, input, c.ServiceName)
	// V4: strip grpc prefix
	srvName = strings.TrimPrefix(srvName, common.ServiceGrpcNamespace_)
	syncClient := sync.NewSyncEndpointClient(grpc.ResolveConn(c.GetRuntimeContext(), srvName))
	log.TasksLogger(ctx).Info("Sending Resync command to " + srvName)
	_, e := syncClient.TriggerResync(ctx, &sync.ResyncRequest{
		Path:   jobs.EvaluateFieldStr(ctx, input, c.Path),
		DryRun: c.DryRun,
		Task:   c.CrtTask,
	}, grpc2.WaitForReady(false))
	if e != nil {
		log.TasksLogger(ctx).Error("Unable to trigger resync for "+srvName, zap.Error(e))
		return input.WithError(e), e
	}
	output := input.Clone()
	output.AppendOutput(&jobs.ActionOutput{
		Success: true,
	})
	return output, nil
}
