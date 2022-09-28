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

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/sync/endpoints/memory"
	"github.com/pydio/cells/v4/common/sync/model"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

var (
	ctx = context.Background()
)

func TestTreePatch_Filter(t *testing.T) {

	Convey("Test simple case", t, func() {

		patch := newTreePatch(memory.NewMemDB(), memory.NewMemDB(), PatchOptions{})
		patch.Filter(ctx)
		So(patch, ShouldNotBeNil)

	})

	Convey("Ignore Create file if not existing in source", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newTreePatch(source, target, PatchOptions{MoveDetection: true})
		patch.Enqueue(&patchOperation{
			OpType: OpCreateFile,
			EventInfo: model.EventInfo{
				Path: "/ignored-file",
			},
		})
		patch.Enqueue(&patchOperation{
			OpType: OpCreateFolder,
			EventInfo: model.EventInfo{
				Path: "/ignored-folder",
			},
		})
		patch.Filter(ctx)

		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpCreateFolder}), ShouldHaveLength, 0)

	})

	Convey("Do not ignore create file if existing in source", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newTreePatch(source, target, PatchOptions{MoveDetection: true})
		source.CreateNode(ctx, &tree.Node{
			Path: "/ignored-file",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		patch.Enqueue(&patchOperation{
			OpType: OpCreateFile,
			EventInfo: model.EventInfo{
				Path: "/ignored-file",
			},
		})
		patch.Filter(ctx)

		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 1)

	})

	Convey("Detect file move/rename", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newTreePatch(source, target, PatchOptions{MoveDetection: true})

		target.CreateNode(ctx, &tree.Node{
			Path: "/file-to-move",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)
		source.CreateNode(ctx, &tree.Node{
			Path: "/a/file-moved",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		patch.Enqueue(&patchOperation{
			OpType: OpCreateFile,
			EventInfo: model.EventInfo{
				Path: "/a/file-moved",
			},
		})
		patch.Enqueue(&patchOperation{
			OpType: OpDelete,
			EventInfo: model.EventInfo{
				Path: "/file-to-move",
			},
		})
		patch.Filter(ctx)
		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpMoveFile}), ShouldHaveLength, 1)

	})

	Convey("Detect multiple moves of nodes with same etags", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newTreePatch(source, target, PatchOptions{MoveDetection: true})
		target.CreateNode(ctx, &tree.Node{
			Path: "/file-to-move",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)
		target.CreateNode(ctx, &tree.Node{
			Path: "/similar-file",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)
		source.CreateNode(ctx, &tree.Node{
			Path: "/a/file-moved",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)
		source.CreateNode(ctx, &tree.Node{
			Path: "/a/similar-file-moved",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		patch.Enqueue(&patchOperation{
			OpType: OpCreateFile,
			EventInfo: model.EventInfo{
				Path: "/a/file-moved",
			},
		})
		patch.Enqueue(&patchOperation{
			OpType: OpDelete,
			EventInfo: model.EventInfo{
				Path: "/file-to-move",
			},
		})
		patch.Enqueue(&patchOperation{
			OpType: OpCreateFile,
			EventInfo: model.EventInfo{
				Path: "/a/similar-file-moved",
			},
		})
		patch.Enqueue(&patchOperation{
			OpType: OpDelete,
			EventInfo: model.EventInfo{
				Path: "/similar-file",
			},
		})
		patch.Filter(ctx)

		So(patch.OperationsByType([]OperationType{OpMoveFile}), ShouldHaveLength, 2)
		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 0)

	})

	Convey("Detect fast create/delete on same node and file does not exist at the end", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newTreePatch(source, target, PatchOptions{MoveDetection: true})

		patch.Enqueue(&patchOperation{
			OpType: OpCreateFile,
			EventInfo: model.EventInfo{
				Path: "/a/file-touched",
			},
		})
		patch.Enqueue(&patchOperation{
			OpType: OpDelete,
			EventInfo: model.EventInfo{
				Path: "/a/file-touched",
			},
		})
		patch.Filter(ctx)
		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 0)

	})

	Convey("Detect fast create/delete on same node and file does exist at the end", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newTreePatch(source, target, PatchOptions{MoveDetection: true})

		source.CreateNode(ctx, &tree.Node{
			Path: "/a/file-touched",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		patch.Enqueue(&patchOperation{
			OpType: OpCreateFile,
			EventInfo: model.EventInfo{
				Path: "/a/file-touched",
			},
		})
		patch.Enqueue(&patchOperation{
			OpType: OpDelete,
			EventInfo: model.EventInfo{
				Path: "/a/file-touched",
			},
		})
		patch.Filter(ctx)
		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 1)
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 0)

	})

	Convey("Filter pruned deletion", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newTreePatch(source, target, PatchOptions{MoveDetection: true})
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
		source.CreateNode(ctx, n1, true)
		source.CreateNode(ctx, n2, true)
		source.CreateNode(ctx, n3, true)
		patch.Enqueue(&patchOperation{OpType: OpDelete, EventInfo: model.EventInfo{Path: n1.Path}, Node: n1})
		patch.Enqueue(&patchOperation{OpType: OpDelete, EventInfo: model.EventInfo{Path: n2.Path}, Node: n2})
		patch.Enqueue(&patchOperation{OpType: OpDelete, EventInfo: model.EventInfo{Path: n3.Path}, Node: n3})

		patch.Filter(ctx)
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 2)

	})

}

