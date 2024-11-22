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

package merger

import (
	"context"
	"testing"
	"time"

	"github.com/pydio/cells/v5/common/sync/model"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
)

func TestMergeWithConflicts(t *testing.T) {
	bg := context.Background()
	Convey("Test basic ignores", t, func() {
		source, target := memory.NewMemDB(), memory.NewMemDB()
		left := newTreePatch(source, target, PatchOptions{MoveDetection: false})
		right := newTreePatch(source, target, PatchOptions{MoveDetection: false})

		left.Enqueue(&patchOperation{OpType: OpCreateFolder, Node: &tree.Node{Path: "/newdir"}})
		left.Enqueue(&patchOperation{OpType: OpCreateFolder, Node: &tree.Node{Path: "/newdir/a"}})
		left.Enqueue(&patchOperation{OpType: OpDelete, Node: &tree.Node{Path: "/op-none/deleted"}})

		right.Enqueue(&patchOperation{OpType: OpCreateFolder, Node: &tree.Node{Path: "/newdir"}})
		right.Enqueue(&patchOperation{OpType: OpCreateFolder, Node: &tree.Node{Path: "/newdir/a"}})
		right.Enqueue(&patchOperation{OpType: OpDelete, Node: &tree.Node{Path: "/op-none/deleted"}})

		bi, e := ComputeBidirectionalPatch(bg, left, right)
		So(e, ShouldBeNil)
		So(bi.Size(), ShouldEqual, 0)
	})

	Convey("Test diverging moves", t, func() {
		source, target := memory.NewMemDB(), memory.NewMemDB()
		old := time.Now()
		recent := old.Add(2 * time.Second)
		So(source.CreateNode(bg, &tree.Node{Path: "/moved-folder-same"}, true), ShouldBeNil)
		So(source.CreateNode(bg, &tree.Node{Path: "/diverging-folder-A", MTime: recent.Unix()}, true), ShouldBeNil)
		So(source.CreateNode(bg, &tree.Node{Path: "/toto/diverging-file-A", MTime: old.Unix()}, true), ShouldBeNil)
		So(target.CreateNode(bg, &tree.Node{Path: "/moved-folder-same"}, true), ShouldBeNil)
		So(target.CreateNode(bg, &tree.Node{Path: "/diverging-folder-B", MTime: old.Unix()}, true), ShouldBeNil)
		So(target.CreateNode(bg, &tree.Node{Path: "/toto2/other-location/diverging-file-B", MTime: recent.Unix()}, true), ShouldBeNil)

		left := newTreePatch(source, target, PatchOptions{MoveDetection: false})
		right := newTreePatch(source, target, PatchOptions{MoveDetection: false})

		left.Enqueue(&patchOperation{OpType: OpMoveFolder, Node: &tree.Node{Path: "/source-folder"}, EventInfo: model.EventInfo{Path: "/moved-folder-same"}})
		right.Enqueue(&patchOperation{OpType: OpMoveFolder, Node: &tree.Node{Path: "/source-folder"}, EventInfo: model.EventInfo{Path: "/moved-folder-same"}})

		left.Enqueue(&patchOperation{OpType: OpMoveFolder, Node: &tree.Node{Path: "/diverging-folder"}, EventInfo: model.EventInfo{Path: "/diverging-folder-A"}})
		right.Enqueue(&patchOperation{OpType: OpMoveFolder, Node: &tree.Node{Path: "/diverging-folder"}, EventInfo: model.EventInfo{Path: "/diverging-folder-B"}})

		left.Enqueue(&patchOperation{OpType: OpMoveFile, Node: &tree.Node{Path: "/diverging-file"}, EventInfo: model.EventInfo{Path: "/toto/diverging-file-A"}})
		right.Enqueue(&patchOperation{OpType: OpMoveFile, Node: &tree.Node{Path: "/diverging-file"}, EventInfo: model.EventInfo{Path: "/toto2/other-location/diverging-file-B"}})

		bi, e := ComputeBidirectionalPatch(bg, left, right)

		So(e, ShouldBeNil)
		So(bi.Size(), ShouldEqual, 2)

	})

}
