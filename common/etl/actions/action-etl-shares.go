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
	"fmt"

	"github.com/pydio/cells/v4/common/etl"
	"github.com/pydio/cells/v4/common/forms"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/jobs"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/scheduler/actions"
)

type syncShareLoadedUser struct{}

type SyncSharesAction struct {
	etlAction

	// Mandatory Parameters
	mapping map[string]string

	// Optional Parameters
	shareType string
	ownerId   string

	// Internals
	loadedUsers map[string]*syncShareLoadedUser
}

var (
	SyncSharesActionName = "actions.etl.shares"
)

// GetName returns the unique identifier of this action.
func (c *SyncSharesAction) GetName() string {
	return SyncSharesActionName
}

// GetDescription returns action description
func (c *SyncSharesAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              SyncSharesActionName,
		Label:           "Sync. Shares",
		IsInternal:      true,
		Icon:            "",
		Description:     "Diff and merge shares from two stores.",
		Category:        actions.ActionCategoryETL,
		SummaryTemplate: "",
		HasForm:         false,
	}
}

// GetParametersForm returns a UX form
func (c *SyncSharesAction) GetParametersForm() *forms.Form {
	return nil
}

// Init passes relevant parameters.
func (c *SyncSharesAction) Init(job *jobs.Job, action *jobs.Action) error {
	if err := c.ParseStores(action.Parameters); err != nil {
		return err
	}
	if mappingJson, ok := action.Parameters["mapping"]; !ok {
		return fmt.Errorf("task sync user must take a mapping parameter")
	} else {
		if e := json.Unmarshal([]byte(mappingJson), &c.mapping); e != nil {
			return fmt.Errorf("task sync cannot parse json parameter: " + e.Error())
		}
	}
	if sType, ok := action.Parameters["shareType"]; ok {
		c.shareType = sType
	}
	if oId, ok := action.Parameters["ownerId"]; ok {
		c.ownerId = oId
	}

	c.loadedUsers = make(map[string]*syncShareLoadedUser)
	return nil
}

// Run the actual action code
func (c *SyncSharesAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {

	channels.StatusMsg <- "Initializing shares list for diff/merge..."

	progress := make(chan etl.MergeOperation)
	finished := make(chan bool)
	defer close(progress)
	defer close(finished)
	var pgErrors []error
	var messages []string

	go func() {
		for {
			select {
			case op := <-progress:
				if op.Total > 0 {
					channels.Progress <- float32(op.Cursor) / float32(op.Total)
				}
				if op.Error != nil {
					channels.StatusMsg <- "Error: " + op.Error.Error()
					log.TasksLogger(ctx).Error(op.Error.Error())
					pgErrors = append(pgErrors, op.Error)
				} else {
					channels.StatusMsg <- op.Description
					log.TasksLogger(ctx).Info(op.Description)
					messages = append(messages, op.Description)
				}
			case <-finished:
				return
			}
		}
	}()

	defer func() {
		finished <- true
	}()

	params := map[string]interface{}{"mapping": c.mapping}
	if len(c.shareType) > 0 {
		params["shareType"] = c.shareType
	}
	if len(c.ownerId) > 0 {
		params["ownerId"] = c.ownerId
	}

	merger, err := c.initMerger(ctx, input)
	if err != nil {
		return input.WithError(err), err
	}

	defer merger.Close()

	diff, err := merger.LoadAndDiffShares(ctx, params)
	if err != nil {
		return input.WithError(err), err
	}
	merger.SaveShares(ctx, diff, progress, params)

	// Compute message output
	data, _ := json.Marshal(map[string]interface{}{
		"msg":    messages,
		"errors": pgErrors,
	})
	s := fmt.Sprintf("Finished syncing shares: %d successes, %d errors \n", len(messages), len(pgErrors))
	log.TasksLogger(ctx).Info(s)
	actionOutput := &jobs.ActionOutput{
		Success:    len(pgErrors) == 0,
		StringBody: s,
		JsonBody:   data,
	}
	return input.WithOutput(actionOutput), nil
}
