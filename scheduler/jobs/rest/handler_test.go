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

package rest

import (
	"context"
	"encoding/json"
	"io"
	"net/http/httptest"
	"strings"
	"testing"

	restful "github.com/emicklei/go-restful/v3"
	. "github.com/smartystreets/goconvey/convey"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	grpcclient "github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/jobs"
)

func TestUserDeleteTasksAuthorization(t *testing.T) {
	admin := claim.Claims{Name: "admin", Profile: common.PydioProfileAdmin}
	alice := claim.Claims{Name: "alice", Profile: common.PydioProfileStandard}
	lookupError := errors.New("job lookup failed")

	for _, tc := range []struct {
		name       string
		claims     claim.Claims
		jobID      string
		owner      string
		lookupErr  error
		wantErr    error
		getCalls   int
		deleteCall bool
	}{
		{name: "An admin can delete tasks by status across all jobs without a lookup", claims: admin, deleteCall: true},
		{name: "A standard user cannot delete tasks across all jobs", claims: alice, wantErr: errors.StatusForbidden},
		{name: "Missing claims cannot authorize deletion across all jobs", wantErr: errors.StatusForbidden},
		{name: "An owner can delete tasks by status within their job", claims: alice, jobID: "alice-job", owner: "alice", getCalls: 1, deleteCall: true},
		{name: "A standard user cannot delete another user's tasks", claims: alice, jobID: "bob-job", owner: "bob", getCalls: 1, wantErr: errors.StatusForbidden},
		{name: "A standard user cannot delete tasks from an ownerless job", claims: alice, jobID: "legacy-job", getCalls: 1, wantErr: errors.StatusForbidden},
		{name: "An admin can still delete tasks within another user's job", claims: admin, jobID: "bob-job", owner: "bob", getCalls: 1, deleteCall: true},
		{name: "A scoped lookup failure prevents deletion", claims: alice, jobID: "missing-job", lookupErr: lookupError, getCalls: 1, wantErr: lookupError},
	} {
		Convey(tc.name, t, func() {
			conn := &deleteTasksMockConn{owner: tc.owner, lookupErr: tc.lookupErr}
			grpcclient.RegisterMock(common.ServiceJobsGRPC, conn)
			input := &jobs.DeleteTasksRequest{JobId: tc.jobID, Status: []jobs.TaskStatus{jobs.TaskStatus_Finished}, PruneLimit: 2}
			body, err := json.Marshal(input)
			So(err, ShouldBeNil)
			httpReq := httptest.NewRequest("POST", "/jobs/tasks/delete", strings.NewReader(string(body)))
			httpReq.Header.Set("Content-Type", restful.MIME_JSON)
			httpReq.Header.Set("Accept", restful.MIME_JSON)
			httpReq = httpReq.WithContext(claim.ToContext(context.Background(), tc.claims))
			recorder := httptest.NewRecorder()
			response := restful.NewResponse(recorder)
			response.SetRequestAccepts(restful.MIME_JSON)
			err = (&JobsHandler{}).UserDeleteTasks(restful.NewRequest(httpReq), response)
			if tc.wantErr == nil {
				So(err, ShouldBeNil)
				So(recorder.Code, ShouldEqual, 200)
			} else {
				So(err, ShouldNotBeNil)
				So(errors.Is(err, tc.wantErr), ShouldBeTrue)
			}
			So(conn.getCalls, ShouldEqual, tc.getCalls)
			if tc.deleteCall {
				So(conn.deleted, ShouldNotBeNil)
				So(conn.deleted.GetJobId(), ShouldEqual, input.JobId)
				So(conn.deleted.GetStatus(), ShouldResemble, input.Status)
				So(conn.deleted.GetPruneLimit(), ShouldEqual, input.PruneLimit)
			} else {
				So(conn.deleted, ShouldBeNil)
			}
		})
	}
}

type deleteTasksMockConn struct {
	grpc.ClientConnInterface
	owner     string
	lookupErr error
	getCalls  int
	deleted   *jobs.DeleteTasksRequest
}

