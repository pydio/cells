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
	"testing"
	"time"

	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime/tenant"
	"github.com/pydio/cells/v4/common/utils/propagator"

	_ "github.com/pydio/cells/v4/scheduler/actions/scheduler"

	. "github.com/smartystreets/goconvey/convey"
)

func TestMain(m *testing.M) {
	TestDisableTaskClient = true
	m.Run()
}

type testTenant struct{}

func (t *testTenant) Context(ctx context.Context) context.Context {
	return ctx
}

func (t *testTenant) ID() string {
	return "test"
}

var (
	runtimeCtx = propagator.With(context.Background(), tenant.ContextKey, &testTenant{})
)

func TestNewTaskFromEvent(t *testing.T) {

	Convey("Test New Task From Event", t, func() {
		event := &jobs.JobTriggerEvent{JobID: "ajob"}
		task := NewTaskFromEvent(runtimeCtx, context.Background(), &jobs.Job{ID: "ajob"}, event)
		So(task, ShouldNotBeNil)
		So(task.task, ShouldNotBeNil)
		So(task.task.Status, ShouldEqual, jobs.TaskStatus_Queued)
		So(task.task.StatusMessage, ShouldEqual, "Pending")
		opId, _ := propagator.CanonicalMeta(task.context, common.CtxSchedulerOperationId)
		So(opId, ShouldEqual, "ajob-"+task.task.ID[0:8])
	})
}

func TestTaskSetters(t *testing.T) {

	Convey("Test task Setters", t, func() {

		event := &jobs.JobTriggerEvent{JobID: "ajob"}
		task := NewTaskFromEvent(runtimeCtx, context.Background(), &jobs.Job{ID: "ajob"}, event)
		So(task, ShouldNotBeNil)

		task.Add(2)
		So(task.rci.Load(), ShouldEqual, 2)
		task.Done(1)
		So(task.rci.Load(), ShouldEqual, 1)
		task.Done(1)
		So(task.rci.Load(), ShouldEqual, 0)

		now := time.Now()
		stamp := int32(now.Unix())
		task.SetStartTime(now)
		task.SetEndTime(now)
		So(task.task.StartTime, ShouldEqual, stamp)
		So(task.task.EndTime, ShouldEqual, stamp)

		task.SetStatus(jobs.TaskStatus_Running)
		So(task.task.Status, ShouldEqual, 2)

		task.SetStatus(jobs.TaskStatus_Finished)
		So(task.task.Status, ShouldEqual, 3)

		task.SetProgress(0.23)
		So(task.task.Progress, ShouldEqual, 0.23)

	})

}

func SkipTestTaskLogs(t *testing.T) {

	Convey("Test task Append Log (skipped as not used anymore)", t, func() {

		event := &jobs.JobTriggerEvent{JobID: "ajob"}
		ev, _ := anypb.New(&jobs.JobTriggerEvent{JobID: "ajob"})
		task := NewTaskFromEvent(runtimeCtx, context.Background(), &jobs.Job{ID: "ajob"}, event)
		So(task, ShouldNotBeNil)

		a := &jobs.Action{
			ID: "fake",
			ChainedActions: []*jobs.Action{
				{
					ID: "followingAction",
				},
			},
		}

		in := &jobs.ActionMessage{
			Event: ev,
			OutputChain: []*jobs.ActionOutput{
				{Success: true},
				{Success: false},
			},
		}

		out := &jobs.ActionMessage{
			Event: ev,
			OutputChain: []*jobs.ActionOutput{
				{Success: true},
				{Success: false},
				{Success: true, StringBody: "last output"},
			},
		}

		//THIS IS REMOVED
		//task.AppendLog(a, in, out)

		So(task.task.ActionsLogs, ShouldHaveLength, 1)
		log := task.task.ActionsLogs[0]
		So(log.Action.ID, ShouldEqual, "fake")
		//So(log.InputMessage, ShouldResemble, &jobs.ActionMessage{})
		So(log.OutputMessage.OutputChain[0].Success, ShouldBeTrue)
		So(log.OutputMessage.OutputChain[0].StringBody, ShouldEqual, "last output")
		// Verify inputs were not modified
		So(a.ChainedActions, ShouldHaveLength, 1)
		So(in.OutputChain, ShouldHaveLength, 2)
		So(out.OutputChain, ShouldHaveLength, 3)
	})
}