func TestPrunedMove(t *testing.T) {

	Convey("Filter pruned move subfolder", t, func() {
		source, target := memory.NewMemDB(), memory.NewMemDB()
		source.CreateNode(ctx, &tree.Node{Uuid: "u1", Path: "/subfolder/target"}, false)
		source.CreateNode(ctx, &tree.Node{Uuid: "u2", Path: "/subfolder/target/sub"}, false)
		source.CreateNode(ctx, &tree.Node{Uuid: "u3", Path: "/subfolder/target/sub/file1", Etag: "u3", Type: tree.NodeType_LEAF}, false)
		source.CreateNode(ctx, &tree.Node{Uuid: "u4", Path: "/subfolder/target/sub/file2", Etag: "u4", Type: tree.NodeType_LEAF}, false)
		patch := newTreePatch(source, target, PatchOptions{MoveDetection: true})
		patch.Enqueue(&patchOperation{OpType: OpCreateFolder, EventInfo: model.EventInfo{Path: "/subfolder/target"}, Node: &tree.Node{Uuid: "u1", Path: "/subfolder/target"}})
		patch.Enqueue(&patchOperation{OpType: OpCreateFolder, EventInfo: model.EventInfo{Path: "/subfolder/target/sub"}, Node: &tree.Node{Uuid: "u2", Path: "/subfolder/target/sub"}})
		patch.Enqueue(&patchOperation{OpType: OpCreateFile, EventInfo: model.EventInfo{Path: "/subfolder/target/sub/file1"}, Node: &tree.Node{Uuid: "u3", Path: "/subfolder/target/sub/file1", Etag: "u3", Type: tree.NodeType_LEAF}})
		patch.Enqueue(&patchOperation{OpType: OpCreateFile, EventInfo: model.EventInfo{Path: "/subfolder/target/sub/file2"}, Node: &tree.Node{Uuid: "u4", Path: "/subfolder/target/sub/file2", Etag: "u4", Type: tree.NodeType_LEAF}})
		patch.Enqueue(&patchOperation{OpType: OpDelete, EventInfo: model.EventInfo{Path: "/source"}, Node: &tree.Node{Uuid: "u1", Path: "/source"}})
		patch.Enqueue(&patchOperation{OpType: OpDelete, EventInfo: model.EventInfo{Path: "/source/sub"}, Node: &tree.Node{Uuid: "u2", Path: "/source/sub"}})
		patch.Enqueue(&patchOperation{OpType: OpDelete, EventInfo: model.EventInfo{Path: "/source/sub/file1"}, Node: &tree.Node{Uuid: "u3", Path: "/source/sub/file1", Etag: "u3", Type: tree.NodeType_LEAF}})
		patch.Enqueue(&patchOperation{OpType: OpDelete, EventInfo: model.EventInfo{Path: "/source/sub/file2"}, Node: &tree.Node{Uuid: "u4", Path: "/source/sub/file2", Etag: "u4", Type: tree.NodeType_LEAF}})
		patch.Filter(ctx)
		So(patch.OperationsByType([]OperationType{OpMoveFolder}), ShouldHaveLength, 1)
		So(patch.OperationsByType([]OperationType{OpMoveFile}), ShouldHaveLength, 0)
	})

	Convey("Filter pruned move", t, func() {
		source, target := memory.NewMemDB(), memory.NewMemDB()
		source.CreateNode(ctx, &tree.Node{Uuid: "u1", Path: "/target"}, false)
		source.CreateNode(ctx, &tree.Node{Uuid: "u2", Path: "/target/sub"}, false)
		source.CreateNode(ctx, &tree.Node{Uuid: "u3", Path: "/target/sub/file1", Etag: "u3", Type: tree.NodeType_LEAF}, false)
		source.CreateNode(ctx, &tree.Node{Uuid: "u4", Path: "/target/sub/file2", Etag: "u4", Type: tree.NodeType_LEAF}, false)
		patch := newTreePatch(source, target, PatchOptions{MoveDetection: true})
		patch.Enqueue(&patchOperation{OpType: OpCreateFolder, EventInfo: model.EventInfo{Path: "/target"}, Node: &tree.Node{Uuid: "u1", Path: "/target"}})
		patch.Enqueue(&patchOperation{OpType: OpCreateFolder, EventInfo: model.EventInfo{Path: "/target/sub"}, Node: &tree.Node{Uuid: "u2", Path: "/target/sub"}})
		patch.Enqueue(&patchOperation{OpType: OpCreateFile, EventInfo: model.EventInfo{Path: "/target/sub/file1"}, Node: &tree.Node{Uuid: "u3", Path: "/target/sub/file1", Etag: "u3", Type: tree.NodeType_LEAF}})
		patch.Enqueue(&patchOperation{OpType: OpCreateFile, EventInfo: model.EventInfo{Path: "/target/sub/file2"}, Node: &tree.Node{Uuid: "u4", Path: "/target/sub/file2", Etag: "u4", Type: tree.NodeType_LEAF}})
		patch.Enqueue(&patchOperation{OpType: OpDelete, EventInfo: model.EventInfo{Path: "/source"}, Node: &tree.Node{Uuid: "u1", Path: "/source"}})
		patch.Enqueue(&patchOperation{OpType: OpDelete, EventInfo: model.EventInfo{Path: "/source/sub"}, Node: &tree.Node{Uuid: "u2", Path: "/source/sub"}})
		patch.Enqueue(&patchOperation{OpType: OpDelete, EventInfo: model.EventInfo{Path: "/source/sub/file1"}, Node: &tree.Node{Uuid: "u3", Path: "/source/sub/file1", Etag: "u3", Type: tree.NodeType_LEAF}})
		patch.Enqueue(&patchOperation{OpType: OpDelete, EventInfo: model.EventInfo{Path: "/source/sub/file2"}, Node: &tree.Node{Uuid: "u4", Path: "/source/sub/file2", Etag: "u4", Type: tree.NodeType_LEAF}})
		patch.Filter(ctx)
		So(patch.OperationsByType([]OperationType{OpMoveFolder}), ShouldHaveLength, 1)
		So(patch.OperationsByType([]OperationType{OpMoveFile}), ShouldHaveLength, 0)
	})

}

