/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/endpoints/memory"
	"github.com/pydio/cells/common/sync/model"
)

var (
	bTestCtx = context.Background()
)

func TestBatch_Filter(t *testing.T) {

	Convey("Test simple case", t, func() {

		patch := newFlatPatch(memory.NewMemDB(), memory.NewMemDB())
		patch.Filter(bTestCtx)
		So(patch, ShouldNotBeNil)

	})

	Convey("Ignore Create file if not existing in source", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newFlatPatch(source, target)
		patch.Enqueue(&patchOperation{
			opType: OpCreateFile,
			eventInfo: model.EventInfo{
				Path: "/ignored-file",
			},
		})
		patch.Enqueue(&patchOperation{
			opType: OpCreateFolder,
			eventInfo: model.EventInfo{
				Path: "/ignored-folder",
			},
		})
		patch.Filter(bTestCtx)

		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpCreateFolder}), ShouldHaveLength, 0)

	})

	Convey("Do not ignore create file if existing in source", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newFlatPatch(source, target)
		source.CreateNode(bTestCtx, &tree.Node{
			Path: "/ignored-file",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		patch.Enqueue(&patchOperation{
			opType: OpCreateFile,
			eventInfo: model.EventInfo{
				Path: "/ignored-file",
			},
		})
		patch.Filter(bTestCtx)

		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 1)

	})

	Convey("Detect file move/rename", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newFlatPatch(source, target)

		target.CreateNode(bTestCtx, &tree.Node{
			Path: "/file-to-move",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)
		source.CreateNode(bTestCtx, &tree.Node{
			Path: "/a/file-moved",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		patch.Enqueue(&patchOperation{
			opType: OpCreateFile,
			eventInfo: model.EventInfo{
				Path: "/a/file-moved",
			},
		})
		patch.Enqueue(&patchOperation{
			opType: OpDelete,
			eventInfo: model.EventInfo{
				Path: "/file-to-move",
			},
		})
		patch.Filter(bTestCtx)
		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpMoveFile}), ShouldHaveLength, 1)

	})

	Convey("Detect multiple moves of nodes with same etags", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newFlatPatch(source, target)
		target.CreateNode(bTestCtx, &tree.Node{
			Path: "/file-to-move",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)
		target.CreateNode(bTestCtx, &tree.Node{
			Path: "/similar-file",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)
		source.CreateNode(bTestCtx, &tree.Node{
			Path: "/a/file-moved",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)
		source.CreateNode(bTestCtx, &tree.Node{
			Path: "/a/similar-file-moved",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		patch.Enqueue(&patchOperation{
			opType: OpCreateFile,
			eventInfo: model.EventInfo{
				Path: "/a/file-moved",
			},
		})
		patch.Enqueue(&patchOperation{
			opType: OpDelete,
			eventInfo: model.EventInfo{
				Path: "/file-to-move",
			},
		})
		patch.Enqueue(&patchOperation{
			opType: OpCreateFile,
			eventInfo: model.EventInfo{
				Path: "/a/similar-file-moved",
			},
		})
		patch.Enqueue(&patchOperation{
			opType: OpDelete,
			eventInfo: model.EventInfo{
				Path: "/similar-file",
			},
		})
		patch.Filter(bTestCtx)

		So(patch.OperationsByType([]OperationType{OpMoveFile}), ShouldHaveLength, 2)
		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 0)

	})

	Convey("Detect fast create/delete on same node and file does not exist at the end", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newFlatPatch(source, target)

		patch.Enqueue(&patchOperation{
			opType: OpCreateFile,
			eventInfo: model.EventInfo{
				Path: "/a/file-touched",
			},
		})
		patch.Enqueue(&patchOperation{
			opType: OpDelete,
			eventInfo: model.EventInfo{
				Path: "/a/file-touched",
			},
		})
		patch.Filter(bTestCtx)
		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 0)

	})

	Convey("Detect fast create/delete on same node and file does exist at the end", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newFlatPatch(source, target)

		source.CreateNode(bTestCtx, &tree.Node{
			Path: "/a/file-touched",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		patch.Enqueue(&patchOperation{
			opType: OpCreateFile,
			eventInfo: model.EventInfo{
				Path: "/a/file-touched",
			},
		})
		patch.Enqueue(&patchOperation{
			opType: OpDelete,
			eventInfo: model.EventInfo{
				Path: "/a/file-touched",
			},
		})
		patch.Filter(bTestCtx)
		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 1)
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 0)

	})

	Convey("Filter pruned deletion", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newFlatPatch(source, target)
		n1 := &tree.Node{
			Path: "/a",
			Type: tree.NodeType_COLLECTION,
			Etag: "h",
		}
		n2 := &tree.Node{
			Path: "/a/subfile",
			Type: tree.NodeType_LEAF,
			Etag: "hash1",
		}
		n3 := &tree.Node{
			Path: "/a-file-with-same-prefix",
			Type: tree.NodeType_LEAF,
			Etag: "hash2",
		}
		source.CreateNode(bTestCtx, n1, true)
		source.CreateNode(bTestCtx, n2, true)
		source.CreateNode(bTestCtx, n3, true)
		patch.Enqueue(&patchOperation{opType: OpDelete, eventInfo: model.EventInfo{Path: n1.Path}, node: n1})
		patch.Enqueue(&patchOperation{opType: OpDelete, eventInfo: model.EventInfo{Path: n2.Path}, node: n2})
		patch.Enqueue(&patchOperation{opType: OpDelete, eventInfo: model.EventInfo{Path: n3.Path}, node: n3})

		patch.Filter(bTestCtx)
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 2)

	})

	Convey("Filter pruned move", t, func() {
		source, target := memory.NewMemDB(), memory.NewMemDB()
		source.CreateNode(bTestCtx, &tree.Node{Uuid: "u1", Path: "/target"}, false)
		source.CreateNode(bTestCtx, &tree.Node{Uuid: "u2", Path: "/target/sub"}, false)
		patch := newFlatPatch(source, target)
		patch.Enqueue(&patchOperation{opType: OpCreateFolder, eventInfo: model.EventInfo{Path: "/target"}, node: &tree.Node{Uuid: "u1", Path: "/target"}})
		patch.Enqueue(&patchOperation{opType: OpCreateFolder, eventInfo: model.EventInfo{Path: "/target/sub"}, node: &tree.Node{Uuid: "u2", Path: "/target/sub"}})
		patch.Enqueue(&patchOperation{opType: OpDelete, eventInfo: model.EventInfo{Path: "/source"}, node: &tree.Node{Uuid: "u1", Path: "/source"}})
		patch.Enqueue(&patchOperation{opType: OpDelete, eventInfo: model.EventInfo{Path: "/source/sub"}, node: &tree.Node{Uuid: "u2", Path: "/source/sub"}})
		patch.Filter(bTestCtx)
		So(patch.OperationsByType([]OperationType{OpMoveFolder}), ShouldHaveLength, 1)
		So(patch.OperationsByType([]OperationType{OpMoveFile}), ShouldHaveLength, 0)
	})

}