func (m *deleteTasksMockConn) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	switch {
	case strings.HasSuffix(method, "/GetJob"):
		m.getCalls++
		if m.lookupErr != nil {
			return m.lookupErr
		}
		request := args.(*jobs.GetJobRequest)
		if request.JobID == "" {
			return errors.JobNotFound
		}
		reply.(*jobs.GetJobResponse).Job = &jobs.Job{ID: request.JobID, Owner: m.owner}
		return nil
	case strings.HasSuffix(method, "/DeleteTasks"):
		m.deleted = args.(*jobs.DeleteTasksRequest)
		return nil
	default:
		return errors.New("unexpected jobs RPC: " + method)
	}
}

func TestUserControlJobTaskOnly(t *testing.T) {
	admin := claim.Claims{Name: "admin", Profile: common.PydioProfileAdmin}
	alice := claim.Claims{Name: "alice", Profile: common.PydioProfileStandard}
	streamError := errors.New("task lookup failed")
	for _, command := range []jobs.Command{jobs.Command_Pause, jobs.Command_Resume, jobs.Command_Stop} {
		for _, caller := range []claim.Claims{admin, alice} {
			Convey(caller.Name+" can "+command.String()+" a task without supplying JobId", t, func() {
				conn := &taskControlMockConn{
					deleteTasksMockConn: deleteTasksMockConn{owner: "alice"},
					tasks:               []*jobs.Task{{ID: "unrelated", JobID: "other-job"}, {ID: "task-1", JobID: "alice-job"}},
				}
				err := invokeUserControlTask(caller, &jobs.CtrlCommand{Cmd: command, TaskId: "task-1"}, conn)
				So(err, ShouldBeNil)
				So(conn.listed, ShouldNotBeNil)
				So(conn.listed.JobID, ShouldBeEmpty)
				So(conn.listed.Status, ShouldEqual, jobs.TaskStatus_Any)
				So(conn.getCalls, ShouldEqual, 1)
				So(conn.controlled, ShouldNotBeNil)
				So(conn.controlled.JobId, ShouldEqual, "alice-job")
				So(conn.controlled.TaskId, ShouldEqual, "task-1")
				So(conn.controlled.Cmd, ShouldEqual, command)
			})
		}
	}
	for _, tc := range []struct {
		name      string
		owner     string
		tasks     []*jobs.Task
		streamErr error
		wantErr   error
	}{
		{name: "Another user's task is forbidden", owner: "bob", tasks: []*jobs.Task{{ID: "task-1", JobID: "bob-job"}}, wantErr: errors.StatusForbidden},
		{name: "An ownerless task job is forbidden", tasks: []*jobs.Task{{ID: "task-1", JobID: "legacy-job"}}, wantErr: errors.StatusForbidden},
		{name: "An unknown task is not found", tasks: []*jobs.Task{{ID: "other-task", JobID: "alice-job"}}, wantErr: errors.StatusNotFound},
		{name: "A task without a job fails closed", tasks: []*jobs.Task{{ID: "task-1"}}, wantErr: errors.StatusNotFound},
		{name: "A task stream failure prevents dispatch", streamErr: streamError, wantErr: streamError},
	} {
		Convey(tc.name, t, func() {
			conn := &taskControlMockConn{deleteTasksMockConn: deleteTasksMockConn{owner: tc.owner}, tasks: tc.tasks, streamErr: tc.streamErr}
			err := invokeUserControlTask(alice, &jobs.CtrlCommand{Cmd: jobs.Command_Stop, TaskId: "task-1"}, conn)
			So(err, ShouldNotBeNil)
			So(errors.Is(err, tc.wantErr), ShouldBeTrue)
			So(conn.controlled, ShouldBeNil)
		})
	}
	Convey("An explicit JobId retains the scoped lookup without listing all tasks", t, func() {
		conn := &taskControlMockConn{deleteTasksMockConn: deleteTasksMockConn{owner: "alice"}}
		err := invokeUserControlTask(alice, &jobs.CtrlCommand{Cmd: jobs.Command_Pause, JobId: "alice-job", TaskId: "task-1"}, conn)
		So(err, ShouldBeNil)
		So(conn.listed, ShouldBeNil)
		So(conn.getCalls, ShouldEqual, 1)
		So(conn.controlled.JobId, ShouldEqual, "alice-job")
	})
}

