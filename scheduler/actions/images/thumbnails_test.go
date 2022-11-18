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

package images

import (
	"context"
	"log"
	"os"
	"path/filepath"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/scheduler/actions"
)

func TestThumbnailExtractor_GetName(t *testing.T) {
	Convey("Test GetName", t, func() {
		metaAction := &ThumbnailExtractor{}
		So(metaAction.GetName(), ShouldEqual, thumbnailsActionName)
	})
}

func TestThumbnailExtractor_Init(t *testing.T) {

	Convey("", t, func() {
		action := &ThumbnailExtractor{}
		job := &jobs.Job{}
		// Test action without parameters
		e := action.Init(job, &jobs.Action{})
		So(e, ShouldBeNil)
		So(action.thumbSizes, ShouldResemble, map[string]int{"sm": 300})

		// Test action with parameters
		e = action.Init(job, &jobs.Action{
			Parameters: map[string]string{
				"ThumbSizes": "256,512",
			},
		})
		So(e, ShouldBeNil)
		So(action.thumbSizes, ShouldResemble, map[string]int{"0": 256, "1": 512})

	})
}

func TestThumbnailExtractor_Run(t *testing.T) {

	Convey("", t, func() {

		action := &ThumbnailExtractor{}
		job := &jobs.Job{}
		// Test action without parameters
		e := action.Init(job, &jobs.Action{
			Parameters: map[string]string{
				"ThumbSizes": `{"sm":256,"md":512}`,
			},
		})
		So(e, ShouldBeNil)
		action.metaClient = nodes.NewHandlerMock()

		tmpDir := os.TempDir()
		uuidNode := uuid.New()
		testDir := "testdata"

		data, err := os.ReadFile(filepath.Join(testDir, "photo-hires.jpg"))
		So(err, ShouldBeNil)
		target := filepath.Join(tmpDir, uuidNode+".jpg")
		err = os.WriteFile(target, data, 0755)
		log.Println(target)
		So(err, ShouldBeNil)
		defer os.Remove(target)

		node := &tree.Node{
			Path: "path/to/local/" + uuidNode + ".jpg",
			Type: tree.NodeType_LEAF,
			Uuid: uuidNode,
		}
		node.MustSetMeta(common.MetaNamespaceNodeName, uuidNode+".jpg")
		node.MustSetMeta(common.MetaNamespaceDatasourceName, "dsname")
		node.MustSetMeta(common.MetaNamespaceNodeTestLocalFolder, tmpDir)

		status := make(chan string)
		progress := make(chan float32)
		action.Run(context.Background(), &actions.RunnableChannels{StatusMsg: status, Progress: progress}, &jobs.ActionMessage{
			Nodes: []*tree.Node{node},
		})

		test512 := filepath.Join(tmpDir, uuidNode+"-512.jpg")
		test256 := filepath.Join(tmpDir, uuidNode+"-256.jpg")

		resizedData, er := os.ReadFile(test512)
		So(er, ShouldBeNil)
		defer os.Remove(test512)
		referenceData, _ := os.ReadFile(filepath.Join(testDir, "photo-512.jpg"))
		So(resizedData, ShouldResemble, referenceData)

		resizedData, er = os.ReadFile(test256)
		So(er, ShouldBeNil)
		defer os.Remove(test256)
		referenceData, _ = os.ReadFile(filepath.Join(testDir, "photo-256.jpg"))
		So(resizedData, ShouldResemble, referenceData)
	})

}