func TestScenariosFromSnapshot2(t *testing.T) {

	Convey("SNAP - Simple Move folder", t, func() {

		diff, e := diffFromSnaps("move-folder")
		So(e, ShouldBeNil)

		So(diff.missingRight, ShouldHaveLength, 15)
		So(diff.missingLeft, ShouldHaveLength, 15)

		b := newTreePatch(diff.left, diff.right.(model.PathSyncTarget), PatchOptions{MoveDetection: true})
		e = diff.ToUnidirectionalPatch(ctx, model.DirectionRight, b)
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

		b := newTreePatch(diff.left, diff.right.(model.PathSyncTarget), PatchOptions{MoveDetection: true})
		e = diff.ToUnidirectionalPatch(ctx, model.DirectionRight, b)
		So(e, ShouldBeNil)
		b.Filter(context.Background())
		So(b.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 0)
		So(b.OperationsByType([]OperationType{OpUpdateFile}), ShouldHaveLength, 1)

	})

	Convey("SNAP - Move Folder and Content Edit", t, func() {
		{
			diff, e := diffFromSnaps("move-update")
			So(e, ShouldBeNil)

			b := newTreePatch(diff.left, diff.right.(model.PathSyncTarget), PatchOptions{MoveDetection: true})
			e = diff.ToUnidirectionalPatch(ctx, model.DirectionRight, b)
			So(e, ShouldBeNil)
			b.Filter(context.Background())
			So(b.OperationsByType([]OperationType{OpMoveFolder}), ShouldHaveLength, 1)
			So(b.OperationsByType([]OperationType{OpMoveFile}), ShouldHaveLength, 0)
			So(b.OperationsByType([]OperationType{OpUpdateFile}), ShouldHaveLength, 1)
		}
		{
			diff, e := diffFromSnaps("move-update-2")
			So(e, ShouldBeNil)

			b := newTreePatch(diff.left, diff.right.(model.PathSyncTarget), PatchOptions{MoveDetection: true})
			e = diff.ToUnidirectionalPatch(ctx, model.DirectionRight, b)
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
		b := newTreePatch(diff.left, diff.right.(model.PathSyncTarget), PatchOptions{MoveDetection: true})
		e = diff.ToUnidirectionalPatch(ctx, model.DirectionRight, b)
		So(e, ShouldBeNil)

		b.Filter(context.Background())
		moves := b.OperationsByType([]OperationType{OpMoveFolder})
		So(moves, ShouldHaveLength, 4)
		// Flag operations as processed
		var i int
		b.WalkOperations([]OperationType{OpMoveFolder}, func(operation Operation) {
			if i == 0 {
				So(operation.(*patchOperation).Node.Path, ShouldEqual, "A1")
			} else if i == 1 {
				So(operation.(*patchOperation).Node.Path, ShouldEqual, "A2/B1")
			} else if i == 2 {
				So(operation.(*patchOperation).Node.Path, ShouldEqual, "A2/B2/C1")
			} else if i == 3 {
				So(operation.(*patchOperation).Node.Path, ShouldEqual, "A2/B2/C2/D1")
			}
			operation.SetProcessed()
			i++
		})
	})

	Convey("SNAP - Delete Inside Moved Folder", t, func() {

		diff, e := diffFromSnaps("move-delete")
		So(e, ShouldBeNil)
		patch := newTreePatch(diff.left, diff.right.(model.PathSyncTarget), PatchOptions{MoveDetection: true})
		e = diff.ToUnidirectionalPatch(ctx, model.DirectionRight, patch)
		So(e, ShouldBeNil)

		patch.Filter(context.Background())
		moves := patch.OperationsByType([]OperationType{OpMoveFolder})
		So(moves, ShouldHaveLength, 1)
		for _, m := range moves {
			m.SetProcessed()
		}
		deletes := patch.OperationsByType([]OperationType{OpDelete})
		So(deletes, ShouldHaveLength, 1)
		So(deletes[0].GetRefPath(), ShouldEqual, "RENAME/crash-updatecells.log")

	})

}

func TestManyDupsInMove(t *testing.T) {

	Convey("SNAP - Delete Inside Moved Folder", t, func() {

		diff, e := diffFromSnaps("many-dups")
		So(e, ShouldBeNil)
		patch := newTreePatch(diff.left, diff.right.(model.PathSyncTarget), PatchOptions{MoveDetection: true})
		e = diff.ToUnidirectionalPatch(ctx, model.DirectionRight, patch)
		So(e, ShouldBeNil)

		patch.Filter(context.Background())
		moves := patch.OperationsByType([]OperationType{OpMoveFolder})
		So(moves, ShouldHaveLength, 1)
		fMoves := patch.OperationsByType([]OperationType{OpMoveFile})
		So(fMoves, ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpCreateFolder}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 0)
	})

}

