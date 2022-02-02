/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

	"github.com/pydio/cells/v4/common/sync/endpoints/memory"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/sync/merger"
	"github.com/pydio/cells/v4/common/sync/model"
)

var (
	testCtx = context.Background()
)

func TestProcess(t *testing.T) {

	Convey("Test basic processing", t, func() {

		m := NewProcessor(testCtx)
		So(m, ShouldNotBeNil)

		source := memory.NewMemDB()
		target := memory.NewMemDB()
		patch := merger.NewPatch(source, target, merger.PatchOptions{MoveDetection: true})

		source.CreateNode(testCtx, &tree.Node{
			Path: "mkfile",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		source.CreateNode(testCtx, &tree.Node{
			Path: "mkdir",
			Type: tree.NodeType_COLLECTION,
			Uuid: "uuid",
		}, true)
		target.CreateNode(testCtx, &tree.Node{
			Path: "to-be-deleted",
			Type: tree.NodeType_LEAF,
			Etag: "delhash",
		}, true)
		target.CreateNode(testCtx, &tree.Node{
			Path: "to-be-moved",
			Type: tree.NodeType_LEAF,
			Etag: "mvhash",
		}, true)

		target.CreateNode(testCtx, &tree.Node{
			Path: "folder-to-be-moved",
			Type: tree.NodeType_COLLECTION,
			Uuid: "uuid",
		}, true)
		target.CreateNode(testCtx, &tree.Node{
			Path: "folder-to-be-moved/subfolder",
			Type: tree.NodeType_COLLECTION,
			Uuid: "uuid1",
		}, true)
		target.CreateNode(testCtx, &tree.Node{
			Path: "folder-to-be-moved/subfolder/subfile",
			Type: tree.NodeType_LEAF,
			Etag: "filehash",
		}, true)

		patch.Enqueue(merger.NewOperation(merger.OpCreateFile, model.EventInfo{Path: "mkfile"}, &tree.Node{Path: "mkfile", Type: tree.NodeType_LEAF, Etag: "hash"}))
		patch.Enqueue(merger.NewOperation(merger.OpCreateFolder, model.EventInfo{Path: "mkdir"}, &tree.Node{Path: "mkdir", Type: tree.NodeType_COLLECTION, Uuid: "uuid"}))
		patch.Enqueue(merger.NewOperation(merger.OpDelete, model.EventInfo{Path: "to-be-deleted"}, &tree.Node{Path: "to-be-deleted", Type: tree.NodeType_LEAF, Etag: "delhash"}))
		patch.Enqueue(merger.NewOperation(merger.OpMoveFile, model.EventInfo{Path: "moved-file"}, &tree.Node{Path: "to-be-moved", Type: tree.NodeType_LEAF}))
		patch.Enqueue(merger.NewOperation(merger.OpMoveFolder, model.EventInfo{Path: "moved-folder"}, &tree.Node{Path: "folder-to-be-moved", Type: tree.NodeType_COLLECTION}))

		m.Process(patch, nil)
		time.Sleep(2 * time.Second)

		newDir, derr := target.LoadNode(testCtx, "mkdir")
		So(newDir, ShouldNotBeNil)
		So(derr, ShouldBeNil)

		newFile, ferr := target.LoadNode(testCtx, "mkfile")
		So(newFile, ShouldNotBeNil)
		So(ferr, ShouldBeNil)

		delFile, delErr := target.LoadNode(testCtx, "to-be-deleted")
		So(delFile, ShouldBeNil)
		So(delErr, ShouldNotBeNil)

		mvFile, _ := target.LoadNode(testCtx, "to-be-moved")
		So(mvFile, ShouldBeNil)

		mvFile1, _ := target.LoadNode(testCtx, "moved-file")
		So(mvFile1, ShouldNotBeNil)

		mvFolder, _ := target.LoadNode(testCtx, "folder-to-be-moved/subfolder/subfile")
		So(mvFolder, ShouldBeNil)

		mvFolderFile, _ := target.LoadNode(testCtx, "moved-folder/subfolder/subfile")
		So(mvFolderFile, ShouldNotBeNil)
		So(mvFolderFile.Etag, ShouldEqual, "filehash")

	})

}
