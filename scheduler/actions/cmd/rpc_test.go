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

package cmd

import (
	"context"
	"testing"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/scheduler/actions"
)

func TestRpcAction_GetName(t *testing.T) {
	Convey("Test GetName", t, func() {
		metaAction := &RpcAction{}
		So(metaAction.GetName(), ShouldEqual, rpcActionName)
	})
}

func TestRpcAction_Init(t *testing.T) {

	Convey("", t, func() {

		action := &RpcAction{}
		job := &jobs.Job{}
		// Missing Parameters
		e := action.Init(job, nil, &jobs.Action{})
		So(e, ShouldNotBeNil)

		// Valid Cmd
		e = action.Init(job, nil, &jobs.Action{
			Parameters: map[string]string{
				"service": "pydio.service.test",
				"method":  "MethodName",
				"request": `{"parameter1":"value1"}`,
			},
		})
		So(e, ShouldBeNil)
		So(action.ServiceName, ShouldEqual, "pydio.service.test")
		So(action.MethodName, ShouldEqual, "MethodName")
		So(action.JsonRequest, ShouldResemble, map[string]interface{}{"parameter1": "value1"})

	})
}

func TestRpcAction_Run(t *testing.T) {

	Convey("", t, func() {

		action := &RpcAction{}
		job := &jobs.Job{}
		action.Init(job, client.DefaultClient, &jobs.Action{
			Parameters: map[string]string{
				"service": "pydio.service.test",
				"method":  "MethodName",
				"request": `{"parameter1":"value1"}`,
			},
		})
		status := make(chan string)
		progress := make(chan float32)
		outputMessage, err := action.Run(context.Background(), &actions.RunnableChannels{StatusMsg: status, Progress: progress}, jobs.ActionMessage{})
		close(status)
		close(progress)
		So(err, ShouldNotBeNil)
		output := outputMessage.GetLastOutput()
		So(output.ErrorString, ShouldEqual, err.Error())
		// It's a test, so normally there is no service available, or nats is even not started
		So(errors.Parse(err.Error()).Code, ShouldEqual, 500)

	})

}
