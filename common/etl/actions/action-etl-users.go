/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package actions

import (
	"context"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/etl"
	"github.com/pydio/cells/v5/common/etl/models"
	"github.com/pydio/cells/v5/common/forms"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/scheduler/actions"
)

var (
	SyncUsersActionName = "actions.etl.users"
)

type SyncUsersAction struct {
	etlAction
}

// GetDescription returns action description
func (c *SyncUsersAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              SyncUsersActionName,
		Category:        actions.ActionCategoryETL,
		Label:           "Sync. Directories",
		Icon:            "account-convert",
		Description:     "Synchronize external directories with Cells database",
		SummaryTemplate: "",
		HasForm:         true,
	}
}

// GetParametersForm returns a UX form
func (c *SyncUsersAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "left",
					Type:        forms.ParamString,
					Label:       "Left store",
					Description: "Type of left users store",
				},
				&forms.FormField{
					Name:        "right",
					Type:        forms.ParamString,
					Label:       "Right store",
					Description: "Type of right users store",
				},
				&forms.FormField{
					Name:        "splitUserRoles",
					Type:        forms.ParamString,
					Label:       "Split users and roles",
					Description: "Sequentially import users then roles",
				},
				&forms.FormField{
					Name:        "cellAdmin",
					Type:        forms.ParamString,
					Label:       "Cells admin",
					Description: "Login of cells administrator",
				},
			},
		},
	}}
}

// GetName returns the Unique Identifier of this task.
func (c *SyncUsersAction) GetName() string {
	return SyncUsersActionName
}

// Init parses and validates parameters
func (c *SyncUsersAction) Init(job *jobs.Job, action *jobs.Action) error {
	// Making sure oauth configs are up-to-date on this node
	// TODO ?
	// auth.InitConfiguration()
	return c.ParseStores(action.Parameters)
}

// Run the actual action code
func (c *SyncUsersAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {

	msg := "Starting synchronisation with external directory"
	log.TasksLogger(ctx).Info(msg)
	channels.StatusMsg <- msg
	channels.Status <- jobs.TaskStatus_Running

	// Add a small timer for the job to be ready to be launched. Superstition?
	<-time.After(2 * time.Second)

	progress := make(chan etl.MergeOperation)
	finished := make(chan bool)
	defer close(progress)
	defer close(finished)
	var pgErrors []error
	listProgress := make(chan float32)
	ratio := float32(1)
	var lastProgress float32

	go func() {
		// Send progress only if incremented by 0.1%
		sendProgress := func(newProgress float32) bool {
			if newProgress-lastProgress > 0.001 {
				channels.Progress <- newProgress
				lastProgress = newProgress
				return true
			}
			return false
		}
		for {
			select {
			case p := <-listProgress:
				sendProgress(p / ratio)
			case op := <-progress:
				channels.StatusMsg <- op.Description
				if op.Total > 0 {
					sendProgress((float32(op.Cursor) / float32(op.Total) / ratio) + 1/ratio)
				}
				if op.Error != nil {
					log.TasksLogger(ctx).Error(op.Description+": "+op.Error.Error(), zap.Error(op.Error))
					log.Logger(ctx).Error(op.Description+": "+op.Error.Error(), zap.Error(op.Error))
					pgErrors = append(pgErrors, op.Error)
				} else {
					log.TasksLogger(ctx).Info(op.Description)
				}
			case <-finished:
				return
			}
		}
	}()

	defer func() {
		finished <- true
	}()

	merger, err := c.initMerger(ctx, input)
	if err != nil {
		return input.WithError(err), err
	}

	defer merger.Close()

	if _, ok := c.params["splitUserRoles"]; ok {

		cellAdmin, ok := c.params["cellAdmin"]
		if !ok {
			er := errors.New("missing 'cellAdmin' parameter")
			return input.WithError(er), er
		}

		log.Auditer(ctx).Info("Processing user import")

		// FIRST SYNC ONLY USERS
		usersDiff, _, err := merger.LoadAndDiffUsers(ctx, nil)
		if err != nil {
			return input.WithError(err), err
		}
		for k, u := range usersDiff.Delete {
			if u.Login == cellAdmin || u.Login == common.PydioS3AnonUsername || u.Uuid == "ROOT_GROUP" {
				delete(usersDiff.Delete, k)
			}
		}
		switch merger.Options.SyncType {
		case models.CREATEONLYSYNC:
			usersDiff.Update = nil
			usersDiff.Delete = nil
		case models.NODELETESYNC:
			usersDiff.Delete = nil
		}
		log.Logger(ctx).Debug("Diffs after listing users", zap.Any("users", usersDiff))
		merger.SaveUsers(ctx, usersDiff, new(models.RoleDiff), progress)

		// THEN SYNC ADMIN ROLES
		roleDiff, e := merger.LoadAndDiffRoles(ctx, map[string]interface{}{})
		if e != nil {
			return input.WithError(e), e
		}
		log.Logger(ctx).Debug("Admin roles diff", zap.Any("roles", roleDiff))
		merger.SaveUsers(ctx, models.NewUserDiff(), roleDiff, progress)

		// THEN SYNC TEAM ROLES
		roleDiff2, e := merger.LoadAndDiffRoles(ctx, map[string]interface{}{"teams": true})
		if e != nil {
			return input.WithError(e), e
		}
		log.Logger(ctx).Debug("Teams diff", zap.Any("teams", roleDiff2))
		merger.SaveUsers(ctx, models.NewUserDiff(), roleDiff2, progress)

	} else {

		msg = "Comparing internal and external directories"
		log.TasksLogger(ctx).Info(msg)
		channels.StatusMsg <- msg

		usersDiff, rolesDiff, err := merger.LoadAndDiffUsers(ctx, listProgress)
		if err != nil {
			return input.WithError(err), err
		}

		switch merger.Options.SyncType {
		case models.CREATEONLYSYNC:
			usersDiff.Update = nil
			usersDiff.Delete = nil
			rolesDiff.Updates = nil
			rolesDiff.Deletes = nil
		case models.NODELETESYNC:
			usersDiff.Delete = nil
			rolesDiff.Deletes = nil
		}

		msg = "Persisting modifications"
		log.TasksLogger(ctx).Info(msg)
		channels.StatusMsg <- msg

		merger.SaveUsers(ctx, usersDiff, rolesDiff, progress)

		// Add a small timer to insure success message is displayed last
		<-time.After(2 * time.Second)
		msg = "Synchronisation complete"
		log.TasksLogger(ctx).Info(msg)
		log.Auditer(ctx).Info("Synchronization with external directory complete")
		channels.StatusMsg <- msg

	}

	output := input.WithOutput(&jobs.ActionOutput{
		Success:    true,
		StringBody: "Successfully synchronized users",
	})

	var gE error
	if len(pgErrors) > 0 {
		gE = pgErrors[0]
		for _, err := range pgErrors {
			output = output.WithError(err)
		}
	}
	return output, gE
}
