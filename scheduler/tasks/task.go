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
	"sync"
	"time"

	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/utils/permissions"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/scheduler/actions"
)

type Task struct {
	*jobs.Job
	sync.RWMutex
	common.RuntimeHolder
	runID string

	context  context.Context
	cancel   context.CancelFunc
	finished chan bool
	rc       int

	chi int
	di  int

	event interface{}
	task  *jobs.Task
	last  *jobs.Task
	err   error
}

// NewTaskFromEvent creates a task based on incoming job and event
func NewTaskFromEvent(runtime, ctx context.Context, job *jobs.Job, event interface{}) *Task {
	ctxUserName, _ := permissions.FindUserNameInContext(ctx)
	taskID := uuid.New()
	if trigger, ok := event.(*jobs.JobTriggerEvent); ok && trigger.RunTaskId != "" {
		taskID = trigger.RunTaskId
	}
	operationID := job.ID + "-" + taskID[0:8]
	c := servicecontext.WithOperationID(ctx, operationID)
	// TEMP
	/*
		job.MergeAction = &jobs.Action{
			ID: "actions.scheduler.log-input",
			Parameters: map[string]string{
				"message":        "{{len .Input.Workspaces}} - {{len .Input.Roles}}",
				"taskLogger":     "true",
				"internalLogger": "true",
			},
			ChainedActions: []*jobs.Action{
				{
					ID: "actions.scheduler.log-input",
					Parameters: map[string]string{
						"message":        "ANOTHER CHAIN ARRIVED NOW",
						"taskLogger":     "true",
						"internalLogger": "true",
					},
				},
			},
		}
	*/

	t := &Task{
		context:  c,
		Job:      job,
		runID:    taskID,
		finished: make(chan bool, 1),
		event:    event,
		task: &jobs.Task{
			ID:            taskID,
			JobID:         job.ID,
			Status:        jobs.TaskStatus_Queued,
			StatusMessage: "Pending",
			ActionsLogs:   []*jobs.ActionLog{},
			TriggerOwner:  ctxUserName,
			CanStop:       true,
		},
	}
	t.SetRuntimeContext(runtime)
	return t
}

// Queue send this new task to the global queue
func (t *Task) Queue(queue chan Runnable) {
	var ct context.Context
	var can context.CancelFunc
	if d, o := itemTimeout(t.Job.Timeout); o {
		ct, can = context.WithTimeout(t.context, d)
	} else {
		ct, can = context.WithCancel(t.context)
	}
	t.context = ct
	t.cancel = can
	jobId := t.Job.ID
	taskId := t.runID

	ch := PubSub.Sub(PubSubTopicControl)
	go func() {
		defer func() {
			PubSub.Unsub(ch, PubSubTopicControl)
		}()
		for {
			select {
			case <-t.finished:
				return
			case <-t.RuntimeContext.Done():
				t.cancel()
			case val := <-ch:
				cmd, ok := val.(*jobs.CtrlCommand)
				if !ok {
					continue
				}
				if cmd.TaskId != "" && cmd.TaskId != taskId {
					continue
				}
				if cmd.JobId != "" && cmd.JobId != jobId {
					continue
				}
				if cmd.Cmd != jobs.Command_Stop {
					continue
				}
				t.cancel()
			}
		}
	}()
	r := RootRunnable(t.context, t)
	if t.Job.MergeAction != nil {
		r.SetupCollector(t.context, t.Job.MergeAction, queue)
	}
	logStartMessageFromEvent(r.Context, t.event)
	go r.Dispatch(createMessageFromEvent(t.event), t.Actions, queue)
}

// CleanUp is triggered after a task has no more subroutines running.
func (t *Task) CleanUp() {
	t.SetEndTime(time.Now())
	if t.err != nil {
		t.SetStatus(jobs.TaskStatus_Error, t.err.Error())
	} else {
		t.SetStatus(jobs.TaskStatus_Finished, "Complete")
	}
	t.Save()
	close(t.finished)
}

// Add increments task internal retain counter
func (t *Task) Add(delta int) {
	t.Lock()
	defer t.Unlock()
	if t.rc == 0 {
		if t.task.StartTime == 0 {
			t.task.StartTime = int32(time.Now().Unix())
		}
		t.SetStatus(jobs.TaskStatus_Running, "Starting...")
		t.Save()
	}
	t.rc += delta
}

// Done decrements task internal retain counter - When reaching 0, it triggers the CleanUp operation
func (t *Task) Done(delta int) {
	t.Lock()
	defer t.Unlock()
	t.rc -= delta
	if t.rc == 0 {
		t.CleanUp()
	}
}

