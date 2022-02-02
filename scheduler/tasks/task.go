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
	context        context.Context
	initialMessage jobs.ActionMessage
	lockedTask     *jobs.Task
	rc             int
	run            string
}

// NewTaskFromEvent creates a task based on incoming job and event
func NewTaskFromEvent(ctx context.Context, job *jobs.Job, event interface{}) *Task {
	ctxUserName, _ := permissions.FindUserNameInContext(ctx)
	taskID := uuid.New()
	if trigger, ok := event.(*jobs.JobTriggerEvent); ok && trigger.RunTaskId != "" {
		taskID = trigger.RunTaskId
	}
	operationID := job.ID + "-" + taskID[0:8]
	c := servicecontext.WithOperationID(ctx, operationID)
	t := &Task{
		context: c,
		Job:     job,
		run:     taskID,
		lockedTask: &jobs.Task{
			ID:            taskID,
			JobID:         job.ID,
			Status:        jobs.TaskStatus_Queued,
			StatusMessage: "Pending",
			ActionsLogs:   []*jobs.ActionLog{},
			TriggerOwner:  ctxUserName,
		},
	}
	t.initialMessage = createMessageFromEvent(event)
	logStartMessageFromEvent(c, t, event)
	return t
}

// Add increments task internal retain counter
func (t *Task) Add(delta int) {
	t.lockTask()
	defer t.unlockTask()
	t.rc = t.rc + delta
}

// Done decrements task internal retain counter
func (t *Task) Done(delta int) {
	t.lockTask()
	defer t.unlockTask()
	t.rc = t.rc - delta
}

// Save publish task to PubSub topic
func (t *Task) Save() {
	PubSub.Pub(t.lockedTask, PubSubTopicTaskStatuses)
}

// GetJobTaskClone creates a protobuf clone of this task
func (t *Task) GetJobTaskClone() *jobs.Task {
	t.lockTask()
	defer t.unlockTask()
	return proto.Clone(t.lockedTask).(*jobs.Task)
}

// GetRunUUID returns the task internal run UUID
func (t *Task) GetRunUUID() string {
	return t.run
}

// SetStatus updates task internal status
func (t *Task) SetStatus(status jobs.TaskStatus, message ...string) {
	t.lockTask()
	defer t.unlockTask()
	if status == jobs.TaskStatus_Finished && t.rc > 0 {
		status = jobs.TaskStatus_Running
	}
	if len(message) > 0 {
		t.lockedTask.StatusMessage = message[0]
	}
	t.lockedTask.Status = status
}

// SetProgress updates task internal progress
func (t *Task) SetProgress(progress float32) {
	t.lockTask()
	defer t.unlockTask()
	t.lockedTask.Progress = progress
}

// SetStartTime updates start time
func (t *Task) SetStartTime(ti time.Time) {
	t.lockTask()
	defer t.unlockTask()
	if t.lockedTask.StartTime == 0 {
		t.lockedTask.StartTime = int32(ti.Unix())
	}
}

// SetEndTime updates end time
func (t *Task) SetEndTime(ti time.Time) {
	t.lockTask()
	defer t.unlockTask()
	t.lockedTask.EndTime = int32(ti.Unix())
}

// SetControllable flags task as being able to be stopped or paused
func (t *Task) SetControllable(canStop bool, canPause bool) {
	t.lockTask()
	defer t.unlockTask()
	t.lockedTask.CanStop = canStop
	t.lockedTask.CanPause = canPause
}

// SetHasProgress flags task as providing progress information
func (t *Task) SetHasProgress() {
	t.lockTask()
	defer t.unlockTask()
	t.lockedTask.HasProgress = true
}

// AppendLog appends logs from an action to the task OutputChain
func (t *Task) AppendLog(a jobs.Action, in jobs.ActionMessage, out jobs.ActionMessage) {
	t.lockTask()
	defer t.unlockTask()
	// Remove unnecessary fields
	// Action
	cleanedAction := a
	cleanedAction.ChainedActions = nil
	// Input
	cleanedInput := in
	cleanedInput.Event = nil
	cleanedInput.OutputChain = nil
	// Output
	cleanedOutput := out
	cleanedOutput.Event = nil
	lastMessage := out.GetLastOutput()
	cleanedOutput.OutputChain = []*jobs.ActionOutput{}
	if lastMessage != nil {
		cleanedOutput.OutputChain = append(cleanedOutput.OutputChain, lastMessage)
	}

	t.lockedTask.ActionsLogs = append(t.lockedTask.ActionsLogs, &jobs.ActionLog{
		Action:        &cleanedAction,
		InputMessage:  &cleanedInput,
		OutputMessage: &cleanedOutput,
	})
}

// GlobalError set task in error globally
func (t *Task) GlobalError(e error) {
	t.lockTask()
	defer t.unlockTask()
	t.lockedTask.ActionsLogs = append(t.lockedTask.ActionsLogs, &jobs.ActionLog{
		OutputMessage: &jobs.ActionMessage{OutputChain: []*jobs.ActionOutput{{
			Time:        int32(time.Now().Unix()),
			ErrorString: e.Error(),
		}}},
	})
}

// EnqueueRunnables appends chained actions to a running Runnable
func (t *Task) EnqueueRunnables(output chan Runnable) {

	r := RootRunnable(t.context, t)
	r.Dispatch(r.ActionPath, t.initialMessage, t.Actions, output)

}

// GetRunnableChannels prepares a set of data channels for action actual Run method.
func (t *Task) GetRunnableChannels() (*actions.RunnableChannels, chan bool) {
	status, statusMsg, progress, done := t.createStatusesChannels()
	stop, pause, resume := t.createControlChannels(done)
	return &actions.RunnableChannels{
		Status:    status,
		StatusMsg: statusMsg,
		Progress:  progress,
		Stop:      stop,
		Resume:    resume,
		Pause:     pause,
	}, done
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
				t.lockTask()
				t.lockedTask.Status = s
				t.unlockTask()
				t.Save()
			case s := <-statusMsg:
				t.lockTask()
				t.lockedTask.StatusMessage = s
				t.unlockTask()
				t.Save()
			case p := <-progress:
				t.lockTask()
				diff := p - t.lockedTask.Progress
				save := false
				if diff > 0.01 || p == 1 {
					t.lockedTask.Progress = p
					save = true
				}
				t.unlockTask()
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

func (t *Task) lockTask() {
	t.Lock()
}

func (t *Task) unlockTask() {
	t.Unlock()
}

// createControlChannels provides a set of channel used to send some specific control instructions
// to the runnable
func (t *Task) createControlChannels(done chan bool) (stop chan interface{}, pause chan interface{}, resume chan interface{}) {

	stop, pause, resume = make(chan interface{}), make(chan interface{}), make(chan interface{})
	jobId := t.Job.ID
	taskId := t.lockedTask.ID

	ch := PubSub.Sub(PubSubTopicControl)
	go func() {
		defer func() {
			close(stop)
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
					case jobs.Command_Stop:
						stop <- cmd
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