func TestTaskEvents(t *testing.T) {

	Convey("Test task Events", t, func() {

		event := &jobs.JobTriggerEvent{JobID: "ajob"}
		ev, _ := anypb.New(event)
		So(createMessageFromEvent(event).Event, ShouldResemble, ev)

		event2 := &tree.NodeChangeEvent{
			Type:   tree.NodeChangeEvent_CREATE,
			Target: &tree.Node{Path: "create"},
		}
		_, _ = anypb.New(event2)
		initialMessage := createMessageFromEvent(event2)
		So(initialMessage.Nodes, ShouldHaveLength, 1)
		So(initialMessage.Nodes[0].Path, ShouldResemble, "create")

		event3 := &tree.NodeChangeEvent{
			Type:   tree.NodeChangeEvent_DELETE,
			Source: &tree.Node{Path: "delete"},
		}
		_, _ = anypb.New(event3)
		initialMessage = createMessageFromEvent(event3)
		So(initialMessage.Nodes, ShouldHaveLength, 1)
		So(initialMessage.Nodes[0].Path, ShouldResemble, "delete")

	})
}

func TestTask_Save(t *testing.T) {

	Convey("Test task SaveStatus", t, func() {

		event := &jobs.JobTriggerEvent{JobID: "ajob"}
		task := NewTaskFromEvent(runtimeCtx, context.Background(), &jobs.Job{ID: "ajob"}, event)
		ch := GetBus(runtimeCtx).Sub(PubSubTopicTaskStatuses)
		task.Save()
		read := <-ch
		rt, o := read.(*jobs.Task)
		So(o, ShouldBeTrue)
		So(rt.ID, ShouldEqual, task.task.ID)
		GetBus(runtimeCtx).Unsub(ch, PubSubTopicTaskStatuses)

	})

	Convey("Test task SaveStatus With Context", t, func() {

		event := &jobs.JobTriggerEvent{JobID: "ajob"}
		task := NewTaskFromEvent(runtimeCtx, context.Background(), &jobs.Job{ID: "ajob"}, event)
		ch := GetBus(runtimeCtx).Sub(PubSubTopicTaskStatuses)
		runnableCtx := propagator.WithAdditionalMetadata(runtimeCtx, map[string]string{common.CtxMetaTaskActionPath: "action-path"})
		task.SaveStatus(runnableCtx, jobs.TaskStatus_Running)
		read := <-ch
		rt, o := read.(*TaskStatusUpdate)
		So(o, ShouldBeTrue)
		So(rt.ID, ShouldEqual, task.task.ID)
		So(rt.RunnableContext, ShouldNotBeNil)
		So(rt.RunnableStatus, ShouldEqual, jobs.TaskStatus_Running)
		GetBus(runtimeCtx).Unsub(ch, PubSubTopicTaskStatuses)

	})
}

func TestTask_EnqueueRunnables(t *testing.T) {

	Convey("Test Enqueue Runnables", t, func(c C) {

		saveChannel := GetBus(runtimeCtx).Sub(PubSubTopicTaskStatuses)
		output := make(chan RunnerFunc, 1)
		event := &jobs.JobTriggerEvent{JobID: "ajob"}
		task := NewTaskFromEvent(runtimeCtx, context.Background(), &jobs.Job{
			ID: "ajob",
			Actions: []*jobs.Action{
				&jobs.Action{ID: "actions.test.fake"},
			},
		}, event)

		task.Queue(output)
		read := <-output
		So(read, ShouldNotBeNil)
		//So(read.Action.ID, ShouldEqual, "actions.test.fake")

		go func() {
			read(nil)
			close(output)
		}()

		saved := <-saveChannel
		So(saved, ShouldNotBeNil)
		rt, o := saved.(*jobs.Task)
		So(o, ShouldBeTrue)
		So(rt.ID, ShouldEqual, task.task.ID)

		GetBus(runtimeCtx).Unsub(saveChannel, PubSubTopicTaskStatuses)

	})

	Convey("Test task without Impl", t, func() {

		output := make(chan RunnerFunc, 1)
		event := &jobs.JobTriggerEvent{JobID: "ajob"}
		task := NewTaskFromEvent(runtimeCtx, context.Background(), &jobs.Job{
			ID: "ajob",
			Actions: []*jobs.Action{
				{ID: "unknown action"},
			},
		}, event)

		task.Queue(output)
		read := <-output
		So(read, ShouldNotBeNil)
		//So(read.Action.ID, ShouldEqual, "unknown action")

		go func() {
			read(nil)
			close(output)
		}()

	})

}