func TestFailingMove1(t *testing.T) {

	Convey("SNAP - Pydio Core folder moved inside folder", t, func() {

		diff, e := diffFromSnaps("move-pycore")
		So(e, ShouldBeNil)
		patch := newTreePatch(diff.left, diff.right.(model.PathSyncTarget), PatchOptions{MoveDetection: true})
		e = diff.ToUnidirectionalPatch(ctx, model.DirectionRight, patch)
		So(e, ShouldBeNil)

		patch.Filter(context.Background())
		moves := patch.OperationsByType([]OperationType{OpMoveFolder})
		So(moves, ShouldHaveLength, 1)
		fMoves := patch.OperationsByType([]OperationType{OpMoveFile})
		So(fMoves, ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpCreateFolder}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 0)
	})

}

func TestRescanFolders(t *testing.T) {
	Convey("Test untold events", t, func() {
		source, target := memory.NewMemDB(), memory.NewMemDB()
		_ = source.CreateNode(ctx, &tree.Node{Uuid: "u1", Path: "folder"}, false)
		_ = source.CreateNode(ctx, &tree.Node{Uuid: "u2", Path: "folder/subfolder"}, false)
		_ = source.CreateNode(ctx, &tree.Node{Uuid: "u3", Path: "folder/subfolder/sub"}, false)
		_ = source.CreateNode(ctx, &tree.Node{Uuid: "u4", Path: "folder/subfolder/sub/file1", Etag: "u3", Type: tree.NodeType_LEAF}, false)
		_ = source.CreateNode(ctx, &tree.Node{Uuid: "u5", Path: "folder/subfolder/sub/file2", Etag: "u4", Type: tree.NodeType_LEAF}, false)
		patch := newTreePatch(source, target, PatchOptions{})

		patch.Enqueue(&patchOperation{
			OpType: OpCreateFolder,
			Node:   &tree.Node{Uuid: "u1", Path: "folder"},
			patch:  patch,
			Dir:    OperationDirRight,
		})
		patch.rescanFoldersIfRequired(ctx)

		So(patch.OperationsByType([]OperationType{OpCreateFolder}), ShouldHaveLength, 3)
		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 2)
	})
}

