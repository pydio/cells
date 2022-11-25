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
	collector      *collector
	selfCollector  *collector
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
func NewRunnable(ctx context.Context, parent *Runnable, queue chan RunnerFunc, action *jobs.Action, message *jobs.ActionMessage, indexTag ...int) Runnable {
	var aPath string
	parentCtx := ctx
	aPath, ctx = action.BuildTaskActionPath(ctx, "", indexTag...)
	r := Runnable{
		Action:     action,
		Task:       parent.Task,
		Context:    ctx,
		Message:    message,
		ActionPath: aPath,
	}
	if impl, ok := actions.GetActionsManager().ActionById(action.ID); ok {
		r.Implementation = impl
		r.Implementation.SetRuntimeContext(r.Task.GetRuntimeContext())
		if e := r.Implementation.Init(r.Task.Job, action); e != nil {
			log.TasksLogger(ctx).Error("Error during initialization of "+action.ID+": "+e.Error(), zap.Error(e))
		}
		if walker, ok2 := impl.(actions.RecursiveNodeWalkerAction); ok2 && action.NodesFilter != nil {
			walker.SetNodeFilterAsWalkFilter(action.NodesFilter)
		}
	} else {
		log.TasksLogger(ctx).Error("Cannot find action " + action.ID)
	}

	r.collector = parent.collector
	if action.MergeAction != nil {
		r.SetupCollector(parentCtx, action.MergeAction, queue)
	}
	return r
}

func (r *Runnable) Add(i int) {
	r.Task.Add(i)
	if r.collector != nil {
		r.collector.Add(i)
	}
}

func (r *Runnable) Done() {
	r.Task.Done(1)
	if r.collector != nil {
		r.collector.Done()
	}
}

func (r *Runnable) AsRunnerFuncRun() RunnerFunc {
	return func(queue chan RunnerFunc) {
		r.RunAction(queue)
	}
}

func (r *Runnable) SetupCollector(parentCtx context.Context, mergeAction *jobs.Action, queue chan RunnerFunc) {
	parentCollector := r.collector
	r.Add(1) // register one task and +1 on parent collector if set
	r.collector = newCollector(parentCtx)
	go func() {
		msg := r.collector.WaitMsg()
		// Reset context
		_, ct := r.BuildTaskActionPath(parentCtx, "$MERGE")
		ct = context.WithValue(ct, jobs.IndexedContextKey, 0)
		r2 := NewRunnable(ct, r, queue, mergeAction, msg)
		r2.collector = parentCollector
		queue <- r2.AsRunnerFuncRun()
	}()
}

func (r *Runnable) dispatchChildAction(q chan RunnerFunc, wg *sync.WaitGroup, input *jobs.ActionMessage, act *jobs.Action, chainIndex int) {

	outMessages := make(chan *jobs.ActionMessage)
	failedMessages := make(chan *jobs.ActionMessage)

	errs := make(chan error)
	done := make(chan bool, 1)

	indexedContext := context.WithValue(r.Context, jobs.IndexedContextKey, chainIndex)
	blocker := make(chan bool, 1)

	go func() {
		defer func() {
			close(outMessages)
			close(failedMessages)
			close(errs)
			close(done)
			close(blocker)
			wg.Done()
		}()
		enqueued := 0
		for {
			select {
			case message := <-outMessages:
				// Build runnable and enqueue
				enqueued++
				// Tag with an index to recognise messages
				var tt []int
				if act.HasSelectors() {
					tt = append(tt, enqueued)
				}
				r2 := NewRunnable(indexedContext, r, q, act, message.Clone(), tt...)
				r2.Add(1)
				q <- r2.AsRunnerFuncRun()

			case failed := <-failedMessages:
				// Filter failed
				if len(act.FailedFilterActions) > 0 {
					enqueued++
					// Replace current context
					r.ActionPath, r.Context = failedContextPath(r.Context, act.ID, chainIndex)
					r.Dispatch(failed.Clone(), act.FailedFilterActions, q)
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
					r2 := NewRunnable(indexedContext, r, q, &jobs.Action{ID: actions.IgnoredActionName}, &jobs.ActionMessage{})
					q <- r2.AsRunnerFuncRun()
				}
				return

			}
		}
	}()

	q <- func(queue chan RunnerFunc) {
		act.ToMessages(input, indexedContext, outMessages, failedMessages, errs, done)
		<-blocker
	}

}

// Dispatch gets next Runnable list from action and enqueues them to the Queue
// Done channel should be working correctly with chained actions
func (r *Runnable) Dispatch(input *jobs.ActionMessage, aa []*jobs.Action, queue chan RunnerFunc) {

	r.Add(1)
	wg := &sync.WaitGroup{}
	wg.Add(len(aa))
	go func() {
		wg.Wait()
		r.Done()
	}()
	for i, action := range aa {
		r.dispatchChildAction(queue, wg, input, action, i)
	}
}

// RunAction creates an action and calls Dispatch
func (r *Runnable) RunAction(queue chan RunnerFunc) {

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
		r.Done()
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
		outputMessage, err = r.Implementation.Run(runCtx, runnableChannels, r.Message)

		log.TasksLogger(r.Context).Debug("ZAPS", zap.Object("Output", outputMessage))
		close(done)
	}

	if err != nil {
		log.TasksLogger(r.Context).Error("Error while running action "+r.ID, zap.Error(err))
		r.Task.SetStatus(jobs.TaskStatus_Error, "Error: "+err.Error())
		r.Task.SetError(err, false)
		r.Task.Save()
		if r.collector != nil {
			r.collector.Merge(outputMessage)
		}
		return
	}

	select {
	case <-r.Context.Done():
		return
	default:
	}

	if len(r.ChainedActions) > 0 {
		if r.Action.BreakAfter {
			log.TasksLogger(r.Context).Warn("Stopping chain at action " + r.ID + " as it is flagged BreakAfter.")
		} else {
			r.Dispatch(outputMessage, r.ChainedActions, queue)
			//queue <- r.AsRunnerFuncDispatch(outputMessage, r.ChainedActions)
		}
	} else if r.collector != nil {
		r.collector.Merge(outputMessage)
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
