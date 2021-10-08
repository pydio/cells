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

package tree

import (
	"context"
	"testing"

	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/scheduler/actions"
	. "github.com/smartystreets/goconvey/convey"
)

func TestDeleteAction_GetName(t *testing.T) {
	Convey("Test GetName", t, func() {
		metaAction := &DeleteAction{}
		So(metaAction.GetName(), ShouldEqual, deleteActionName)
	})
}

func TestDeleteAction_Init(t *testing.T) {
	Convey("", t, func() {
		action := &DeleteAction{}
		job := &jobs.Job{Owner: "owner"}
		action.Init(job, nil, &jobs.Action{})
	})
}

func TestDeleteAction_Run(t *testing.T) {

	Convey("", t, func() {

		action := &DeleteAction{}
		job := &jobs.Job{}
		action.Init(job, nil, &jobs.Action{})
		mock := &views.HandlerMock{
			Nodes: map[string]*tree.Node{"/test": {Path: "/test", Type: tree.NodeType_LEAF}},
		}
		action.PresetHandler(mock)
		status := make(chan string)
		progress := make(chan float32)

		ignored, err := action.Run(context.Background(), &actions.RunnableChannels{StatusMsg: status, Progress: progress}, jobs.ActionMessage{
			Nodes: []*tree.Node{},
		})
		So(ignored.GetLastOutput().Ignored, ShouldBeTrue)

		output, err := action.Run(context.Background(), &actions.RunnableChannels{StatusMsg: status, Progress: progress}, jobs.ActionMessage{
			Nodes: []*tree.Node{{
				Path: "/test",
			}},
		})
		close(status)
		close(progress)

		So(err, ShouldBeNil)
		So(output.Nodes, ShouldHaveLength, 0)

		So(mock.Nodes, ShouldHaveLength, 1)
		So(mock.Nodes["in"], ShouldResemble, &tree.Node{
			Path: "/test",
			Type: tree.NodeType_LEAF,
		})

	})
}
