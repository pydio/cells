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
	"time"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/forms"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/scheduler/actions"
)

var (
	ErrTaskInterrupted = errors.New("interrupted")
	fakeActionName     = "actions.test.fake"
)

type FakeAction struct {
	common.RuntimeHolder
	timer  string
	ticker string
}

// GetDescription returns action description
func (f *FakeAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              fakeActionName,
		Label:           "Sleep",
		Icon:            "timer-pause-outline",
		Category:        actions.ActionCategoryScheduler,
		Description:     "Use as a waiter, or simulate a long-running process with progress",
		SummaryTemplate: "",
		HasForm:         true,
	}
}

// GetParametersForm returns a UX form
func (f *FakeAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "timer",
					Type:        forms.ParamInteger,
					Label:       "Total time",
					Description: "Total task time in seconds",
					Default:     10,
					Mandatory:   true,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "ticker",
					Type:        forms.ParamInteger,
					Label:       "Ticks",
					Description: "Time between each ticks for incrementing progress, in seconds",
					Default:     3,
					Mandatory:   false,
					Editable:    true,
				},
			},
		},
	}}

}

// GetName returns this action unique identifier
func (f *FakeAction) GetName() string {
	return fakeActionName
}

// CanPause implements ControllableAction
func (f *FakeAction) CanPause() bool {
	return true
}

// CanStop implements ControllableAction
func (f *FakeAction) CanStop() bool {
	return true
}

// ProvidesProgress mocks ProgressProviderAction interface method
func (f *FakeAction) ProvidesProgress() bool {
	return true
}

// Init passes parameters to the action
func (f *FakeAction) Init(job *jobs.Job, action *jobs.Action) error {
	f.timer = "10"
	f.ticker = ""
	if strTime, ok := action.Parameters["timer"]; ok {
		f.timer = strTime
	}
	if strTime, ok := action.Parameters["ticker"]; ok {
		f.ticker = strTime
	}
	return nil
}

// Run performs the actual action code
func (f *FakeAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {

	outputMessage := input.Clone()

	var timer, tick int64
	if t, err := jobs.EvaluateFieldInt64(ctx, input, f.timer); err == nil {
		timer = t
	} else {
		return input.WithError(err), err
	}

	if f.ticker != "" {
		if t, err := jobs.EvaluateFieldInt64(ctx, input, f.ticker); err == nil {
			tick = t
		}
	} else {
		tick = timer
	}

	//log.TasksLogger(ctx).Info("Starting Timer")
	outputMessage.AppendOutput(&jobs.ActionOutput{StringBody: "Hello World"})
	ticker := time.NewTicker(time.Second * time.Duration(tick))
	finished := make(chan struct{}, 1)
	go func() {
		<-time.After(time.Second * time.Duration(timer))
		close(finished)
	}()
	//steps := float32(timer) / float32(tick)
	step := float32(0)

loop:
	for {
		select {
		case <-ticker.C:
			//channels.Progress <- step * 100 / steps
			step++
			//message := fmt.Sprintf("Ticking Now %v", t)
			//log.TasksLogger(ctx).Info(message)
			//channels.StatusMsg <- message
		case <-channels.Pause:
			//log.TasksLogger(ctx).Info("Task received pause from channels, should pause here")
			<-channels.BlockUntilResume(ctx)
			//log.TasksLogger(ctx).Info("Block-until-resume passed, received resume, continue")
		case <-ctx.Done():
			//log.TasksLogger(ctx).Error("Context is Done: interrupting")
			ticker.Stop()
			return outputMessage.WithError(ErrTaskInterrupted), ErrTaskInterrupted
		case <-finished:
			//log.TasksLogger(ctx).Info("Sleep time finished")
			ticker.Stop()
			break loop
		}
	}

	return outputMessage, nil
}
