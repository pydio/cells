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
	ctx = context.Background()
)

func TestTreePatch_Filter(t *testing.T) {

	Convey("Test simple case", t, func() {

		patch := newTreePatch(memory.NewMemDB(), memory.NewMemDB())
		patch.Filter(ctx)
		So(patch, ShouldNotBeNil)

	})

	Convey("Ignore Create file if not existing in source", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newTreePatch(source, target)
		patch.Enqueue(&Operation{
			Type: OpCreateFile,
			EventInfo: model.EventInfo{
				Path: "/ignored-file",
			},
			Key:   "/ignored-file",
			Patch: patch,
		})
		patch.Enqueue(&Operation{
			Type: OpCreateFolder,
			EventInfo: model.EventInfo{
				Path: "/ignored-folder",
			},
			Key:   "/ignored-folder",
			Patch: patch,
		})
		patch.Filter(ctx)

		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpCreateFolder}), ShouldHaveLength, 0)

	})

	Convey("Do not ignore create file if existing in source", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newTreePatch(source, target)
		source.CreateNode(ctx, &tree.Node{
			Path: "/ignored-file",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		patch.Enqueue(&Operation{
			Type: OpCreateFile,
			EventInfo: model.EventInfo{
				Path: "/ignored-file",
			},
			Key:   "/ignored-file",
			Patch: patch,
		})
		patch.Filter(ctx)

		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 1)

	})

	Convey("Detect file move/rename", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newTreePatch(source, target)

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

		patch.Enqueue(&Operation{
			Type: OpCreateFile,
			EventInfo: model.EventInfo{
				Path: "/a/file-moved",
			},
			Key:   "/a/file-moved",
			Patch: patch,
		})
		patch.Enqueue(&Operation{
			Type: OpDelete,
			EventInfo: model.EventInfo{
				Path: "/file-to-move",
			},
			Key:   "/file-to-move",
			Patch: patch,
		})
		patch.Filter(ctx)
		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpMoveFile}), ShouldHaveLength, 1)

	})

	Convey("Detect multiple moves of nodes with same etags", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newTreePatch(source, target)
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

		patch.Enqueue(&Operation{
			Type: OpCreateFile,
			EventInfo: model.EventInfo{
				Path: "/a/file-moved",
			},
			Key:   "/a/file-moved",
			Patch: patch,
		})
		patch.Enqueue(&Operation{
			Type: OpDelete,
			EventInfo: model.EventInfo{
				Path: "/file-to-move",
			},
			Key:   "/file-to-move",
			Patch: patch,
		})
		patch.Enqueue(&Operation{
			Type: OpCreateFile,
			EventInfo: model.EventInfo{
				Path: "/a/similar-file-moved",
			},
			Key:   "/a/similar-file-moved",
			Patch: patch,
		})
		patch.Enqueue(&Operation{
			Type: OpDelete,
			EventInfo: model.EventInfo{
				Path: "/similar-file",
			},
			Key:   "/similar-file",
			Patch: patch,
		})
		patch.Filter(ctx)

		So(patch.OperationsByType([]OperationType{OpMoveFile}), ShouldHaveLength, 2)
		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 0)

	})

	Convey("Detect fast create/delete on same node and file does not exist at the end", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newTreePatch(source, target)

		patch.Enqueue(&Operation{
			Type: OpCreateFile,
			EventInfo: model.EventInfo{
				Path: "/a/file-touched",
			},
			Key:   "/a/file-touched",
			Patch: patch,
		})
		patch.Enqueue(&Operation{
			Type: OpDelete,
			EventInfo: model.EventInfo{
				Path: "/a/file-touched",
			},
			Key:   "/a/file-touched",
			Patch: patch,
		})
		patch.Filter(ctx)
		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 0)
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 0)

	})

	Convey("Detect fast create/delete on same node and file does exist at the end", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newTreePatch(source, target)

		source.CreateNode(ctx, &tree.Node{
			Path: "/a/file-touched",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		patch.Enqueue(&Operation{
			Type: OpCreateFile,
			EventInfo: model.EventInfo{
				Path: "/a/file-touched",
			},
			Key:   "/a/file-touched",
			Patch: patch,
		})
		patch.Enqueue(&Operation{
			Type: OpDelete,
			EventInfo: model.EventInfo{
				Path: "/a/file-touched",
			},
			Key:   "/a/file-touched",
			Patch: patch,
		})
		patch.Filter(ctx)
		So(patch.OperationsByType([]OperationType{OpCreateFile}), ShouldHaveLength, 1)
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 0)

	})

	Convey("Filter pruned deletion", t, func() {

		source, target := memory.NewMemDB(), memory.NewMemDB()
		patch := newTreePatch(source, target)
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
		patch.Enqueue(&Operation{Type: OpDelete, EventInfo: model.EventInfo{Path: n1.Path}, Key: n1.Path, Node: n1, Patch: patch})
		patch.Enqueue(&Operation{Type: OpDelete, EventInfo: model.EventInfo{Path: n2.Path}, Key: n2.Path, Node: n2, Patch: patch})
		patch.Enqueue(&Operation{Type: OpDelete, EventInfo: model.EventInfo{Path: n3.Path}, Key: n3.Path, Node: n3, Patch: patch})

		patch.Filter(ctx)
		So(patch.OperationsByType([]OperationType{OpDelete}), ShouldHaveLength, 2)

	})

}

