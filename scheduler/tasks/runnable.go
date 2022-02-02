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

package tasks

import (
	"context"
	"fmt"
	"path"
	"strings"
	"time"

	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/jobs"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/context/metadata"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/scheduler/actions"
)

// Runnable represents the runnable instance of a given task
type Runnable struct {
	jobs.Action
	Task           *Task
	Message        jobs.ActionMessage
	Context        context.Context
	Implementation actions.ConcreteAction
	ActionPath     string
}

func RootRunnable(ctx context.Context, task *Task) Runnable {
	return Runnable{
		Context:    ctx,
		Task:       task,
		ActionPath: "ROOT",
	}
}

// NewRunnable creates a new runnable and populates it with the concrete task implementation found with action.ID,
// if such an implementation is found.
func NewRunnable(ctx context.Context, parentPath string, chainIndex int, task *Task, action *jobs.Action, message jobs.ActionMessage) Runnable {
	aPath := path.Join(parentPath, fmt.Sprintf(action.ID+"$%d", chainIndex))
	ctx = metadata.WithAdditionalMetadata(ctx, map[string]string{
		servicecontext.ContextMetaJobUuid:        task.Job.ID,
		servicecontext.ContextMetaTaskUuid:       task.GetRunUUID(),
		servicecontext.ContextMetaTaskActionPath: aPath,
	})
	r := Runnable{
		Action:     *action,
		Task:       task,
		Context:    ctx,
		Message:    message,
		ActionPath: aPath,
	}
	// Find Concrete Implementation from ActionID

	if impl, ok := actions.GetActionsManager().ActionById(action.ID); ok {
		r.Implementation = impl
		r.Implementation.SetRuntimeContext(r.Task.GetRuntimeContext())
		if e := r.Implementation.Init(task.Job, action); e != nil {
			log.TasksLogger(ctx).Error("Error during initialization of "+action.ID+": "+e.Error(), zap.Error(e))
		}
		if walker, ok2 := impl.(actions.RecursiveNodeWalkerAction); ok2 && action.NodesFilter != nil {
			walker.SetNodeFilterAsWalkFilter(action.NodesFilter)
		}
	} else {
		log.TasksLogger(ctx).Error("Cannot find action " + action.ID)
	}
	return r
}

// CreateChild replicates a runnable for child action
func (r *Runnable) CreateChild(parentPath string, chainIndex int, action *jobs.Action, message jobs.ActionMessage) Runnable {

	r.Task.Add(1)
	return NewRunnable(r.Context, parentPath, chainIndex, r.Task, action, message)
}

// Dispatch gets next runnable from Action and enqueues it to the Queue
// Done channel should be working correctly with chained actions
func (r *Runnable) Dispatch(parentPath string, input jobs.ActionMessage, aa []*jobs.Action, Queue chan Runnable) {

	for i, action := range aa {
		act := action
		chainIndex := i
		messagesOutput := make(chan jobs.ActionMessage)
		failedFilter := make(chan jobs.ActionMessage)
		done := make(chan bool, 1)
		go func() {
			defer func() {
				close(messagesOutput)
				close(done)
				close(failedFilter)
			}()
			enqueued := 0
			for {
				select {
				case message := <-messagesOutput:
					// Build runnable and enqueue
					m := proto.Clone(&message).(*jobs.ActionMessage)
					enqueued++
					Queue <- r.CreateChild(parentPath, chainIndex, act, *m)
				case failed := <-failedFilter:
					// Filter failed
					if len(act.FailedFilterActions) > 0 {
						enqueued++
						r.Dispatch(path.Join(parentPath, fmt.Sprintf(act.ID+"$%d$FAIL", chainIndex)), failed, act.FailedFilterActions, Queue)
					}
				case <-done:
					// For ROOT that is not event-based (jobTrigger = manual or scheduled), check if nothing happened at all
					if parentPath == "ROOT" && enqueued == 0 && strings.Contains(input.GetEvent().GetTypeUrl(), "jobs.JobTriggerEvent") {
						log.Logger(r.Context).Warn("Nothing has started at root level : spawn a fake action just to update status.")
						Queue <- r.CreateChild(parentPath, chainIndex, &jobs.Action{ID: actions.IgnoredActionName}, jobs.ActionMessage{})
					}
					return
				}
			}
		}()
		action.ToMessages(input, r.Context, messagesOutput, failedFilter, done)
	}
}

// RunAction creates an action and calls Dispatch
func (r *Runnable) RunAction(Queue chan Runnable) error {

	if r.Implementation == nil {
		return errors.NotFound(common.ServiceJobs, fmt.Sprintf("cannot run action: no concrete implementation found for ID %s, are you sure this action has been correctly registered?", r.Action.ID))
	}

	taskUpdateDelegated := false
	if taskConsumer, ok := (r.Implementation).(actions.TaskUpdaterDelegateAction); ok {
		taskUpdateDelegated = true
		taskConsumer.SetTask(r.Task.GetJobTaskClone())
	}

	defer func() {
		if re := recover(); re != nil {
			r.Task.SetStatus(jobs.TaskStatus_Error, "Panic inside task")
			if e, ok := re.(error); ok {
				log.TasksLogger(r.Context).Error("Recovered scheduler task", zap.Any("task", r.Task), zap.Error(e))
				log.Logger(r.Context).Error("Recovered scheduler task", zap.Any("task", r.Task), zap.Error(e))
				r.Task.GlobalError(e)
			}
			r.Task.Save()
		}
	}()

	if controllable, ok := r.Implementation.(actions.ControllableAction); ok {
		r.Task.SetControllable(controllable.CanStop(), controllable.CanPause())
	}
	if progressProvider, ok := r.Implementation.(actions.ProgressProviderAction); ok && progressProvider.ProvidesProgress() {
		r.Task.SetHasProgress()
	}
	r.Task.SetStatus(jobs.TaskStatus_Running)
	r.Task.SetStartTime(time.Now())
	r.Task.Save()

	var outputMessage jobs.ActionMessage
	var err error
	if r.Action.Bypass {
		log.TasksLogger(r.Context).Warn("Skipping action " + r.ID + " as it is flagged Bypass. Forwarding input to output.")
		outputMessage = r.Message
	} else {
		runnableChannels, done := r.Task.GetRunnableChannels()
		outputMessage, err = r.Implementation.Run(r.Context, runnableChannels, r.Message)
		close(done)
	}
	r.Task.Done(1)

	if err != nil {
		log.TasksLogger(r.Context).Error("Error while running action "+r.ID, zap.Error(err))
		r.Task.SetStatus(jobs.TaskStatus_Error, "Error: "+err.Error())
		r.Task.SetEndTime(time.Now())
		r.Task.Save()
		return err
	}
	r.Task.AppendLog(r.Action, r.Message, outputMessage)

	if !r.Action.BreakAfter {
		r.Dispatch(r.ActionPath, outputMessage, r.ChainedActions, Queue)
	} else {
		log.TasksLogger(r.Context).Warn("Stopping chain at action " + r.ID + " as it is flagged BreakAfter.")
	}

	if !taskUpdateDelegated {
		r.Task.SetStatus(jobs.TaskStatus_Finished, "Complete")
		r.Task.SetEndTime(time.Now())
		r.Task.Save()
	}

	return nil
}