func diffFromSnaps(folder string) (*TreeDiff, error) {
	right := memory.NewMemDB()
	e := right.FromJSON("./testdata/" + folder + "/right.json")
	if e != nil {
		return nil, e
	}

	left := memory.NewMemDB()
	e = left.FromJSON("./testdata/" + folder + "/left.json")
	if e != nil {
		return nil, e
	}
	diff := newTreeDiff(testCtx, left, right)
	e = diff.Compute("/")
	return diff, e
}

func TestScenariosFromSnapshot(t *testing.T) {

	Convey("SNAP - Simple Move folder", t, func() {

		diff, e := diffFromSnaps("move-folder")
		So(e, ShouldBeNil)

		So(diff.missingRight, ShouldHaveLength, 15)
		So(diff.missingLeft, ShouldHaveLength, 15)

		b, e := diff.ToUnidirectionalPatch(model.DirectionRight)
		So(e, ShouldBeNil)
		b.Filter(context.Background())
		So(b.OperationsByType([]OperationType{OpMoveFolder}), ShouldHaveLength, 1)
		So(b.OperationsByType([]OperationType{OpMoveFile}), ShouldHaveLength, 0)

	})

	Convey("SNAP - Content Edit", t, func() {

		diff, e := diffFromSnaps("update-content")
		So(e, ShouldBeNil)

		So(diff.missingRight, ShouldHaveLength, 0)
		So(diff.missingLeft, ShouldHaveLength, 0)
		So(diff.conflicts, ShouldHaveLength, 1)

		b, e := diff.ToUnidirectionalPatch(model.DirectionRight)
		So(e, ShouldBeNil)
		b.Filter(context.Background())
		So(b.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 0)
		So(b.OperationsByType([]OperationType{OpUpdateFile}), ShouldHaveLength, 1)

	})

	Convey("SNAP - Move Folder and Content Edit", t, func() {
		{
			diff, e := diffFromSnaps("move-update")
			So(e, ShouldBeNil)

			b, e := diff.ToUnidirectionalPatch(model.DirectionRight)
			So(e, ShouldBeNil)
			b.Filter(context.Background())
			So(b.OperationsByType([]OperationType{OpMoveFolder}), ShouldHaveLength, 1)
			So(b.OperationsByType([]OperationType{OpMoveFile}), ShouldHaveLength, 0)
			So(b.OperationsByType([]OperationType{OpUpdateFile}), ShouldHaveLength, 1)
		}
		{
			diff, e := diffFromSnaps("move-update-2")
			So(e, ShouldBeNil)

			b, e := diff.ToUnidirectionalPatch(model.DirectionRight)
			So(e, ShouldBeNil)
			b.Filter(context.Background())
			So(b.OperationsByType([]OperationType{OpMoveFolder}), ShouldHaveLength, 1)
			So(b.OperationsByType([]OperationType{OpMoveFile}), ShouldHaveLength, 0)
			So(b.OperationsByType([]OperationType{OpUpdateFile}), ShouldHaveLength, 1)
		}

	})

	Convey("SNAP - Move Folder Inside Move Folder", t, func() {

		diff, e := diffFromSnaps("move-inside-move")
		So(e, ShouldBeNil)
		b, e := diff.ToUnidirectionalPatch(model.DirectionRight)
		So(e, ShouldBeNil)

		b.Filter(context.Background())
		moves := b.OperationsByType([]OperationType{OpMoveFolder})
		So(moves, ShouldHaveLength, 4)
		if sb, ok := b.(*FlatPatch); ok {
			So(sb.folderMoves["A2"].(*patchOperation).node.Path, ShouldEqual, "A1")
			So(sb.folderMoves["A2/B2"].(*patchOperation).node.Path, ShouldEqual, "A2/B1")
			So(sb.folderMoves["A2/B2/C2"].(*patchOperation).node.Path, ShouldEqual, "A2/B2/C1")
			So(sb.folderMoves["A2/B2/C2/D2"].(*patchOperation).node.Path, ShouldEqual, "A2/B2/C2/D1")
		}

	})

	Convey("SNAP - Delete Inside Moved Folder", t, func() {

		diff, e := diffFromSnaps("move-delete")
		So(e, ShouldBeNil)
		b, e := diff.ToUnidirectionalPatch(model.DirectionRight)
		So(e, ShouldBeNil)

		b.Filter(context.Background())
		So(b.OperationsByType([]OperationType{OpMoveFolder}), ShouldHaveLength, 1)
		deletes := b.OperationsByType([]OperationType{OpDelete})
		So(deletes, ShouldHaveLength, 1)
		So(deletes[0].GetRefPath(), ShouldEqual, "AZERTY/crash-updatecells.log")

	})

}
