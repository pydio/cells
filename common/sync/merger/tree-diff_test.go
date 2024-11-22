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
	"fmt"
	"testing"

	"github.com/gobwas/glob"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/model"
)

var (
	testCtx = context.Background()
)

func TestComputeSourcesDiff(t *testing.T) {
	Convey("Test various Diffs", t, func() {

		var left, right *memory.MemDB
		var diff *TreeDiff

		Convey("Test empty source and target", func() {
			left = memory.NewMemDB()
			right = memory.NewMemDB()
			diff = newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff, ShouldNotBeNil)
			So(diff.missingLeft, ShouldHaveLength, 0)
			So(diff.missingRight, ShouldHaveLength, 0)
		})

		Convey("Test file in left", func() {
			left = memory.NewMemDB()
			right = memory.NewMemDB()
			left.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			diff = newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 0)
			So(diff.missingRight, ShouldHaveLength, 1)
		})

		Convey("Test file in right", func() {
			left = memory.NewMemDB()
			right = memory.NewMemDB()
			right.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			diff = newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 1)
			So(diff.missingRight, ShouldHaveLength, 0)
		})

		Convey("Test files in both", func() {
			left = memory.NewMemDB()
			right = memory.NewMemDB()
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
			diff = newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 0)
			So(diff.missingRight, ShouldHaveLength, 0)
		})

		Convey("Test ignored files", func() {
			left = memory.NewMemDB()
			right = memory.NewMemDB()
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
			diff = newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 0)
			So(diff.missingRight, ShouldHaveLength, 0)
		})

	})
}