// Save publish task to PubSub topic
func (t *Task) Save() {
	if t.last == nil || t.taskChanged(t.last, t.task) {
		PubSub.Pub(t.task, PubSubTopicTaskStatuses)
		t.last = t.GetJobTaskClone()
	}
}

// GetJobTaskClone creates a protobuf clone of this task
func (t *Task) GetJobTaskClone() *jobs.Task {
	return proto.Clone(t.task).(*jobs.Task)
}

// GetRunUUID returns the task internal run UUID
func (t *Task) GetRunUUID() string {
	return t.runID
}

// SetStatus updates task internal status
func (t *Task) SetStatus(status jobs.TaskStatus, message ...string) {
	if len(message) > 0 {
		t.task.StatusMessage = message[0]
	}
	t.task.Status = status
}

// SetProgress updates task internal progress
func (t *Task) SetProgress(progress float32) {
	t.task.Progress = progress
}

// SetStartTime updates start time
func (t *Task) SetStartTime(ti time.Time) {
	if t.task.StartTime == 0 {
		t.task.StartTime = int32(ti.Unix())
	}
}

// SetEndTime updates end time
func (t *Task) SetEndTime(ti time.Time) {
	t.task.EndTime = int32(ti.Unix())
}

// SetControllable flags task as being able to be stopped or paused
func (t *Task) SetControllable(canPause bool) {
	t.task.CanPause = canPause
}

// SetHasProgress flags task as providing progress information
func (t *Task) SetHasProgress() {
	t.task.HasProgress = true
}

// SetError set task in error globally
func (t *Task) SetError(e error, appendLog bool) {
	t.err = e
}

// GetRunnableChannels prepares a set of data channels for action actual Run method.
func (t *Task) GetRunnableChannels(controllable bool) (*actions.RunnableChannels, chan bool) {
	status, statusMsg, progress, done := t.createStatusesChannels()
	c := &actions.RunnableChannels{
		Status:    status,
		StatusMsg: statusMsg,
		Progress:  progress,
	}
	if controllable {
		c.Pause, c.Resume = t.createControlChannels(done)
	}
	return c, done
}

// createStatusesChannels provides a set of channel used by the runnable to send
// updates about its status to the outside world
func (t *Task) createStatusesChannels() (chan jobs.TaskStatus, chan string, chan float32, chan bool) {

	status := make(chan jobs.TaskStatus)
	statusMsg := make(chan string)
	progress := make(chan float32)
	done := make(chan bool, 1)

	go func() {
		defer func() {
			close(statusMsg)
			close(status)
			close(progress)
		}()
		for {
			select {
			case s := <-status:
				t.task.Status = s
				t.Save()
			case s := <-statusMsg:
				t.task.StatusMessage = s
				t.Save()
			case p := <-progress:
				diff := p - t.task.Progress
				save := false
				if diff > 0.01 || p == 1 {
					t.task.Progress = p
					save = true
				}
				if save {
					t.Save()
				}
			case <-done:
				return
			}

		}
	}()

	return status, statusMsg, progress, done

}

// createControlChannels provides a set of channel used to send some specific control instructions
// to the runnable
func (t *Task) createControlChannels(done chan bool) (pause chan interface{}, resume chan interface{}) {

	pause, resume = make(chan interface{}), make(chan interface{})
	jobId := t.Job.ID
	taskId := t.task.ID

	ch := PubSub.Sub(PubSubTopicControl)
	go func() {
		defer func() {
			close(pause)
			close(resume)
			PubSub.Unsub(ch, PubSubTopicControl)
		}()
		for {
			select {
			case val := <-ch:
				if cmd, ok := val.(*jobs.CtrlCommand); ok {
					if cmd.TaskId != "" && cmd.TaskId != taskId {
						continue
					}
					if cmd.JobId != "" && cmd.JobId != jobId {
						continue
					}
					switch cmd.Cmd {
					case jobs.Command_Pause:
						pause <- cmd
					case jobs.Command_Resume:
						resume <- cmd
					}
				}
			case <-done:
				return
			}
		}
	}()

	return
}

func (t *Task) taskChanged(lastT, newT *jobs.Task) bool {
	if lastT.Status != newT.Status || lastT.StatusMessage != newT.StatusMessage {
		return true
	}
	if lastT.HasProgress != newT.HasProgress || lastT.CanPause != newT.CanPause || lastT.Progress != newT.Progress {
		return true
	}
	return false
}
