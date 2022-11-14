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
	"sync"
	"time"

	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/jobs"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/context/metadata"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/scheduler/actions"
)

// Runnable represents the runnable instance of a given task
type Runnable struct {
	*jobs.Action
	Task           *Task
	Message        *jobs.ActionMessage
	Context        context.Context
	Implementation actions.ConcreteAction
	ActionPath     string
}

func itemTimeout(to string) (time.Duration, bool) {
	if to == "" {
		return 0, false
	}
	if d, e := time.ParseDuration(to); e == nil {
		return d, true
	}
	return 0, false
}

func RootRunnable(ctx context.Context, task *Task) Runnable {
	ctx = metadata.WithAdditionalMetadata(ctx, map[string]string{
		servicecontext.ContextMetaJobUuid:        task.Job.ID,
		servicecontext.ContextMetaTaskUuid:       task.GetRunUUID(),
		servicecontext.ContextMetaTaskActionPath: "ROOT",
	})
	return Runnable{
		Context:    ctx,
		Task:       task,
		ActionPath: "ROOT",
	}
}

// NewRunnable creates a new runnable and populates it with the concrete task implementation found with action.ID,
// if such an implementation is found.
func NewRunnable(ctx context.Context, task *Task, action *jobs.Action, message *jobs.ActionMessage, indexTag ...int) Runnable {
	var aPath string
	aPath, ctx = action.BuildTaskActionPath(ctx, "", indexTag...)
	r := Runnable{
		Action:     action,
		Task:       task,
		Context:    ctx,
		Message:    message,
		ActionPath: aPath,
	}
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

// Dispatch gets next runnable from Action and enqueues it to the Queue
// Done channel should be working correctly with chained actions
func (r *Runnable) Dispatch(input *jobs.ActionMessage, aa []*jobs.Action, queue chan Runnable) {

	r.Task.Add(1)
	wg := sync.WaitGroup{}
	wg.Add(len(aa))
	go func() {
		wg.Wait()
		r.Task.Done(1)
	}()
	for i, action := range aa {
		chainIndex := i
		errs := make(chan error)
		messagesOutput := make(chan jobs.ActionMessage)
		failedFilter := make(chan jobs.ActionMessage)
		done := make(chan bool, 1)
		indexedContext := context.WithValue(r.Context, jobs.IndexedContextKey, chainIndex)
		go func(act *jobs.Action, q chan Runnable) {
			defer func() {
				close(messagesOutput)
				close(done)
				close(failedFilter)
				close(errs)
				wg.Done()
			}()
			enqueued := 0
			for {
				select {
				case message := <-messagesOutput:
					// Build runnable and enqueue
					m := proto.Clone(&message).(*jobs.ActionMessage)
					enqueued++
					r.Task.Add(1)
					if act.HasSelectors() {
						// Tag with an index to recognise messages
						q <- NewRunnable(indexedContext, r.Task, act, m, enqueued)
					} else {
						q <- NewRunnable(indexedContext, r.Task, act, m)
					}

				case failed := <-failedFilter:
					// Filter failed
					if len(act.FailedFilterActions) > 0 {
						enqueued++
						// Replace current context
						r.ActionPath, r.Context = failedContextPath(r.Context, act.ID, chainIndex)
						r.Dispatch(&failed, act.FailedFilterActions, q)
					}

				case err := <-errs:
					_, ct := act.BuildTaskActionPath(indexedContext, "")
					log.TasksLogger(ct).Error("Received error while dispatching messages : "+err.Error(), zap.Error(err))
					log.Logger(r.Context).Error("Received error while dispatching messages : "+err.Error(), zap.Error(err))
					r.Task.SetError(err, false)
					// Break dispatch on error !
					return

				case <-done:
					// For ROOT that is not event-based (jobTrigger = manual or scheduled), check if nothing happened at all
					if r.ActionPath == "ROOT" && enqueued == 0 && strings.Contains(input.GetEvent().GetTypeUrl(), "jobs.JobTriggerEvent") {
						_, ct := act.BuildTaskActionPath(indexedContext, "")
						log.TasksLogger(ct).Warn("Initial query retrieved no values, stopping job now")
						r.Task.Add(1)
						queue <- NewRunnable(indexedContext, r.Task, &jobs.Action{ID: actions.IgnoredActionName}, &jobs.ActionMessage{})
					}
					return

				}
			}
		}(action, queue)
		in := proto.Clone(input).(*jobs.ActionMessage)
		action.ToMessages(*in, indexedContext, messagesOutput, failedFilter, errs, done)
	}
}

// RunAction creates an action and calls Dispatch
func (r *Runnable) RunAction(queue chan Runnable) {

	defer func() {
		if re := recover(); re != nil {
			r.Task.SetStatus(jobs.TaskStatus_Error, "Panic inside task")
			if e, ok := re.(error); ok {
				log.TasksLogger(r.Context).Error("Recovered scheduler task", zap.Any("task", r.Task), zap.Error(e))
				log.Logger(r.Context).Error("Recovered scheduler task", zap.Any("task", r.Task), zap.Error(e))
				r.Task.SetError(e, true)
			}
			r.Task.Save()
		}
		r.Task.Done(1)
	}()

	if r.Implementation == nil {
		err := errors.NotFound("jobs.action.not.found", fmt.Sprintf("cannot run action: no concrete implementation found for ID %s, are you sure this action has been correctly registered?", r.Action.ID))
		r.Task.SetError(err, true)
		return
	}

	if taskConsumer, ok := (r.Implementation).(actions.TaskUpdaterDelegateAction); ok {
		taskConsumer.SetTask(r.Task.GetJobTaskClone())
	}

	var setupControls bool
	if controllable, ok := r.Implementation.(actions.ControllableAction); ok {
		setupControls = true
		r.Task.SetControllable(controllable.CanPause())
	}
	if progressProvider, ok := r.Implementation.(actions.ProgressProviderAction); ok && progressProvider.ProvidesProgress() {
		r.Task.SetHasProgress()
	}
	r.Task.SetStatus(jobs.TaskStatus_Running)
	r.Task.SetStartTime(time.Now())
	r.Task.Save()

	log.TasksLogger(r.Context).Debug("ZAPS", zap.Object("Input", r.Message))

	var outputMessage *jobs.ActionMessage
	var err error
	if r.Action.Bypass {
		log.TasksLogger(r.Context).Warn("Skipping action " + r.ID + " as it is flagged Bypass. Forwarding input to output.")
		outputMessage = proto.Clone(r.Message).(*jobs.ActionMessage)
	} else {
		runCtx := r.Context
		if d, o := itemTimeout(r.Action.Timeout); o {
			var can context.CancelFunc
			runCtx, can = context.WithTimeout(runCtx, d)
			defer can()
		}
		runnableChannels, done := r.Task.GetRunnableChannels(setupControls)
		om, ee := r.Implementation.Run(runCtx, runnableChannels, *r.Message)
		err = ee
		outputMessage = &om
		log.TasksLogger(r.Context).Debug("ZAPS", zap.Object("Output", outputMessage))
		close(done)
	}

	if err != nil {
		log.TasksLogger(r.Context).Error("Error while running action "+r.ID, zap.Error(err))
		r.Task.SetStatus(jobs.TaskStatus_Error, "Error: "+err.Error())
		r.Task.SetError(err, false)
		r.Task.Save()
		return
	}

	select {
	case <-r.Context.Done():
		return
	default:
	}

	if len(r.ChainedActions) > 0 {
		if !r.Action.BreakAfter {
			r.Dispatch(outputMessage, r.ChainedActions, queue)
		} else {
			log.TasksLogger(r.Context).Warn("Stopping chain at action " + r.ID + " as it is flagged BreakAfter.")
		}
	}

	return
}

func failedContextPath(ctx context.Context, actionId string, chainIndex int) (string, context.Context) {
	if mm, ok := metadata.FromContextRead(ctx); ok {
		if p, o := mm[servicecontext.ContextMetaTaskActionPath]; o {
			newPath := path.Join(p, fmt.Sprintf("%s$%d$FAIL", actionId, chainIndex))
			ctx = metadata.WithAdditionalMetadata(ctx, map[string]string{servicecontext.ContextMetaTaskActionPath: newPath})
			return newPath, ctx
		}
	}
	return "", ctx
}