func TestPrunedMove(t *testing.T) {

	Convey("Filter pruned move", t, func() {
		source, target := memory.NewMemDB(), memory.NewMemDB()
		source.CreateNode(bTestCtx, &tree.Node{Uuid: "u1", Path: "/target"}, false)
		source.CreateNode(bTestCtx, &tree.Node{Uuid: "u2", Path: "/target/sub"}, false)
		source.CreateNode(bTestCtx, &tree.Node{Uuid: "u3", Path: "/target/sub/file1", Etag: "u3", Type: tree.NodeType_LEAF}, false)
		source.CreateNode(bTestCtx, &tree.Node{Uuid: "u4", Path: "/target/sub/file2", Etag: "u4", Type: tree.NodeType_LEAF}, false)
		patch := newTreePatch(source, target)
		patch.Enqueue(&Operation{Type: OpCreateFolder, EventInfo: model.EventInfo{Path: "/target"}, Key: "/target", Node: &tree.Node{Uuid: "u1", Path: "/target"}, Patch: patch})
		patch.Enqueue(&Operation{Type: OpCreateFolder, EventInfo: model.EventInfo{Path: "/target/sub"}, Key: "/target/sub", Node: &tree.Node{Uuid: "u2", Path: "/target/sub"}, Patch: patch})
		patch.Enqueue(&Operation{Type: OpCreateFile, EventInfo: model.EventInfo{Path: "/target/sub/file1"}, Key: "/target/sub/file1", Node: &tree.Node{Uuid: "u3", Path: "/target/sub/file1", Etag: "u3", Type: tree.NodeType_LEAF}, Patch: patch})
		patch.Enqueue(&Operation{Type: OpCreateFile, EventInfo: model.EventInfo{Path: "/target/sub/file2"}, Key: "/target/sub/file2", Node: &tree.Node{Uuid: "u4", Path: "/target/sub/file2", Etag: "u4", Type: tree.NodeType_LEAF}, Patch: patch})
		patch.Enqueue(&Operation{Type: OpDelete, EventInfo: model.EventInfo{Path: "/source"}, Key: "/source", Node: &tree.Node{Uuid: "u1", Path: "/source"}, Patch: patch})
		patch.Enqueue(&Operation{Type: OpDelete, EventInfo: model.EventInfo{Path: "/source/sub"}, Key: "/source/sub", Node: &tree.Node{Uuid: "u2", Path: "/source/sub"}, Patch: patch})
		patch.Enqueue(&Operation{Type: OpDelete, EventInfo: model.EventInfo{Path: "/source/sub/file1"}, Key: "/source/sub/file1", Node: &tree.Node{Uuid: "u3", Path: "/source/sub/file1", Etag: "u3", Type: tree.NodeType_LEAF}, Patch: patch})
		patch.Enqueue(&Operation{Type: OpDelete, EventInfo: model.EventInfo{Path: "/source/sub/file2"}, Key: "/source/sub/file2", Node: &tree.Node{Uuid: "u4", Path: "/source/sub/file2", Etag: "u4", Type: tree.NodeType_LEAF}, Patch: patch})
		patch.Filter(bTestCtx)
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
		sb := b.(*FlatPatch)
		So(sb.folderMoves["A2"].Node.Path, ShouldEqual, "A1")
		So(sb.folderMoves["A2/B2"].Node.Path, ShouldEqual, "A2/B1")
		So(sb.folderMoves["A2/B2/C2"].Node.Path, ShouldEqual, "A2/B2/C1")
		So(sb.folderMoves["A2/B2/C2/D2"].Node.Path, ShouldEqual, "A2/B2/C2/D1")

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
		So(deletes[0].Key, ShouldEqual, "RENAME/crash-updatecells.log")

	})

}
