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
	"testing"

	"github.com/pydio/cells/v4/common/sync/model"

	"github.com/pydio/cells/v4/common/proto/tree"

	. "github.com/smartystreets/goconvey/convey"
)

func TestOpNodePaths(t *testing.T) {
	Convey("Test OpNode paths", t, func() {
		root := NewTreeNode(&tree.Node{Path: "/"})
		root.QueueOperation(&patchOperation{
			Node:   &tree.Node{Path: "a/b", Type: tree.NodeType_COLLECTION},
			OpType: OpCreateFolder,
		})
		root.QueueOperation(&patchOperation{
			Node:   &tree.Node{Path: "a/b/c"},
			OpType: OpCreateFile,
		})
		root.QueueOperation(&patchOperation{
			Node:   &tree.Node{Path: "a/b/c"},
			OpType: OpDelete,
		})
		root.QueueOperation(&patchOperation{
			Node:   &tree.Node{Path: "a/b/d"},
			OpType: OpCreateFile,
		})
		root.QueueOperation(&patchOperation{
			Node:      &tree.Node{Path: "m/v/p"},
			EventInfo: model.EventInfo{Path: "m/v/rename"},
			OpType:    OpMoveFile,
		})
		t.Log(root.PrintTree())
	})
	Convey("Test ChildByPath", t, func() {
		root := NewTreeNode(&tree.Node{Path: "/", Uuid: "ROOT"})
		root.AddChild(NewTreeNode(&tree.Node{Path: "a"}))
		root.AddChild(NewTreeNode(&tree.Node{Path: "b", Uuid: "BNODE"}))
		cNode := NewTreeNode(&tree.Node{Path: "c"})
		root.AddChild(cNode)
		root.AddChild(NewTreeNode(&tree.Node{Path: "d"}))

		cNode.AddChild(NewTreeNode(&tree.Node{Path: "c/i"}))
		cNode.AddChild(NewTreeNode(&tree.Node{Path: "c/j"}))
		cNode.AddChild(NewTreeNode(&tree.Node{Path: "c/k", Uuid: "KNODE"}))

		r := root.ChildByPath("")
		So(r, ShouldNotBeNil)
		So(r.Uuid, ShouldEqual, "ROOT")

		i := root.ChildByPath("b")
		So(i, ShouldNotBeNil)
		So(i.Uuid, ShouldEqual, "BNODE")

		f := root.ChildByPath("c/k")
		So(f, ShouldNotBeNil)
		So(f.Uuid, ShouldEqual, "KNODE")

		w := root.ChildByPath("other/path")
		So(w, ShouldBeNil)
	})
}
