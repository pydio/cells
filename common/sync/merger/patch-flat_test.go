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

	"github.com/pydio/cells/common/proto/tree"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/sync/endpoints"
	"github.com/pydio/cells/common/sync/model"
)

var (
	bTestCtx = context.Background()
)

func TestBatch_Filter(t *testing.T) {

	Convey("Test simple case", t, func() {

		patch := newFlatPatch(endpoints.NewMemDB(), endpoints.NewMemDB())
		patch.Filter(bTestCtx)
		So(patch, ShouldNotBeNil)

	})

	Convey("Ignore Create file if not existing in source", t, func() {

		source, target := endpoints.NewMemDB(), endpoints.NewMemDB()
		patch := newFlatPatch(source, target)
		patch.createFiles["/ignored-file"] = &Operation{
			EventInfo: model.EventInfo{
				Path: "/ignored-file",
			},
			Key:   "/ignored-file",
			Patch: patch,
		}
		patch.createFolders["/ignored-folder"] = &Operation{
			EventInfo: model.EventInfo{
				Path: "/ignored-folder",
			},
			Key:   "/ignored-folder",
			Patch: patch,
		}
		patch.Filter(bTestCtx)

		So(patch.createFiles, ShouldHaveLength, 0)
		So(patch.createFolders, ShouldHaveLength, 0)

	})

	Convey("Do not ignore create file if existing in source", t, func() {

		source, target := endpoints.NewMemDB(), endpoints.NewMemDB()
		patch := newFlatPatch(source, target)
		source.CreateNode(bTestCtx, &tree.Node{
			Path: "/ignored-file",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		patch.createFiles["/ignored-file"] = &Operation{
			EventInfo: model.EventInfo{
				Path: "/ignored-file",
			},
			Key:   "/ignored-file",
			Patch: patch,
		}
		patch.Filter(bTestCtx)

		So(patch.createFiles, ShouldHaveLength, 1)

	})

	Convey("Detect file move/rename", t, func() {

		source, target := endpoints.NewMemDB(), endpoints.NewMemDB()
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

		patch.createFiles["/a/file-moved"] = &Operation{
			EventInfo: model.EventInfo{
				Path: "/a/file-moved",
			},
			Key:   "/a/file-moved",
			Patch: patch,
		}
		patch.deletes["/file-to-move"] = &Operation{
			EventInfo: model.EventInfo{
				Path: "/file-to-move",
			},
			Key:   "/file-to-move",
			Patch: patch,
		}
		patch.Filter(bTestCtx)
		So(patch.createFiles, ShouldHaveLength, 0)
		So(patch.deletes, ShouldHaveLength, 0)
		So(patch.fileMoves, ShouldHaveLength, 1)

	})

	Convey("Detect multiple moves of nodes with same etags", t, func() {

		source, target := endpoints.NewMemDB(), endpoints.NewMemDB()
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

		patch.createFiles["/a/file-moved"] = &Operation{
			EventInfo: model.EventInfo{
				Path: "/a/file-moved",
			},
			Key:   "/a/file-moved",
			Patch: patch,
		}
		patch.deletes["/file-to-move"] = &Operation{
			EventInfo: model.EventInfo{
				Path: "/file-to-move",
			},
			Key:   "/file-to-move",
			Patch: patch,
		}
		patch.createFiles["/a/similar-file-moved"] = &Operation{
			EventInfo: model.EventInfo{
				Path: "/a/similar-file-moved",
			},
			Key:   "/a/similar-file-moved",
			Patch: patch,
		}
		patch.deletes["/similar-file"] = &Operation{
			EventInfo: model.EventInfo{
				Path: "/similar-file",
			},
			Key:   "/similar-file",
			Patch: patch,
		}
		patch.Filter(bTestCtx)

		So(patch.fileMoves, ShouldHaveLength, 2)
		So(patch.createFiles, ShouldHaveLength, 0)
		So(patch.deletes, ShouldHaveLength, 0)

	})

	Convey("Detect fast create/delete on same node and file does not exist at the end", t, func() {

		source, target := endpoints.NewMemDB(), endpoints.NewMemDB()
		patch := newFlatPatch(source, target)

		patch.createFiles["/a/file-touched"] = &Operation{
			EventInfo: model.EventInfo{
				Path: "/a/file-touched",
			},
			Key:   "/a/file-touched",
			Patch: patch,
		}
		patch.deletes["/a/file-touched"] = &Operation{
			EventInfo: model.EventInfo{
				Path: "/a/file-touched",
			},
			Key:   "/a/file-touched",
			Patch: patch,
		}
		patch.Filter(bTestCtx)
		So(patch.createFiles, ShouldHaveLength, 0)
		So(patch.deletes, ShouldHaveLength, 0)

	})

	Convey("Detect fast create/delete on same node and file does exist at the end", t, func() {

		source, target := endpoints.NewMemDB(), endpoints.NewMemDB()
		patch := newFlatPatch(source, target)

		source.CreateNode(bTestCtx, &tree.Node{
			Path: "/a/file-touched",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		patch.createFiles["/a/file-touched"] = &Operation{
			EventInfo: model.EventInfo{
				Path: "/a/file-touched",
			},
			Key:   "/a/file-touched",
			Patch: patch,
		}
		patch.deletes["/a/file-touched"] = &Operation{
			EventInfo: model.EventInfo{
				Path: "/a/file-touched",
			},
			Key:   "/a/file-touched",
			Patch: patch,
		}
		patch.Filter(bTestCtx)
		So(patch.createFiles, ShouldHaveLength, 1)
		So(patch.deletes, ShouldHaveLength, 0)

	})

	Convey("Filter pruned deletion", t, func() {

		source, target := endpoints.NewMemDB(), endpoints.NewMemDB()
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
		patch.deletes["/a"] = &Operation{EventInfo: model.EventInfo{Path: n1.Path}, Key: n1.Path, Node: n1, Patch: patch}
		patch.deletes["/a/subfile"] = &Operation{EventInfo: model.EventInfo{Path: n2.Path}, Key: n2.Path, Node: n2, Patch: patch}
		patch.deletes["/a-file-with-same-prefix"] = &Operation{EventInfo: model.EventInfo{Path: n3.Path}, Key: n3.Path, Node: n3, Patch: patch}

		patch.Filter(bTestCtx)
		So(patch.deletes, ShouldHaveLength, 2)

	})

}

func TestSortClosestMove(t *testing.T) {

	Convey("Test SortClosestMoves flat", t, func() {

		patch := newFlatPatch(endpoints.NewMemDB(), endpoints.NewMemDB())
		moves := patch.sortClosestMoves(bTestCtx, []*Move{
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/similar-file-moved"},
					Key:       "/similar-file-moved",
					Patch:     patch,
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
					Key:       "/file-to-move",
					Patch:     patch,
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/similar-file-moved"},
					Key:       "/similar-file-moved",
					Patch:     patch,
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/similar-file"},
					Key:       "/similar-file",
					Patch:     patch,
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-moved"},
					Key:       "/file-moved",
					Patch:     patch,
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
					Key:       "/file-to-move",
					Patch:     patch,
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-moved"},
					Key:       "/file-moved",
					Patch:     patch,
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/similar-file"},
					Key:       "/similar-file",
					Patch:     patch,
				},
			},
		})

		So(moves, ShouldHaveLength, 2)
	})

	Convey("Test SortClosestMoves deep", t, func() {

		patch := newFlatPatch(endpoints.NewMemDB(), endpoints.NewMemDB())
		moves := patch.sortClosestMoves(bTestCtx, []*Move{
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/similar-file-moved"},
					Key:       "/a/similar-file-moved",
					Patch:     patch,
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
					Key:       "/file-to-move",
					Patch:     patch,
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/similar-file-moved"},
					Key:       "/a/similar-file-moved",
					Patch:     patch,
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/similar-file"},
					Key:       "/a/similar-file",
					Patch:     patch,
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-moved"},
					Key:       "/file-moved",
					Patch:     patch,
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
					Key:       "/file-to-move",
					Patch:     patch,
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-moved"},
					Key:       "/file-moved",
					Patch:     patch,
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/similar-file"},
					Key:       "/a/similar-file",
					Patch:     patch,
				},
			},
		})

		So(moves, ShouldHaveLength, 2)
	})

	Convey("Test SortClosestMoves deeper", t, func() {

		patch := newFlatPatch(endpoints.NewMemDB(), endpoints.NewMemDB())
		moves := patch.sortClosestMoves(bTestCtx, []*Move{
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/b/c/similar-file-moved"},
					Key:       "/a/b/c/similar-file-moved",
					Patch:     patch,
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
					Key:       "/file-to-move",
					Patch:     patch,
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/b/c/similar-file-moved"},
					Key:       "/a/b/c/similar-file-moved",
					Patch:     patch,
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/similar-file"},
					Key:       "/a/similar-file",
					Patch:     patch,
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-moved"},
					Key:       "/file-moved",
					Patch:     patch,
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
					Key:       "/file-to-move",
					Patch:     patch,
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-moved"},
					Key:       "/file-moved",
					Patch:     patch,
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/similar-file"},
					Key:       "/a/similar-file",
					Patch:     patch,
				},
			},
		})

		So(moves, ShouldHaveLength, 2)
	})

	Convey("Test SortClosestMoves crossing", t, func() {

		patch := newFlatPatch(endpoints.NewMemDB(), endpoints.NewMemDB())
		moves := patch.sortClosestMoves(bTestCtx, []*Move{
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/similar-file-moved"},
					Key:       "/a/similar-file-moved",
					Patch:     patch,
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
					Key:       "/file-to-move",
					Patch:     patch,
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/similar-file-moved"},
					Key:       "/a/similar-file-moved",
					Patch:     patch,
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/similar-file"},
					Key:       "/similar-file",
					Patch:     patch,
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/file-moved"},
					Key:       "/a/file-moved",
					Patch:     patch,
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
					Key:       "/file-to-move",
					Patch:     patch,
				},
			},
			{
				createEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/a/file-moved"},
					Key:       "/a/file-moved",
					Patch:     patch,
				},
				deleteEvent: &Operation{
					EventInfo: model.EventInfo{Path: "/similar-file"},
					Key:       "/similar-file",
					Patch:     patch,
				},
			},
		})

		So(moves, ShouldHaveLength, 2)
	})

}

