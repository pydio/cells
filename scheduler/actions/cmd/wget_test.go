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
	"github.com/pydio/cells/v4/common/config/mock"
	"github.com/pydio/cells/v4/common/nodes"
	nodescontext "github.com/pydio/cells/v4/common/nodes/context"
	"os"
	"path/filepath"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/scheduler/actions"
)

func init() {
	// Ignore client pool for unit tests
	nodes.IsUnitTestEnv = true
	_ = mock.RegisterMockConfig()
}

func TestWGetAction_GetName(t *testing.T) {
	Convey("Test GetName", t, func() {
		metaAction := &WGetAction{}
		So(metaAction.GetName(), ShouldEqual, wgetActionName)
	})
}

func TestWGetAction_Init(t *testing.T) {

	Convey("", t, func() {

		action := &WGetAction{}
		ctx := context.Background()
		action.SetRuntimeContext(nodescontext.WithSourcesPool(ctx, nodes.NewTestPool(ctx)))
		job := &jobs.Job{}
		// Missing Parameters
		e := action.Init(job, &jobs.Action{})
		So(e, ShouldNotBeNil)

		// Invalid URL should trigger a parse error
		action.Init(job, &jobs.Action{
			Parameters: map[string]string{
				"url": "htétp://",
			},
		})
		status := make(chan string)
		progress := make(chan float32)
		_, e = action.Run(context.Background(), &actions.RunnableChannels{StatusMsg: status, Progress: progress}, &jobs.ActionMessage{})
		So(e, ShouldNotBeNil)

		// Valid URL
		e = action.Init(job, &jobs.Action{
			Parameters: map[string]string{
				"url": "http://google.com",
			},
		})
		So(e, ShouldBeNil)
		So(action.SourceUrl, ShouldEqual, "http://google.com")

	})
}

func TestWGetAction_Run(t *testing.T) {

	Convey("", t, func() {

		action := &WGetAction{}
		ctx := context.Background()
		action.SetRuntimeContext(nodescontext.WithSourcesPool(ctx, nodes.NewTestPool(ctx)))

		job := &jobs.Job{}
		action.Init(job, &jobs.Action{
			Parameters: map[string]string{
				"url": "https://pydio.com/sites/default/files/Create%20a%20cell_4.png",
			},
		})

		tmpDir := os.TempDir()
		uuidNode := uuid.New()

		node := &tree.Node{
			Path: "path/to/local/Architecture.jpg",
			Type: tree.NodeType_LEAF,
			Uuid: uuidNode,
		}
		node.MustSetMeta(common.MetaNamespaceNodeTestLocalFolder, tmpDir)

		status := make(chan string)
		progress := make(chan float32)
		_, er := action.Run(context.Background(), &actions.RunnableChannels{StatusMsg: status, Progress: progress}, &jobs.ActionMessage{
			Nodes: []*tree.Node{node},
		})
		close(status)
		close(progress)
		So(er, ShouldBeNil)

		savedFile := filepath.Join(tmpDir, uuidNode)
		fileInfo, err := os.Stat(savedFile)
		So(err, ShouldBeNil)
		defer os.Remove(savedFile)
		So(fileInfo.Size(), ShouldEqual, 178780)

	})

}