func invokeUserControlTask(caller claim.Claims, input *jobs.CtrlCommand, conn *taskControlMockConn) error {
	grpcclient.RegisterMock(common.ServiceJobsGRPC, conn)
	grpcclient.RegisterMock(common.ServiceTasksGRPC, conn)
	body, err := json.Marshal(input)
	if err != nil {
		return err
	}
	httpReq := httptest.NewRequest("PUT", "/jobs/user", strings.NewReader(string(body)))
	httpReq.Header.Set("Content-Type", restful.MIME_JSON)
	httpReq = httpReq.WithContext(claim.ToContext(context.Background(), caller))
	response := restful.NewResponse(httptest.NewRecorder())
	response.SetRequestAccepts(restful.MIME_JSON)
	return (&JobsHandler{}).UserControlJob(restful.NewRequest(httpReq), response)
}

type taskControlMockConn struct {
	deleteTasksMockConn
	tasks      []*jobs.Task
	streamErr  error
	listed     *jobs.ListTasksRequest
	controlled *jobs.CtrlCommand
}

func (m *taskControlMockConn) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	if strings.HasSuffix(method, "/Control") {
		m.controlled = args.(*jobs.CtrlCommand)
		return nil
	}
	return m.deleteTasksMockConn.Invoke(ctx, method, args, reply, opts...)
}

func (m *taskControlMockConn) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	return &taskControlMockStream{conn: m}, nil
}

type taskControlMockStream struct {
	grpc.ClientStream
	conn     *taskControlMockConn
	position int
}

func (s *taskControlMockStream) SendMsg(input interface{}) error {
	s.conn.listed = input.(*jobs.ListTasksRequest)
	return nil
}

func (s *taskControlMockStream) CloseSend() error { return nil }

func (s *taskControlMockStream) RecvMsg(output interface{}) error {
	if s.position < len(s.conn.tasks) {
		output.(*jobs.ListTasksResponse).Task = s.conn.tasks[s.position]
		s.position++
		return nil
	}
	if s.conn.streamErr != nil {
		return s.conn.streamErr
	}
	return io.EOF
}

func TestAssertCanControlJob(t *testing.T) {

	admin := claim.Claims{Name: "admin", Profile: common.PydioProfileAdmin}
	alice := claim.Claims{Name: "alice", Profile: common.PydioProfileStandard}

	systemJob := &jobs.Job{ID: "internal-prune-jobs", Owner: common.PydioSystemUsername}
	alicesJob := &jobs.Job{ID: "alice-job", Owner: "alice"}
	ownerlessJob := &jobs.Job{ID: "legacy-job", Owner: ""}

	Convey("An administrator can control any job, including system-owned ones", t, func() {
		So(assertCanControlJob(admin, systemJob), ShouldBeNil)
	})

	Convey("A standard user can control a job they own", t, func() {
		So(assertCanControlJob(alice, alicesJob), ShouldBeNil)
	})

	Convey("A standard user cannot control a system-owned job (the reported issue)", t, func() {
		err := assertCanControlJob(alice, systemJob)
		So(err, ShouldNotBeNil)
		So(errors.Is(err, errors.StatusForbidden), ShouldBeTrue)
	})

	Convey("A standard user cannot control a job with no recorded owner (fail closed)", t, func() {
		err := assertCanControlJob(alice, ownerlessJob)
		So(err, ShouldNotBeNil)
		So(errors.Is(err, errors.StatusForbidden), ShouldBeTrue)
	})

	Convey("A standard user cannot control a nil job (GetJob failed to resolve one)", t, func() {
		err := assertCanControlJob(alice, nil)
		So(err, ShouldNotBeNil)
		So(errors.Is(err, errors.StatusForbidden), ShouldBeTrue)
	})
}
