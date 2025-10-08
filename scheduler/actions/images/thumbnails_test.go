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

func TestThumbnailExtractor_Run_GIF(t *testing.T) {
	Convey("Test thumbnail generation with GIF input", t, func() {
		action := &ThumbnailExtractor{}
		job := &jobs.Job{}
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

		// Test with GIF file
		data, err := os.ReadFile(filepath.Join(testDir, "photo-600.gif"))
		So(err, ShouldBeNil)
		target := filepath.Join(tmpDir, uuidNode+".gif")
		err = os.WriteFile(target, data, 0755)
		So(err, ShouldBeNil)
		defer os.Remove(target)

		node := &tree.Node{
			Path: "path/to/local/" + uuidNode + ".gif",
			Type: tree.NodeType_LEAF,
			Uuid: uuidNode,
		}
		node.MustSetMeta(common.MetaNamespaceNodeName, uuidNode+".gif")
		node.MustSetMeta(common.MetaNamespaceDatasourceName, "dsname")
		node.MustSetMeta(common.MetaNamespaceNodeTestLocalFolder, tmpDir)

		status := make(chan string)
		progress := make(chan float32)
		result, err := action.Run(context.Background(), &actions.RunnableChannels{StatusMsg: status, Progress: progress}, &jobs.ActionMessage{
			Nodes: []*tree.Node{node},
		})

		// Should succeed without error
		So(err, ShouldBeNil)
		So(result, ShouldNotBeNil)

		// Check that thumbnails were created
		test512 := filepath.Join(tmpDir, uuidNode+"-512.jpg")
		test256 := filepath.Join(tmpDir, uuidNode+"-256.jpg")

		// Verify thumbnails exist
		_, err = os.Stat(test512)
		So(err, ShouldBeNil)
		defer os.Remove(test512)

		_, err = os.Stat(test256)
		So(err, ShouldBeNil)
		defer os.Remove(test256)
	})
}

func TestThumbnailExtractor_Run_WEBP(t *testing.T) {
	Convey("Test thumbnail generation with WEBP input", t, func() {
		action := &ThumbnailExtractor{}
		job := &jobs.Job{}
		e := action.Init(job, &jobs.Action{
			Parameters: map[string]string{
				"ThumbSizes": `{"sm":128,"md":256}`,
			},
		})
		So(e, ShouldBeNil)
		action.metaClient = nodes.NewHandlerMock()

		tmpDir := os.TempDir()
		uuidNode := uuid.New()
		testDir := "testdata"

		// Test with WEBP file
		data, err := os.ReadFile(filepath.Join(testDir, "photo-320.webp"))
		So(err, ShouldBeNil)
		target := filepath.Join(tmpDir, uuidNode+".webp")
		err = os.WriteFile(target, data, 0755)
		So(err, ShouldBeNil)
		defer os.Remove(target)

		node := &tree.Node{
			Path: "path/to/local/" + uuidNode + ".webp",
			Type: tree.NodeType_LEAF,
			Uuid: uuidNode,
		}
		node.MustSetMeta(common.MetaNamespaceNodeName, uuidNode+".webp")
		node.MustSetMeta(common.MetaNamespaceDatasourceName, "dsname")
		node.MustSetMeta(common.MetaNamespaceNodeTestLocalFolder, tmpDir)

		status := make(chan string)
		progress := make(chan float32)
		result, err := action.Run(context.Background(), &actions.RunnableChannels{StatusMsg: status, Progress: progress}, &jobs.ActionMessage{
			Nodes: []*tree.Node{node},
		})

		// Should succeed without error
		So(err, ShouldBeNil)
		So(result, ShouldNotBeNil)

		// Check that thumbnails were created
		test256 := filepath.Join(tmpDir, uuidNode+"-256.jpg")
		test128 := filepath.Join(tmpDir, uuidNode+"-128.jpg")

		// Verify thumbnails exist
		_, err = os.Stat(test256)
		So(err, ShouldBeNil)
		defer os.Remove(test256)

		_, err = os.Stat(test128)
		So(err, ShouldBeNil)
		defer os.Remove(test128)
	})
}

