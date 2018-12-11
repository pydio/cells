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

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/scheduler/actions"
)

func init() {
	// Signals the environment that we are unit testing,
	// so that we do not try to initialise the client pool.
	views.IsUnitTestEnv = true
}

func TestShellAction_GetName(t *testing.T) {
	Convey("Test GetName", t, func() {
		metaAction := &ShellAction{}
		So(metaAction.GetName(), ShouldEqual, shellActionName)
	})
}

func TestShellAction_Init(t *testing.T) {

	Convey("", t, func() {

		action := &ShellAction{}
		job := &jobs.Job{}
		// Missing Parameters
		e := action.Init(job, nil, &jobs.Action{})
		So(e, ShouldNotBeNil)

		// Valid Cmd
		e = action.Init(job, nil, &jobs.Action{
			Parameters: map[string]string{
				"cmd":           "pwd",
				"parameters":    "--param value --other",
				"inputTempFile": "true",
			},
		})
		So(e, ShouldBeNil)
		So(action.CmdBin, ShouldEqual, "pwd")
		So(action.CmdParameters, ShouldResemble, []string{"--param", "value", "--other"})
		So(action.UseTemporaryFolder, ShouldBeTrue)
	})
}

func TestShellAction_Run(t *testing.T) {

	Convey("", t, func() {

		action := &ShellAction{}
		job := &jobs.Job{}
		action.Init(job, nil, &jobs.Action{
			Parameters: map[string]string{
				"cmd":        "echo",
				"parameters": "HelloWorld",
			},
		})

		status := make(chan jobs.TaskStatus)
		statusMsg := make(chan string)
		progress := make(chan float32)
		channels := &actions.RunnableChannels{
			Status:    status,
			StatusMsg: statusMsg,
			Progress:  progress,
		}
		outputMessage, err := action.Run(context.Background(), channels, jobs.ActionMessage{})
		close(status)
		close(progress)
		So(err, ShouldBeNil)
		output := outputMessage.GetLastOutput()
		So(output.Success, ShouldBeTrue)
		So(output.StringBody, ShouldEqual, "HelloWorld\n")

	})
}
