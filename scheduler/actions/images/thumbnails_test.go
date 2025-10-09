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
	"fmt"
	"os"
	"path/filepath"
	"testing"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/utils/uuid"
	"github.com/pydio/cells/v5/scheduler/actions"

	. "github.com/smartystreets/goconvey/convey"
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

func TestThumbnailExtractor_RunFormats(t *testing.T) {
	Convey("Test thumbnail generation across formats", t, func() {
		cases := []struct {
			name          string
			thumbSizes    string
			sourceFile    string
			extension     string
			expectedSizes []int
			expectedErr   string
		}{
			{
				name:          "GIF",
				thumbSizes:    `{"sm":256,"md":512}`,
				sourceFile:    "photo-600.gif",
				extension:     ".gif",
				expectedSizes: []int{512, 256},
				expectedErr:   "",
			},
			{
				name:          "WEBP",
				thumbSizes:    `{"sm":128,"md":256}`,
				sourceFile:    "photo-320.webp",
				extension:     ".webp",
				expectedSizes: []int{256, 128},
				expectedErr:   "",
			},
			{
				name:          "BMP",
				thumbSizes:    `{"sm":256,"md":512}`,
				sourceFile:    "photo-900.bmp",
				extension:     ".bmp",
				expectedSizes: []int{512, 256},
				expectedErr:   "",
			},
			{
				name:          "TIFF",
				thumbSizes:    `{"sm":256,"md":512}`,
				sourceFile:    "photo-640.tiff",
				extension:     ".tiff",
				expectedSizes: []int{512, 256},
				expectedErr:   "",
			},
			{
				name:          "JPEG",
				thumbSizes:    `{"sm":256,"md":512}`,
				sourceFile:    "photo-hires.jpg",
				extension:     ".jpg",
				expectedSizes: []int{512, 256},
				expectedErr:   "",
			},
		}

		for _, testcase := range cases {
			tc := testcase // to capture range variable
			Convey(tc.name, func() {
				result, err := runThumbnailForFormat(t, tc.thumbSizes, tc.sourceFile, tc.extension)
				if tc.expectedErr != "" {
					So(err, ShouldNotBeNil)
					So(err.Error(), ShouldContainSubstring, tc.expectedErr)
					return
				}
				So(err, ShouldBeNil)
				for _, size := range tc.expectedSizes {
					assertThumbnailExists(t, result.tmpDir, result.uuid, size)
				}
			})
		}
	})
}

type thumbnailRunResult struct {
	tmpDir string
	uuid   string
}

func runThumbnailForFormat(t *testing.T, thumbSizes, sourceFile, extension string) (thumbnailRunResult, error) {
	t.Helper()

	action := &ThumbnailExtractor{}
	job := &jobs.Job{}
	err := action.Init(job, &jobs.Action{
		Parameters: map[string]string{
			"ThumbSizes": thumbSizes,
		},
	})
	So(err, ShouldBeNil)
	action.metaClient = nodes.NewHandlerMock()

	tmpDir := os.TempDir()
	uuidNode := uuid.New()
	data, err := os.ReadFile(filepath.Join("testdata", sourceFile))
	So(err, ShouldBeNil)

	target := filepath.Join(tmpDir, uuidNode+extension)
	err = os.WriteFile(target, data, 0755)
	So(err, ShouldBeNil)
	t.Cleanup(func() {
		os.Remove(target)
	})

	node := &tree.Node{
		Path: "path/to/local/" + uuidNode + extension,
		Type: tree.NodeType_LEAF,
		Uuid: uuidNode,
	}
	node.MustSetMeta(common.MetaNamespaceNodeName, uuidNode+extension)
	node.MustSetMeta(common.MetaNamespaceDatasourceName, "dsname")
	node.MustSetMeta(common.MetaNamespaceNodeTestLocalFolder, tmpDir)

	status := make(chan string)
	progress := make(chan float32)
	result, err := action.Run(context.Background(), &actions.RunnableChannels{StatusMsg: status, Progress: progress}, &jobs.ActionMessage{
		Nodes: []*tree.Node{node},
	})

	if err != nil {
		return thumbnailRunResult{tmpDir: tmpDir, uuid: uuidNode}, err
	}
	So(result, ShouldNotBeNil)

	return thumbnailRunResult{tmpDir: tmpDir, uuid: uuidNode}, nil
}

func assertThumbnailExists(t *testing.T, tmpDir, uuid string, size int) string {
	t.Helper()

	thumbPath := filepath.Join(tmpDir, fmt.Sprintf("%s-%d.jpg", uuid, size))
	_, err := os.Stat(thumbPath)
	So(err, ShouldBeNil)
	t.Cleanup(func() {
		os.Remove(thumbPath)
	})

	return thumbPath
}
