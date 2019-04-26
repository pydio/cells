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

package merger

import (
	"context"
	"fmt"
	"testing"

	"github.com/pydio/cells/common/sync/endpoints"
	"github.com/pydio/cells/common/sync/model"

	"github.com/pydio/cells/common/proto/tree"
	. "github.com/smartystreets/goconvey/convey"
)

var (
	testCtx = context.Background()
)

func TestComputeSourcesDiff(t *testing.T) {

	Convey("Test various Diffs", t, func() {

		var left, right *endpoints.MemDB
		var diff *Diff

		Convey("Test empty source and target", func() {
			left = endpoints.NewMemDB()
			right = endpoints.NewMemDB()
			diff, _ = ComputeDiff(testCtx, left, right, nil)
			So(diff, ShouldNotBeNil)
			So(diff.MissingLeft, ShouldHaveLength, 0)
			So(diff.MissingRight, ShouldHaveLength, 0)
		})

		Convey("Test file in left", func() {
			left = endpoints.NewMemDB()
			right = endpoints.NewMemDB()
			left.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			diff, _ = ComputeDiff(testCtx, left, right, nil)
			So(diff.MissingLeft, ShouldHaveLength, 0)
			So(diff.MissingRight, ShouldHaveLength, 1)
		})

		Convey("Test file in right", func() {
			left = endpoints.NewMemDB()
			right = endpoints.NewMemDB()
			right.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			diff, _ = ComputeDiff(testCtx, left, right, nil)
			So(diff.MissingLeft, ShouldHaveLength, 1)
			So(diff.MissingRight, ShouldHaveLength, 0)
		})

		Convey("Test files in both", func() {
			left = endpoints.NewMemDB()
			right = endpoints.NewMemDB()
			right.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			left.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			diff, _ = ComputeDiff(testCtx, left, right, nil)
			So(diff.MissingLeft, ShouldHaveLength, 0)
			So(diff.MissingRight, ShouldHaveLength, 0)
		})

		Convey("Test ignored files", func() {
			left = endpoints.NewMemDB()
			right = endpoints.NewMemDB()
			right.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			left.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			left.CreateNode(testCtx, &tree.Node{
				Path: "/aaa/.DS_Store",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			left.CreateNode(testCtx, &tree.Node{
				Path: "/.minio.sys",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			left.CreateNode(testCtx, &tree.Node{
				Path: "/$buckets.json",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			left.CreateNode(testCtx, &tree.Node{
				Path: "/$multiparts-session.json",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			diff, _ = ComputeDiff(testCtx, left, right, nil)
			So(diff.MissingLeft, ShouldHaveLength, 0)
			So(diff.MissingRight, ShouldHaveLength, 0)
		})

	})

}

func TestTreeDiff(t *testing.T) {

	Convey("Test Tree Diffs", t, func() {

		var left, right *endpoints.MemDB
		Convey("Test empty source and target", func() {
			left = endpoints.NewMemDB()
			right = endpoints.NewMemDB()
			t1, _ := TreeNodeFromSource(left)
			t2, _ := TreeNodeFromSource(right)
			// Trigger printout for test coverage
			t1.PrintOut()
			diff := &Diff{}
			MergeNodes(t1, t2, diff)
			So(diff, ShouldNotBeNil)
			So(diff.MissingLeft, ShouldHaveLength, 0)
			So(diff.MissingRight, ShouldHaveLength, 0)

			diff2, _ := ComputeDiff(testCtx, left, right, nil)
			So(diff2.MissingLeft, ShouldHaveLength, 0)
			So(diff2.MissingRight, ShouldHaveLength, 0)

		})

		Convey("Test file in left", func() {
			left = endpoints.NewMemDB()
			right = endpoints.NewMemDB()
			left.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			t1, _ := TreeNodeFromSource(left)
			t2, _ := TreeNodeFromSource(right)
			diff := &Diff{}
			MergeNodes(t1, t2, diff)
			So(diff.MissingLeft, ShouldHaveLength, 0)
			So(diff.MissingRight, ShouldHaveLength, 1)

			diff2, _ := ComputeDiff(testCtx, left, right, nil)
			So(diff2.MissingLeft, ShouldHaveLength, 0)
			So(diff2.MissingRight, ShouldHaveLength, 1)

		})

		Convey("Test file in right", func() {
			left = endpoints.NewMemDB()
			right = endpoints.NewMemDB()
			right.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			t1, _ := TreeNodeFromSource(left)
			t2, _ := TreeNodeFromSource(right)
			diff := &Diff{}
			MergeNodes(t1, t2, diff)
			So(diff.MissingLeft, ShouldHaveLength, 1)
			So(diff.MissingRight, ShouldHaveLength, 0)

			diff2, _ := ComputeDiff(testCtx, left, right, nil)
			So(diff2.MissingLeft, ShouldHaveLength, 1)
			So(diff2.MissingRight, ShouldHaveLength, 0)

		})

		Convey("Test files in both", func() {
			left = endpoints.NewMemDB()
			right = endpoints.NewMemDB()
			right.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			left.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			},
				true)
			t1, _ := TreeNodeFromSource(left)
			t2, _ := TreeNodeFromSource(right)
			diff := &Diff{}
			MergeNodes(t1, t2, diff)
			So(diff.MissingLeft, ShouldHaveLength, 0)
			So(diff.MissingRight, ShouldHaveLength, 0)

			diff2, _ := ComputeDiff(testCtx, left, right, nil)
			So(diff2.MissingLeft, ShouldHaveLength, 0)
			So(diff2.MissingRight, ShouldHaveLength, 0)

		})

		Convey("Test conflicts : folder UUID", func() {
			left = endpoints.NewMemDB()
			right = endpoints.NewMemDB()
			right.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_COLLECTION,
				Uuid: "uuid1",
				Etag: "uuid1-hash",
			}, true)
			left.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_COLLECTION,
				Uuid: "uuid2",
				Etag: "uuid2-hash",
			}, true)

			diff2, _ := ComputeDiff(testCtx, left, right, nil)
			So(diff2.MissingLeft, ShouldHaveLength, 0)
			So(diff2.MissingRight, ShouldHaveLength, 0)
			So(diff2.Conflicts, ShouldHaveLength, 1)
			So(diff2.Conflicts[0].Type, ShouldEqual, ConflictFolderUUID)

		})

		Convey("Test conflicts : file contents", func() {
			left = endpoints.NewMemDB()
			right = endpoints.NewMemDB()
			right.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "uuid1-hash",
			}, true)
			left.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "uuid2-hash",
			}, true)

			diff2, _ := ComputeDiff(testCtx, left, right, nil)
			So(diff2.MissingLeft, ShouldHaveLength, 0)
			So(diff2.MissingRight, ShouldHaveLength, 0)
			So(diff2.Conflicts, ShouldHaveLength, 1)
			So(diff2.Conflicts[0].Type, ShouldEqual, ConflictFileContent)

		})

		Convey("Test conflicts : node type", func() {
			left = endpoints.NewMemDB()
			right = endpoints.NewMemDB()
			right.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash1",
			}, true)
			left.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_COLLECTION,
				Etag: "hash2",
			}, true)

			diff2, _ := ComputeDiff(testCtx, left, right, nil)
			So(diff2.MissingLeft, ShouldHaveLength, 0)
			So(diff2.MissingRight, ShouldHaveLength, 0)
			So(diff2.Conflicts, ShouldHaveLength, 1)
			So(diff2.Conflicts[0].Type, ShouldEqual, ConflictNodeType)

		})

		Convey("Test ignored files", func() {
			left = endpoints.NewMemDB()
			right = endpoints.NewMemDB()
			right.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			left.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			left.CreateNode(testCtx, &tree.Node{
				Path: "/aaa/.DS_Store",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			left.CreateNode(testCtx, &tree.Node{
				Path: "/.minio.sys",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			left.CreateNode(testCtx, &tree.Node{
				Path: "/$buckets.json",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			left.CreateNode(testCtx, &tree.Node{
				Path: "/$multiparts-session.json",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			t1, _ := TreeNodeFromSource(left)
			t2, _ := TreeNodeFromSource(right)
			diff := &Diff{}
			MergeNodes(t1, t2, diff)
			So(diff.MissingLeft, ShouldHaveLength, 0)
			So(diff.MissingRight, ShouldHaveLength, 0)

			diff2, _ := ComputeDiff(testCtx, left, right, nil)
			So(diff2.MissingLeft, ShouldHaveLength, 0)
			So(diff2.MissingRight, ShouldHaveLength, 0)

		})

		Convey("Test Rename", func() {
			left := endpoints.NewMemDB()
			right := endpoints.NewMemDB()
			left.CreateNode(testCtx, &tree.Node{
				Path: "aaa",
				Type: tree.NodeType_COLLECTION,
				Etag: "-1",
			}, true)
			left.CreateNode(testCtx, &tree.Node{
				Path: "aaa/old",
				Type: tree.NodeType_LEAF,
				Etag: "hasha",
			}, true)

			right.CreateNode(testCtx, &tree.Node{
				Path: "aaa",
				Type: tree.NodeType_COLLECTION,
				Etag: "-1",
			}, true)
			right.CreateNode(testCtx, &tree.Node{
				Path: "aaa/new",
				Type: tree.NodeType_LEAF,
				Etag: "hasha",
			}, true)
			t2, _ := TreeNodeFromSource(right)
			t1, _ := TreeNodeFromSource(left)
			h1 := t1.GetHash()
			h2 := t2.GetHash()
			So(h1, ShouldNotEqual, h2)
			diff := &Diff{}
			MergeNodes(t1, t2, diff)
			So(diff.MissingLeft, ShouldHaveLength, 1)
			So(diff.MissingRight, ShouldHaveLength, 1)

			diff2, _ := ComputeDiff(testCtx, left, right, nil)
			So(diff2.MissingLeft, ShouldHaveLength, 1)
			So(diff2.MissingRight, ShouldHaveLength, 1)

		})

		Convey("Test further files", func() {
			left := endpoints.NewMemDB()
			right := endpoints.NewMemDB()
			right.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_COLLECTION,
				Etag: "-1",
			}, true)

			left.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_COLLECTION,
				Etag: "-1",
			}, true)
			left.CreateNode(testCtx, &tree.Node{
				Path: "/aaa/new",
				Type: tree.NodeType_LEAF,
				Etag: "hasha",
			}, true)
			left.CreateNode(testCtx, &tree.Node{
				Path: "/aaa/new2",
				Type: tree.NodeType_LEAF,
				Etag: "hashme",
			}, true)
			t2, _ := TreeNodeFromSource(right)
			t1, _ := TreeNodeFromSource(left)
			diff := &Diff{}
			MergeNodes(t1, t2, diff)
			So(diff.MissingLeft, ShouldHaveLength, 0)
			So(diff.MissingRight, ShouldHaveLength, 2)

			diff2, _ := ComputeDiff(testCtx, left, right, nil)
			So(diff2.MissingLeft, ShouldHaveLength, 0)
			So(diff2.MissingRight, ShouldHaveLength, 2)

		})

		Convey("Test subfolders files", func() {
			left := endpoints.NewMemDB()
			right := endpoints.NewMemDB()
			right.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_COLLECTION,
				Etag: "-1",
			}, true)

			left.CreateNode(testCtx, &tree.Node{
				Path: "/bbb",
				Type: tree.NodeType_COLLECTION,
				Etag: "-1",
			}, true)
			left.CreateNode(testCtx, &tree.Node{
				Path: "/bbb/new",
				Type: tree.NodeType_LEAF,
				Etag: "hasha",
			}, true)
			left.CreateNode(testCtx, &tree.Node{
				Path: "/bbb/new2",
				Type: tree.NodeType_LEAF,
				Etag: "hashme",
			}, true)
			t2, _ := TreeNodeFromSource(right)
			t1, _ := TreeNodeFromSource(left)
			diff := &Diff{}
			MergeNodes(t1, t2, diff)
			So(diff.MissingLeft, ShouldHaveLength, 1)
			So(diff.MissingRight, ShouldHaveLength, 3)

			diff2, _ := ComputeDiff(testCtx, left, right, nil)
			So(diff2.MissingLeft, ShouldHaveLength, 1)
			So(diff2.MissingRight, ShouldHaveLength, 3)

		})

		Convey("Test subfolders insert", func() {
			left := endpoints.NewMemDB()
			right := endpoints.NewMemDB()
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa", Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/a", Type: tree.NodeType_LEAF, Etag: "hasha"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/b", Type: tree.NodeType_LEAF, Etag: "hashme"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/c", Type: tree.NodeType_LEAF, Etag: "chash"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/d", Type: tree.NodeType_LEAF, Etag: "dhash"}, true)

			right.CreateNode(testCtx, &tree.Node{Path: "/aaa", Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
			right.CreateNode(testCtx, &tree.Node{Path: "/aaa/a", Type: tree.NodeType_LEAF, Etag: "hasha"}, true)
			right.CreateNode(testCtx, &tree.Node{Path: "/aaa/c", Type: tree.NodeType_LEAF, Etag: "chash"}, true)
			t1, _ := TreeNodeFromSource(left)
			t2, _ := TreeNodeFromSource(right)
			diff := &Diff{}
			MergeNodes(t1, t2, diff)
			So(diff.MissingLeft, ShouldHaveLength, 0)
			So(diff.MissingRight, ShouldHaveLength, 2)

			diff2, _ := ComputeDiff(testCtx, left, right, nil)
			So(diff2.MissingLeft, ShouldHaveLength, 0)
			So(diff2.MissingRight, ShouldHaveLength, 2)

			// Test reverse
			diff4, _ := ComputeDiff(testCtx, right, left, nil)
			So(diff4.MissingLeft, ShouldHaveLength, 2)
			So(diff4.MissingRight, ShouldHaveLength, 0)

			diff3 := &Diff{}
			MergeNodes(t2, t1, diff3)
			So(diff3.MissingLeft, ShouldHaveLength, 2)
			So(diff3.MissingRight, ShouldHaveLength, 0)

		})

		Convey("Test subfolders recursive", func() {
			left := endpoints.NewMemDB()
			right := endpoints.NewMemDB()
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa", Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/a", Type: tree.NodeType_LEAF, Etag: "hasha"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/b", Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/b/z", Type: tree.NodeType_LEAF, Etag: "zhash"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/b/t", Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/b/q", Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/c", Type: tree.NodeType_LEAF, Etag: "chash"}, true)

			right.CreateNode(testCtx, &tree.Node{Path: "/aaa", Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
			right.CreateNode(testCtx, &tree.Node{Path: "/aaa/a", Type: tree.NodeType_LEAF, Etag: "hasha"}, true)
			right.CreateNode(testCtx, &tree.Node{Path: "/aaa/c", Type: tree.NodeType_LEAF, Etag: "chash"}, true)
			t1, _ := TreeNodeFromSource(left)
			t2, _ := TreeNodeFromSource(right)
			diff := &Diff{}
			MergeNodes(t1, t2, diff)
			So(diff.MissingLeft, ShouldHaveLength, 0)
			So(diff.MissingRight, ShouldHaveLength, 4)

			diff2, _ := ComputeDiff(testCtx, left, right, nil)
			So(diff2.MissingLeft, ShouldHaveLength, 0)
			So(diff2.MissingRight, ShouldHaveLength, 4)

			// Test reverse
			diff4, _ := ComputeDiff(testCtx, right, left, nil)
			So(diff4.MissingLeft, ShouldHaveLength, 4)
			So(diff4.MissingRight, ShouldHaveLength, 0)

			diff3 := &Diff{}
			MergeNodes(t2, t1, diff3)
			So(diff3.MissingLeft, ShouldHaveLength, 4)
			So(diff3.MissingRight, ShouldHaveLength, 0)

		})

		Convey("Test subfolders both", func() {
			left := endpoints.NewMemDB()
			right := endpoints.NewMemDB()
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa", Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/a", Type: tree.NodeType_LEAF, Etag: "hasha"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/b", Type: tree.NodeType_LEAF, Etag: "hashme"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/c", Type: tree.NodeType_LEAF, Etag: "chash"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/d", Type: tree.NodeType_LEAF, Etag: "dhash"}, true)

			right.CreateNode(testCtx, &tree.Node{Path: "/aaa", Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
			right.CreateNode(testCtx, &tree.Node{Path: "/aaa/a", Type: tree.NodeType_LEAF, Etag: "hasha"}, true)
			right.CreateNode(testCtx, &tree.Node{Path: "/aaa/eq", Type: tree.NodeType_LEAF, Etag: "eq"}, true)
			right.CreateNode(testCtx, &tree.Node{Path: "/aaa/c", Type: tree.NodeType_LEAF, Etag: "chash"}, true)
			t1, _ := TreeNodeFromSource(left)
			t2, _ := TreeNodeFromSource(right)
			diff := &Diff{}
			MergeNodes(t1, t2, diff)
			So(diff.MissingLeft, ShouldHaveLength, 1)
			So(diff.MissingRight, ShouldHaveLength, 2)

			diff2, _ := ComputeDiff(testCtx, left, right, nil)
			So(diff2.MissingLeft, ShouldHaveLength, 1)
			So(diff2.MissingRight, ShouldHaveLength, 2)

			// Test reverse
			diff4, _ := ComputeDiff(testCtx, right, left, nil)
			So(diff4.MissingLeft, ShouldHaveLength, 2)
			So(diff4.MissingRight, ShouldHaveLength, 1)

			diff3 := &Diff{}
			MergeNodes(t2, t1, diff3)
			So(diff3.MissingLeft, ShouldHaveLength, 2)
			So(diff3.MissingRight, ShouldHaveLength, 1)

		})

		Convey("Test massive folders", func() {
			left := endpoints.NewMemDB()
			right := endpoints.NewMemDB()
			for i := 0; i < 100; i++ {
				left.CreateNode(testCtx, &tree.Node{Path: fmt.Sprintf("/tmp%d", i), Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
				for j := 0; j < 100; j++ {
					left.CreateNode(testCtx, &tree.Node{Path: fmt.Sprintf("/tmp%d/tmp%d", i, j), Type: tree.NodeType_LEAF, Etag: "filehash"}, true)
				}
			}

			t1, _ := TreeNodeFromSource(left)
			t2, _ := TreeNodeFromSource(right)
			diff := &Diff{}
			MergeNodes(t1, t2, diff)
			So(diff.MissingLeft, ShouldHaveLength, 0)
			So(diff.MissingRight, ShouldHaveLength, 10100)

			diff2, _ := ComputeDiff(testCtx, left, right, nil)
			So(diff2.MissingLeft, ShouldHaveLength, 0)
			So(diff2.MissingRight, ShouldHaveLength, 10100)

			// Test reverse
			diff4, _ := ComputeDiff(testCtx, right, left, nil)
			So(diff4.MissingLeft, ShouldHaveLength, 10100)
			So(diff4.MissingRight, ShouldHaveLength, 0)

			diff3 := &Diff{}
			MergeNodes(t2, t1, diff3)
			So(diff3.MissingLeft, ShouldHaveLength, 10100)
			So(diff3.MissingRight, ShouldHaveLength, 0)

			// Rename on the right
			for i := 0; i < 100; i++ {
				dir := fmt.Sprintf("/tmp%d", i)
				if i == 8 {
					dir = fmt.Sprintf("/renamed%d", i)
				}
				right.CreateNode(testCtx, &tree.Node{Path: dir, Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
				for j := 0; j < 100; j++ {
					n := fmt.Sprintf("/tmp%d/tmp%d", i, j)
					if i == 8 {
						n = fmt.Sprintf("/renamed%d/tmp%d", i, j)
					}
					right.CreateNode(testCtx, &tree.Node{Path: n, Type: tree.NodeType_LEAF, Etag: "filehash"}, true)
				}
			}

			t1, _ = TreeNodeFromSource(left)
			t2, _ = TreeNodeFromSource(right)
			diff = &Diff{Left: left, Right: right, Context: context.Background()}
			MergeNodes(t1, t2, diff)
			So(diff.MissingLeft, ShouldHaveLength, 101)
			So(diff.MissingRight, ShouldHaveLength, 101)
			b, e := diff.ToUnidirectionalBatch(model.DirectionLeft)
			s := b.(*SimpleBatch)
			So(e, ShouldBeNil)
			So(s.deletes, ShouldHaveLength, 101)
			So(s.createFiles, ShouldHaveLength, 100)
			So(s.createFolders, ShouldHaveLength, 1)
			So(diff.String(), ShouldNotBeEmpty)
			So(diff.Stats(), ShouldNotBeEmpty)
		})

		Convey("Test massive folders with compute hash", func() {
			left := endpoints.NewMemDB()
			right := endpoints.NewMemDB()
			for i := 0; i < 100; i++ {
				left.CreateNode(testCtx, &tree.Node{Path: fmt.Sprintf("/tmp%d", i), Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
				for j := 0; j < 100; j++ {
					left.CreateNode(testCtx, &tree.Node{Path: fmt.Sprintf("/tmp%d/tmp%d", i, j), Type: tree.NodeType_LEAF, Etag: ""}, true)
				}
			}

			t1, _ := TreeNodeFromSource(left)
			t2, _ := TreeNodeFromSource(right)
			diff := &Diff{}
			MergeNodes(t1, t2, diff)
			So(diff.MissingLeft, ShouldHaveLength, 0)
			So(diff.MissingRight, ShouldHaveLength, 10100)

			diff2, _ := ComputeDiff(testCtx, left, right, nil)
			So(diff2.MissingLeft, ShouldHaveLength, 0)
			So(diff2.MissingRight, ShouldHaveLength, 10100)

			// Test reverse
			diff4, _ := ComputeDiff(testCtx, right, left, nil)
			So(diff4.MissingLeft, ShouldHaveLength, 10100)
			So(diff4.MissingRight, ShouldHaveLength, 0)

			diff3 := &Diff{}
			MergeNodes(t2, t1, diff3)
			So(diff3.MissingLeft, ShouldHaveLength, 10100)
			So(diff3.MissingRight, ShouldHaveLength, 0)

		})

		Convey("Test diff with chan", func() {
			left := endpoints.NewMemDB()
			right := endpoints.NewMemDB()
			for i := 0; i < 100; i++ {
				left.CreateNode(testCtx, &tree.Node{Path: fmt.Sprintf("/tmp%d", i), Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
				for j := 0; j < 100; j++ {
					left.CreateNode(testCtx, &tree.Node{Path: fmt.Sprintf("/tmp%d/tmp%d", i, j), Type: tree.NodeType_LEAF, Etag: ""}, true)
				}
			}
			statusChan := make(chan BatchProcessStatus)
			doneChan := make(chan bool, 1)
			go func() {
				for {
					select {
					case <-statusChan:
						break
					case <-doneChan:
						return
					}
				}
			}()
			diff, _ := ComputeDiff(testCtx, left, right, statusChan)
			doneChan <- true
			So(diff.MissingLeft, ShouldHaveLength, 0)
			So(diff.MissingRight, ShouldHaveLength, 10100)

		})

	})

}