func TestTreeDiff(t *testing.T) {
	Convey("Test Tree Diffs", t, func() {

		var left, right *memory.MemDB
		Convey("Test empty source and target", func() {
			left = memory.NewMemDB()
			right = memory.NewMemDB()
			t1, _ := TreeNodeFromSource(testCtx, left, "/", []glob.Glob{}, []glob.Glob{})
			// Trigger printout for test coverage
			t.Log(t1.PrintTree())
			diff := newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 0)
			So(diff.missingRight, ShouldHaveLength, 0)

		})

		Convey("Test file in left", func() {
			left = memory.NewMemDB()
			right = memory.NewMemDB()
			left.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			diff := newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 0)
			So(diff.missingRight, ShouldHaveLength, 1)
		})

		Convey("Test file in right", func() {
			left = memory.NewMemDB()
			right = memory.NewMemDB()
			right.CreateNode(testCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			diff := newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 1)
			So(diff.missingRight, ShouldHaveLength, 0)
		})

		Convey("Test files in both", func() {
			left = memory.NewMemDB()
			right = memory.NewMemDB()
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
			diff := newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 0)
			So(diff.missingRight, ShouldHaveLength, 0)
		})

		Convey("Test conflicts : folder UUID", func() {
			left = memory.NewMemDB()
			right = memory.NewMemDB()
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
			diff := newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 0)
			So(diff.missingRight, ShouldHaveLength, 0)
			So(diff.conflicts, ShouldHaveLength, 1)
			So(diff.conflicts[0].Type, ShouldEqual, ConflictFolderUUID)

		})

		Convey("Test conflicts : file contents", func() {
			left = memory.NewMemDB()
			right = memory.NewMemDB()
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
			diff := newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 0)
			So(diff.missingRight, ShouldHaveLength, 0)
			So(diff.conflicts, ShouldHaveLength, 1)
			So(diff.conflicts[0].Type, ShouldEqual, ConflictFileContent)

		})

		Convey("Test conflicts : node type", func() {
			left = memory.NewMemDB()
			right = memory.NewMemDB()
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
			diff := newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 0)
			So(diff.missingRight, ShouldHaveLength, 0)
			So(diff.conflicts, ShouldHaveLength, 1)
			So(diff.conflicts[0].Type, ShouldEqual, ConflictNodeType)

		})

		Convey("Test ignored files", func() {
			left = memory.NewMemDB()
			right = memory.NewMemDB()
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
			diff := newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 0)
			So(diff.missingRight, ShouldHaveLength, 0)
		})

		Convey("Test Rename", func() {
			left := memory.NewMemDB()
			right := memory.NewMemDB()
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
			t2, _ := TreeNodeFromSource(testCtx, right, "/", []glob.Glob{}, []glob.Glob{})
			t1, _ := TreeNodeFromSource(testCtx, left, "/", []glob.Glob{}, []glob.Glob{})
			h1 := t1.GetHash()
			h2 := t2.GetHash()
			So(h1, ShouldNotEqual, h2)
			diff := newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 1)
			So(diff.missingRight, ShouldHaveLength, 1)
		})

		Convey("Test further files", func() {
			left := memory.NewMemDB()
			right := memory.NewMemDB()
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
			diff := newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 0)
			So(diff.missingRight, ShouldHaveLength, 2)
		})

		Convey("Test subfolders files", func() {
			left := memory.NewMemDB()
			right := memory.NewMemDB()
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
			diff := newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 1)
			So(diff.missingRight, ShouldHaveLength, 3)
		})

		Convey("Test subfolders insert", func() {
			left := memory.NewMemDB()
			right := memory.NewMemDB()
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa", Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/a", Type: tree.NodeType_LEAF, Etag: "hasha"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/b", Type: tree.NodeType_LEAF, Etag: "hashme"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/c", Type: tree.NodeType_LEAF, Etag: "chash"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/d", Type: tree.NodeType_LEAF, Etag: "dhash"}, true)

			right.CreateNode(testCtx, &tree.Node{Path: "/aaa", Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
			right.CreateNode(testCtx, &tree.Node{Path: "/aaa/a", Type: tree.NodeType_LEAF, Etag: "hasha"}, true)
			right.CreateNode(testCtx, &tree.Node{Path: "/aaa/c", Type: tree.NodeType_LEAF, Etag: "chash"}, true)
			diff := newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 0)
			So(diff.missingRight, ShouldHaveLength, 2)

			// Test reverse
			diff = newTreeDiff(right, left)
			e = diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 2)
			So(diff.missingRight, ShouldHaveLength, 0)
		})

		Convey("Test subfolders recursive", func() {
			left := memory.NewMemDB()
			right := memory.NewMemDB()
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
			diff := newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 0)
			So(diff.missingRight, ShouldHaveLength, 4)

			// Test reverse
			diff4 := newTreeDiff(right, left)
			e4 := diff4.Compute(testCtx, "/", nil, nil)
			So(e4, ShouldBeNil)
			So(diff4.missingLeft, ShouldHaveLength, 4)
			So(diff4.missingRight, ShouldHaveLength, 0)
		})

		Convey("Test subfolders both", func() {
			left := memory.NewMemDB()
			right := memory.NewMemDB()
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa", Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/a", Type: tree.NodeType_LEAF, Etag: "hasha"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/b", Type: tree.NodeType_LEAF, Etag: "hashme"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/c", Type: tree.NodeType_LEAF, Etag: "chash"}, true)
			left.CreateNode(testCtx, &tree.Node{Path: "/aaa/d", Type: tree.NodeType_LEAF, Etag: "dhash"}, true)

			right.CreateNode(testCtx, &tree.Node{Path: "/aaa", Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
			right.CreateNode(testCtx, &tree.Node{Path: "/aaa/a", Type: tree.NodeType_LEAF, Etag: "hasha"}, true)
			right.CreateNode(testCtx, &tree.Node{Path: "/aaa/eq", Type: tree.NodeType_LEAF, Etag: "eq"}, true)
			right.CreateNode(testCtx, &tree.Node{Path: "/aaa/c", Type: tree.NodeType_LEAF, Etag: "chash"}, true)
			diff := newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 1)
			So(diff.missingRight, ShouldHaveLength, 2)

			// Test reverse
			diff4 := newTreeDiff(right, left)
			e4 := diff4.Compute(testCtx, "/", nil, nil)
			So(e4, ShouldBeNil)
			So(diff4.missingLeft, ShouldHaveLength, 2)
			So(diff4.missingRight, ShouldHaveLength, 1)

		})

		Convey("Test massive folders", func() {
			left := memory.NewMemDB()
			right := memory.NewMemDB()
			for i := 0; i < 100; i++ {
				left.CreateNode(testCtx, &tree.Node{Path: fmt.Sprintf("/tmp%d", i), Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
				for j := 0; j < 100; j++ {
					left.CreateNode(testCtx, &tree.Node{Path: fmt.Sprintf("/tmp%d/tmp%d", i, j), Type: tree.NodeType_LEAF, Etag: "filehash"}, true)
				}
			}

			diff := newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 0)
			So(diff.missingRight, ShouldHaveLength, 10100)

			// Test reverse
			diff4 := newTreeDiff(right, left)
			e4 := diff4.Compute(testCtx, "/", nil, nil)
			So(e4, ShouldBeNil)
			So(diff4.missingLeft, ShouldHaveLength, 10100)
			So(diff4.missingRight, ShouldHaveLength, 0)

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

			diff = newTreeDiff(left, right)
			e = diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 101)
			So(diff.missingRight, ShouldHaveLength, 101)
			patch := newTreePatch(left, right, PatchOptions{MoveDetection: true})
			e = diff.ToUnidirectionalPatch(testCtx, model.DirectionLeft, patch)
			So(e, ShouldBeNil)
			So(patch.deletes, ShouldHaveLength, 101)
			So(patch.createFiles, ShouldHaveLength, 100)
			So(patch.createFolders, ShouldHaveLength, 1)
			So(diff.String(), ShouldNotBeEmpty)
			So(diff.Stats(), ShouldNotBeEmpty)
		})

		Convey("Test massive folders with compute hash", func() {
			left := memory.NewMemDB()
			right := memory.NewMemDB()
			for i := 0; i < 100; i++ {
				left.CreateNode(testCtx, &tree.Node{Path: fmt.Sprintf("/tmp%d", i), Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
				for j := 0; j < 100; j++ {
					left.CreateNode(testCtx, &tree.Node{Path: fmt.Sprintf("/tmp%d/tmp%d", i, j), Type: tree.NodeType_LEAF, Etag: ""}, true)
				}
			}

			diff := newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			So(diff.missingLeft, ShouldHaveLength, 0)
			So(diff.missingRight, ShouldHaveLength, 10100)

			// Test reverse
			diff4 := newTreeDiff(right, left)
			diff4.Compute(testCtx, "/", nil, nil)
			So(diff4.missingLeft, ShouldHaveLength, 10100)
			So(diff4.missingRight, ShouldHaveLength, 0)

		})

		Convey("Test diff with chan", func() {
			left := memory.NewMemDB()
			right := memory.NewMemDB()
			for i := 0; i < 100; i++ {
				left.CreateNode(testCtx, &tree.Node{Path: fmt.Sprintf("/tmp%d", i), Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
				for j := 0; j < 100; j++ {
					left.CreateNode(testCtx, &tree.Node{Path: fmt.Sprintf("/tmp%d/tmp%d", i, j), Type: tree.NodeType_LEAF, Etag: ""}, true)
				}
			}
			statusChan := make(chan model.Status)
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
			diff := newTreeDiff(left, right)
			e := diff.Compute(testCtx, "/", nil, nil)
			So(e, ShouldBeNil)
			doneChan <- true
			So(diff.missingLeft, ShouldHaveLength, 0)
			So(diff.missingRight, ShouldHaveLength, 10100)

		})

	})

}

func TestTreeDiffErrors(t *testing.T) {
	var left, right *memory.MemDB

	Convey("Test Tree Diffs", t, func() {
		left = memory.NewMemDB()
		right = memory.NewMemDB()

		t1, _ := TreeNodeFromSource(testCtx, left, "/", []glob.Glob{}, []glob.Glob{})
		// Trigger printout for test coverage
		t.Log(t1.PrintTree())
		diff := newTreeDiff(left, right)
		patch := newTreePatch(left, right, PatchOptions{MoveDetection: true})
		err := diff.ToUnidirectionalPatch(testCtx, model.DirectionBi, patch)
		So(err, ShouldNotBeNil)
	})
}

func TestTreeDiffDeepPatches(t *testing.T) {

	var left, right *memory.MemDB
	Convey("", t, func() {
		left = memory.NewMemDB()
		right = memory.NewMemDB()

		diff := &TreeDiff{}

		lp, rp := diff.leftAndRightPatches(testCtx, left, right)
		So(lp, ShouldNotBeNil)
		So(rp, ShouldNotBeNil)
	})
}

func TestTreeDiffConflictsAndStatus(t *testing.T) {

	var left, right *memory.MemDB
	Convey("", t, func() {
		left = memory.NewMemDB()
		right = memory.NewMemDB()

		_ = right.CreateNode(testCtx, &tree.Node{
			Path: "/aaa",
			Type: tree.NodeType_COLLECTION,
			Uuid: "uuid1",
			Etag: "uuid1-hash",
		}, true)
		_ = left.CreateNode(testCtx, &tree.Node{
			Path: "/aaa",
			Type: tree.NodeType_COLLECTION,
			Uuid: "uuid2",
			Etag: "uuid2-hash",
		}, true)

		statusChan := make(chan model.Status, 1)
		doneChan := make(chan interface{}, 1)

		diff := newTreeDiff(left, right)
		diff.SetupChannels(statusChan, doneChan, nil)

		// start a routine to read status
		f := func() {
			for {
				select {
				case <-doneChan:
					return
				case s := <-statusChan:
					t.Log(s)
				}
			}
		}

		go f()
		e := diff.Compute(testCtx, "/", nil, nil)
		So(e, ShouldBeNil)

		go f()
		_, _ = diff.leftAndRightPatches(testCtx, left, right)
		So(diff.conflicts, ShouldHaveLength, 1)
	})
}

func TestTreeNodeFromSourceWithGlob(t *testing.T) {

	Convey("Test Glob", t, func() {

		left := memory.NewMemDB()
		left.CreateNode(testCtx, &tree.Node{Path: "/aaa", Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
		left.CreateNode(testCtx, &tree.Node{Path: "/aaa/.pydio", Type: tree.NodeType_LEAF, Etag: "hashlla"}, true)
		left.CreateNode(testCtx, &tree.Node{Path: "/aaa/a", Type: tree.NodeType_LEAF, Etag: "hasha"}, true)
		left.CreateNode(testCtx, &tree.Node{Path: "/aaa/b", Type: tree.NodeType_LEAF, Etag: "hashme"}, true)
		left.CreateNode(testCtx, &tree.Node{Path: "/aaa/c", Type: tree.NodeType_LEAF, Etag: "chash"}, true)
		left.CreateNode(testCtx, &tree.Node{Path: "/aaa/d", Type: tree.NodeType_LEAF, Etag: "dhash"}, true)
		left.CreateNode(testCtx, &tree.Node{Path: "/bbb", Type: tree.NodeType_COLLECTION, Etag: "-1"}, true)
		left.CreateNode(testCtx, &tree.Node{Path: "/bbb/.pydio", Type: tree.NodeType_LEAF, Etag: "heeasha"}, true)
		left.CreateNode(testCtx, &tree.Node{Path: "/bbb/a", Type: tree.NodeType_LEAF, Etag: "hasha"}, true)
		left.CreateNode(testCtx, &tree.Node{Path: "/bbb/b", Type: tree.NodeType_LEAF, Etag: "hashme"}, true)

		var ignores []glob.Glob
		TreeNodeFromSource(testCtx, left, "/", ignores, []glob.Glob{})

	})

}

func TestTreeNodeFromSourceWithMeta(t *testing.T) {

	Convey("Test Loading Meta", t, func() {

		left := memory.NewMemDB()
		left.CreateNode(testCtx, &tree.Node{Path: "/aaa", Type: tree.NodeType_COLLECTION, Etag: "-1", MetaStore: map[string]string{
			"pydio:special-meta-1": "value1",
		}}, true)
		left.CreateNode(testCtx, &tree.Node{Path: "/aaa/a", Type: tree.NodeType_LEAF, Etag: "hasha", MetaStore: map[string]string{
			"pydio:special-meta-1": "value1",
			"pydio:special-meta-2": "value2",
		}}, true)
		left.CreateNode(testCtx, &tree.Node{Path: "/aaa/b", Type: tree.NodeType_LEAF, Etag: "hashme", MetaStore: map[string]string{
			"other-meta": "other-value",
		}}, true)

		metaGlobs := []glob.Glob{
			glob.MustCompile("pydio:special-meta-*"),
		}
		_, e := TreeNodeFromSource(testCtx, left, "/", nil, metaGlobs)
		So(e, ShouldBeNil)

	})

	Convey("Test Diffing Metas", t, func() {

		left := memory.NewMemDB()
		left.CreateNode(testCtx, &tree.Node{Path: "aaa", Type: tree.NodeType_COLLECTION, Uuid: "node-1", Etag: "-1", MetaStore: map[string]string{
			"pydio:special-meta-1": "value1",
		}}, true)
		left.CreateNode(testCtx, &tree.Node{Path: "aaa/a", Type: tree.NodeType_LEAF, Uuid: "node-2", Etag: "hasha", MetaStore: map[string]string{
			"pydio:special-meta-1":       "value-similar",
			"pydio:special-meta-deleted": "value2",
		}}, true)

		right := memory.NewMemDB()
		right.CreateNode(testCtx, &tree.Node{Path: "aaa", Type: tree.NodeType_COLLECTION, Uuid: "node-1", Etag: "-1", MetaStore: map[string]string{
			"pydio:special-meta-1": "value-changed",
		}}, true)
		right.CreateNode(testCtx, &tree.Node{Path: "aaa/a", Type: tree.NodeType_LEAF, Uuid: "node-2", Etag: "hasha", MetaStore: map[string]string{
			"pydio:special-meta-1":       "value-similar",
			"pydio:special-meta-created": "new-value",
		}}, true)

		metaGlobs := []glob.Glob{
			glob.MustCompile("pydio:special-meta-*"),
		}

		diff := NewTreeDiff(left, right)
		diff.includeMetas = metaGlobs
		e := diff.Compute(testCtx, "", nil, nil)
		So(e, ShouldBeNil)
		t.Log(diff.String())

		p := newTreePatch(left, right, PatchOptions{})
		err := diff.ToUnidirectionalPatch(testCtx, model.DirectionRight, p)
		So(err, ShouldBeNil)
		t.Log(p)
		var i0, i1, i2 int
		p.WalkOperations([]OperationType{OpCreateMeta, OpDeleteMeta, OpUpdateMeta}, func(operation Operation) {
			switch operation.Type() {
			case OpCreateMeta:
				i0++
			case OpUpdateMeta:
				i1++
			case OpDeleteMeta:
				i2++
			}
		})
		So(i0, ShouldEqual, 1)
		So(i1, ShouldEqual, 1)
		So(i2, ShouldEqual, 1)

	})

}