func diffFromSnaps(folder string) (*TreeDiff, error) {
	right := endpoints.NewMemDB()
	e := right.FromJSON("./testdata/" + folder + "/right.json")
	if e != nil {
		return nil, e
	}

	left := endpoints.NewMemDB()
	e = left.FromJSON("./testdata/" + folder + "/left.json")
	if e != nil {
		return nil, e
	}
	diff := newTreeDiff(testCtx, left, right)
	e = diff.Compute()
	return diff, e
}

func TestScenariosFromSnapshot(t *testing.T) {

	Convey("SNAP - Simple Move folder", t, func() {

		diff, e := diffFromSnaps("move-folder")
		So(e, ShouldBeNil)

		So(diff.missingRight, ShouldHaveLength, 15)
		So(diff.missingLeft, ShouldHaveLength, 15)

		b, e := diff.ToUnidirectionalPatch(model.DirectionRight)
		sb := b.(*FlatPatch)
		So(e, ShouldBeNil)
		b.Filter(context.Background())
		So(sb.folderMoves, ShouldHaveLength, 1)
		So(sb.fileMoves, ShouldHaveLength, 0)

	})

	Convey("SNAP - Content Edit", t, func() {

		diff, e := diffFromSnaps("update-content")
		So(e, ShouldBeNil)

		So(diff.missingRight, ShouldHaveLength, 0)
		So(diff.missingLeft, ShouldHaveLength, 0)
		So(diff.conflicts, ShouldHaveLength, 1)

		b, e := diff.ToUnidirectionalPatch(model.DirectionRight)
		sb := b.(*FlatPatch)
		So(e, ShouldBeNil)
		b.Filter(context.Background())
		So(sb.createFiles, ShouldHaveLength, 0)
		So(sb.updateFiles, ShouldHaveLength, 1)

	})

	Convey("SNAP - Move Folder and Content Edit", t, func() {
		{
			diff, e := diffFromSnaps("move-update")
			So(e, ShouldBeNil)

			b, e := diff.ToUnidirectionalPatch(model.DirectionRight)
			So(e, ShouldBeNil)
			b.Filter(context.Background())
			sb := b.(*FlatPatch)
			So(sb.folderMoves, ShouldHaveLength, 1)
			So(sb.fileMoves, ShouldHaveLength, 0)
			So(sb.updateFiles, ShouldHaveLength, 1)
		}
		{
			diff, e := diffFromSnaps("move-update-2")
			So(e, ShouldBeNil)

			b, e := diff.ToUnidirectionalPatch(model.DirectionRight)
			So(e, ShouldBeNil)
			b.Filter(context.Background())
			sb := b.(*FlatPatch)
			So(sb.folderMoves, ShouldHaveLength, 1)
			So(sb.fileMoves, ShouldHaveLength, 0)
			So(sb.updateFiles, ShouldHaveLength, 1)
		}

	})

	Convey("SNAP - Move Folder Inside Move Folder", t, func() {

		diff, e := diffFromSnaps("move-inside-move")
		So(e, ShouldBeNil)
		b, e := diff.ToUnidirectionalPatch(model.DirectionRight)
		So(e, ShouldBeNil)

		b.Filter(context.Background())
		sb := b.(*FlatPatch)
		So(sb.folderMoves, ShouldHaveLength, 4)
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
		sb := b.(*FlatPatch)
		So(sb.folderMoves, ShouldHaveLength, 1)
		So(sb.deletes, ShouldHaveLength, 1)
		So(sb.deletes["RENAME/crash-updatecells.log"], ShouldNotBeNil)

	})

}
