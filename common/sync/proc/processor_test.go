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

package proc

import (
	"context"
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/endpoints"
	"github.com/pydio/cells/common/sync/merger"
	"github.com/pydio/cells/common/sync/model"
)

var (
	testCtx = context.Background()
)

func TestProcess(t *testing.T) {

	Convey("Test basic processing", t, func() {

		m := NewProcessor(testCtx)
		defer m.Shutdown()
		So(m, ShouldNotBeNil)

		source := endpoints.NewMemDB()
		target := endpoints.NewMemDB()
		patch := merger.NewPatch(source, target)

		source.CreateNode(testCtx, &tree.Node{
			Path: "/mkfile",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		source.CreateNode(testCtx, &tree.Node{
			Path: "/mkdir",
			Type: tree.NodeType_COLLECTION,
			Uuid: "uuid",
		}, true)
		target.CreateNode(testCtx, &tree.Node{
			Path: "/to-be-deleted",
			Type: tree.NodeType_LEAF,
			Etag: "delhash",
		}, true)
		target.CreateNode(testCtx, &tree.Node{
			Path: "/to-be-moved",
			Type: tree.NodeType_LEAF,
			Etag: "mvhash",
		}, true)

		target.CreateNode(testCtx, &tree.Node{
			Path: "/folder-to-be-moved",
			Type: tree.NodeType_COLLECTION,
			Uuid: "uuid",
		}, true)
		target.CreateNode(testCtx, &tree.Node{
			Path: "/folder-to-be-moved/subfolder",
			Type: tree.NodeType_COLLECTION,
			Uuid: "uuid1",
		}, true)
		target.CreateNode(testCtx, &tree.Node{
			Path: "/folder-to-be-moved/subfolder/subfile",
			Type: tree.NodeType_LEAF,
			Etag: "filehash",
		}, true)

		patch.Enqueue(&merger.Operation{
			EventInfo: model.EventInfo{
				Path: "/mkfile",
			},
			Key:  "/mkfile",
			Type: merger.OpCreateFile,
			Node: &tree.Node{
				Path: "/mkfile",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			},
			Patch: patch,
		})
		patch.Enqueue(&merger.Operation{
			EventInfo: model.EventInfo{
				Path: "/to-be-deleted",
			},
			Key:  "/to-be-deleted",
			Type: merger.OpDelete,
			Node: &tree.Node{
				Path: "/to-be-deleted",
				Type: tree.NodeType_LEAF,
				Etag: "delhash",
			},
			Patch: patch,
		})
		patch.Enqueue(&merger.Operation{
			EventInfo: model.EventInfo{
				Path: "/moved-file",
			},
			Key:  "/moved-file",
			Type: merger.OpMoveFile,
			Node: &tree.Node{
				Path: "/to-be-moved",
			},
			Patch: patch,
		}, "/to-be-moved")
		patch.Enqueue(&merger.Operation{
			EventInfo: model.EventInfo{
				Path: "/moved-folder",
			},
			Type: merger.OpMoveFolder,
			Key:  "/moved-folder",
			Node: &tree.Node{
				Path: "/folder-to-be-moved",
			},
			Patch: patch,
		}, "/folder-to-be-moved")
		patch.Enqueue(&merger.Operation{
			EventInfo: model.EventInfo{
				Path: "/mkdir",
			},
			Key:  "/mkdir",
			Type: merger.OpCreateFolder,
			Node: &tree.Node{
				Path: "/mkdir",
				Type: tree.NodeType_COLLECTION,
				Uuid: "uuid",
			},
			Patch: patch,
		})

		m.process(patch)
		time.Sleep(2 * time.Second)

		newDir, derr := target.LoadNode(testCtx, "/mkdir")
		So(newDir, ShouldNotBeNil)
		So(derr, ShouldBeNil)

		newFile, ferr := target.LoadNode(testCtx, "/mkfile")
		So(newFile, ShouldNotBeNil)
		So(ferr, ShouldBeNil)

		delFile, delErr := target.LoadNode(testCtx, "/to-be-deleted")
		So(delFile, ShouldBeNil)
		So(delErr, ShouldNotBeNil)

		mvFile, _ := target.LoadNode(testCtx, "/to-be-moved")
		So(mvFile, ShouldBeNil)

		mvFile1, _ := target.LoadNode(testCtx, "/moved-file")
		So(mvFile1, ShouldNotBeNil)

		mvFolder, _ := target.LoadNode(testCtx, "/folder-to-be-moved/subfolder/subfile")
		So(mvFolder, ShouldBeNil)

		mvFolderFile, _ := target.LoadNode(testCtx, "/moved-folder/subfolder/subfile")
		So(mvFolderFile, ShouldNotBeNil)
		So(mvFolderFile.Etag, ShouldEqual, "filehash")

	})

}
