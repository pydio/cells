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
	"time"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"

	"github.com/golang/protobuf/proto"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/scheduler/actions"
	"go.uber.org/zap"
)

// Runnable represents the runnable instance of a given task
type Runnable struct {
	jobs.Action
	Task           *Task
	Message        jobs.ActionMessage
	Client         client.Client
	Context        context.Context
	Implementation actions.ConcreteAction
}

func RootRunnable(ctx context.Context, cl client.Client, task *Task) Runnable {
	return Runnable{
		Context: ctx,
		Client:  cl,
		Task:    task,
	}
}

// NewRunnable creates a new runnable and populates it with the concrete task implementation found with action.ID,
// if such an implementation is found.
func NewRunnable(ctx context.Context, cl client.Client, task *Task, action *jobs.Action, message jobs.ActionMessage) Runnable {
	r := Runnable{
		Action:  *action,
		Task:    task,
		Client:  cl,
		Context: ctx,
		Message: message,
	}
	// Find Concrete Implementation from ActionID
	impl, ok := actions.GetActionsManager().ActionById(action.ID)
	if ok {
		r.Implementation = impl
		r.Implementation.Init(task.Job, cl, action)
	}
	return r
}

// CreateChild replicates a runnable for child action
func (r *Runnable) CreateChild(action *jobs.Action, message jobs.ActionMessage) Runnable {

	r.Task.Add(1)
	return NewRunnable(r.Context, r.Client, r.Task, action, message)
}

// Dispatch gets next runnable from Action and enqueues it to the Queue
// Todo - Check that done channel is working correctly with chained actions
func (r *Runnable) Dispatch(input jobs.ActionMessage, actions []*jobs.Action, Queue chan Runnable) {

	for _, action := range actions {
		act := action
		messagesOutput := make(chan jobs.ActionMessage)
		done := make(chan bool, 1)
		go func() {
			defer func() {
				close(messagesOutput)
				close(done)
			}()
			for {
				select {
				case message := <-messagesOutput:
					// Build runnable and enqueue
					m := proto.Clone(&message).(*jobs.ActionMessage)
					Queue <- r.CreateChild(act, *m)
				case <-done:
					return
				}
			}
		}()
		action.ToMessages(input, r.Client, r.Context, messagesOutput, done)
	}
}

// RunAction creates an action and calls Dispatch
func (r *Runnable) RunAction(Queue chan Runnable) error {

	if r.Implementation == nil {
		return errors.NotFound(common.SERVICE_JOBS, fmt.Sprintf("cannot run action: no concrete implementation found for ID %s, are you sure this action has been correctly registered?", r.Action.ID))
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

	runnableChannels, done := r.Task.GetRunnableChannels()
	outputMessage, err := r.Implementation.Run(r.Context, runnableChannels, r.Message)
	close(done)
	r.Task.Done(1)

	if err != nil {
		log.TasksLogger(r.Context).Error("Error while running action "+r.ID, zap.Error(err))
		r.Task.SetStatus(jobs.TaskStatus_Error, "Error: "+err.Error())
		r.Task.SetEndTime(time.Now())
		r.Task.Save()
		return err
	}
	r.Task.AppendLog(r.Action, r.Message, outputMessage)

	r.Dispatch(outputMessage, r.ChainedActions, Queue)

	if !taskUpdateDelegated {
		r.Task.SetStatus(jobs.TaskStatus_Finished, "Complete")
		r.Task.SetEndTime(time.Now())
		r.Task.Save()
	}

	return nil
}
