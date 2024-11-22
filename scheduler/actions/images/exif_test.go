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

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/tree"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/uuid"
	"github.com/pydio/cells/v5/scheduler/actions"
	. "github.com/smartystreets/goconvey/convey"
)

func init() {
	// Ignore client pool for unit tests
	nodes.IsUnitTestEnv = true
}

func TestExifProcessor_GetName(t *testing.T) {
	Convey("Test GetName", t, func() {
		metaAction := &ExifProcessor{}
		So(metaAction.GetName(), ShouldEqual, exifTaskName)
	})
}

func TestExifProcessor_Init(t *testing.T) {

	Convey("", t, func() {

		action := &ExifProcessor{}
		job := &jobs.Job{}
		e := action.Init(job, &jobs.Action{})
		So(e, ShouldBeNil)

	})
}

func TestExifProcessor_Run(t *testing.T) {

	Convey("", t, func() {

		action := &ExifProcessor{}
		job := &jobs.Job{}
		// Test action without parameters
		e := action.Init(job, &jobs.Action{})
		So(e, ShouldBeNil)
		action.metaClient = nodes.NewHandlerMock()

		tmpDir := os.TempDir()
		uuidNode := uuid.New()
		testDir := "testdata"

		data, err := os.ReadFile(filepath.Join(testDir, "exif.jpg"))
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
		output, e := action.Run(context.Background(), &actions.RunnableChannels{StatusMsg: status, Progress: progress}, &jobs.ActionMessage{
			Nodes: []*tree.Node{node},
		})
		close(status)
		close(progress)

		So(e, ShouldBeNil)
		So(output.Nodes, ShouldHaveLength, 1)
		outNode := output.Nodes[0]
		var exifMeta interface{}
		outNode.GetMeta(MetadataExif, &exifMeta)
		//jsonData, _ := json.Marshal(exifMeta)

		referenceFile := filepath.Join(testDir, "exif.json")
		refData, refE := os.ReadFile(referenceFile)
		So(refE, ShouldBeNil)

		var refStruct interface{}
		json.Unmarshal(refData, &refStruct)

		So(exifMeta, ShouldResemble, refStruct)

	})

}