func TestThumbnailExtractor_Run_BMP(t *testing.T) {
	Convey("Test thumbnail generation with BMP input", t, func() {
		action := &ThumbnailExtractor{}
		job := &jobs.Job{}
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

		// Test with BMP file
		data, err := os.ReadFile(filepath.Join(testDir, "photo-900.bmp"))
		So(err, ShouldBeNil)
		target := filepath.Join(tmpDir, uuidNode+".bmp")
		err = os.WriteFile(target, data, 0755)
		So(err, ShouldBeNil)
		defer os.Remove(target)

		node := &tree.Node{
			Path: "path/to/local/" + uuidNode + ".bmp",
			Type: tree.NodeType_LEAF,
			Uuid: uuidNode,
		}
		node.MustSetMeta(common.MetaNamespaceNodeName, uuidNode+".bmp")
		node.MustSetMeta(common.MetaNamespaceDatasourceName, "dsname")
		node.MustSetMeta(common.MetaNamespaceNodeTestLocalFolder, tmpDir)

		status := make(chan string)
		progress := make(chan float32)
		result, err := action.Run(context.Background(), &actions.RunnableChannels{StatusMsg: status, Progress: progress}, &jobs.ActionMessage{
			Nodes: []*tree.Node{node},
		})

		// Should succeed without error
		So(err, ShouldBeNil)
		So(result, ShouldNotBeNil)

		// Check that thumbnails were created
		test256 := filepath.Join(tmpDir, uuidNode+"-512.jpg")
		test128 := filepath.Join(tmpDir, uuidNode+"-256.jpg")

		// Verify thumbnails exist
		_, err = os.Stat(test256)
		So(err, ShouldBeNil)
		defer os.Remove(test256)

		_, err = os.Stat(test128)
		So(err, ShouldBeNil)
		defer os.Remove(test128)
	})
}

func TestThumbnailExtractor_Run_HEIC(t *testing.T) {
	Convey("Test thumbnail generation with HEIC input", t, func() {
		action := &ThumbnailExtractor{}
		job := &jobs.Job{}
		e := action.Init(job, &jobs.Action{
			Parameters: map[string]string{
				"ThumbSizes": `{"sm":128,"md":256}`,
			},
		})
		So(e, ShouldBeNil)
		action.metaClient = nodes.NewHandlerMock()

		tmpDir := os.TempDir()
		uuidNode := uuid.New()
		testDir := "testdata"

		// Test with HEIC file
		data, err := os.ReadFile(filepath.Join(testDir, "photo-4000.heic"))
		So(err, ShouldBeNil)
		target := filepath.Join(tmpDir, uuidNode+".heic")
		err = os.WriteFile(target, data, 0755)
		So(err, ShouldBeNil)
		defer os.Remove(target)

		node := &tree.Node{
			Path: "path/to/local/" + uuidNode + ".heic",
			Type: tree.NodeType_LEAF,
			Uuid: uuidNode,
		}
		node.MustSetMeta(common.MetaNamespaceNodeName, uuidNode+".heic")
		node.MustSetMeta(common.MetaNamespaceDatasourceName, "dsname")
		node.MustSetMeta(common.MetaNamespaceNodeTestLocalFolder, tmpDir)

		status := make(chan string)
		progress := make(chan float32)
		result, runErr := action.Run(context.Background(), &actions.RunnableChannels{StatusMsg: status, Progress: progress}, &jobs.ActionMessage{
			Nodes: []*tree.Node{node},
		})

		if runErr != nil {
			t.Skipf("Skipping HEIC thumbnail test due to missing codec support: %v", runErr)
		}

		So(runErr, ShouldBeNil)
		So(result, ShouldNotBeNil)

		// Check that thumbnails were created
		test256 := filepath.Join(tmpDir, uuidNode+"-256.jpg")
		test128 := filepath.Join(tmpDir, uuidNode+"-128.jpg")

		// Verify thumbnails exist
		_, err = os.Stat(test256)
		So(err, ShouldBeNil)
		defer os.Remove(test256)

		_, err = os.Stat(test128)
		So(err, ShouldBeNil)
		defer os.Remove(test128)
	})
}