func TestMisc(t *testing.T) {
	Convey("Test utils tools (errors, marshall, ignores)", t, func() {
		source, target := memory.NewMemDB(), memory.NewMemDB()
		target.AddIgnore(".ignored-file")
		patch := newTreePatch(source, target, PatchOptions{})
		patch.Enqueue(&patchOperation{
			OpType:          OpCreateFolder,
			Node:            &tree.Node{Uuid: "u1", Path: "folder"},
			patch:           patch,
			Dir:             OperationDirRight,
			processingError: fmt.Errorf("fake.error"),
		})

		// Test enqueue is properly ignored
		patch.Enqueue(&patchOperation{
			OpType:    OpCreateFile,
			EventInfo: model.EventInfo{Path: "/path/to/.ignored-file"},
			Node:      &tree.Node{Uuid: "u2", Path: "/path/to/.ignored-file"},
			patch:     patch,
			Dir:       OperationDirRight,
		})
		So(patch.Size(), ShouldEqual, 1)

		e, o := patch.HasErrors()
		So(o, ShouldBeTrue)
		So(e, ShouldHaveLength, 1)
		patch.CleanErrors()
		e, o = patch.HasErrors()
		So(o, ShouldBeFalse)
		So(e, ShouldHaveLength, 0)

		data, er := json.Marshal(patch)
		So(er, ShouldBeNil)
		So(len(data), ShouldBeGreaterThan, 0)
		var parsed map[string]interface{}
		er = json.Unmarshal(data, &parsed)
		So(parsed, ShouldContainKey, "Stats")
		So(parsed, ShouldContainKey, "Root")

		patch.SetError(fmt.Errorf("fake.patch.error"))
		e, o = patch.HasErrors()
		So(o, ShouldBeTrue)
		So(e, ShouldHaveLength, 1)
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
	diff := newTreeDiff(left, right)
	e = diff.Compute(ctx, "/", nil, nil)
	return diff, e
}
