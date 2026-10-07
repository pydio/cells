/*
 * Copyright (c) 2026. Abstrium SAS <team (at) pydio.com>
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
	"sort"
	"testing"

	"github.com/gobwas/glob"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/model"
)

// Metadata operations for nodes missing on one side of a unidirectional sync.

var testMetaGlobs = []glob.Glob{glob.MustCompile("usermeta-*")}

type metaFixtureNode struct {
	path, uuid, etag string
	folder           bool
	meta             map[string]string
}

func memWith(nodes ...metaFixtureNode) *memory.MemDB {
	db := memory.NewMemDB()
	for _, n := range nodes {
		tn := &tree.Node{Path: n.path, Uuid: n.uuid, Etag: n.etag, Type: tree.NodeType_LEAF, MetaStore: map[string]string{}}
		if n.folder {
			tn.Type = tree.NodeType_COLLECTION
			tn.Etag = "-1"
		}
		for k, v := range n.meta {
			tn.MetaStore[k] = v
		}
		_ = db.CreateNode(testCtx, tn, true)
	}
	return db
}

// metaPatch computes a filtered unidirectional patch and lists its operations
// as "Type path", sorted.
func metaPatch(t *testing.T, left, right *memory.MemDB, dir model.DirectionType, globs []glob.Glob) []string {
	t.Helper()
	diff := NewTreeDiff(left, right)
	diff.includeMetas = globs
	So(diff.Compute(testCtx, "", nil, nil), ShouldBeNil)
	src, tgt := model.PathSyncSource(left), model.PathSyncTarget(right)
	if dir == model.DirectionLeft {
		src, tgt = right, left
	}
	p := newTreePatch(src, tgt, PatchOptions{MoveDetection: true})
	So(diff.ToUnidirectionalPatch(testCtx, dir, p), ShouldBeNil)
	p.Filter(testCtx)
	var ops []string
	p.WalkOperations([]OperationType{}, func(o Operation) {
		ops = append(ops, o.Type().String()+" "+o.GetRefPath())
	})
	sort.Strings(ops)
	return ops
}

func TestMissingNodesMetadata(t *testing.T) {

	Convey("A new file on the source gets its metadata created", t, func() {
		left := memWith(
			metaFixtureNode{path: "a", uuid: "fa", folder: true},
			metaFixtureNode{path: "a/f", uuid: "f1", etag: "h1", meta: map[string]string{"usermeta-x": `"1"`, "other": `"o"`}},
		)
		right := memWith(metaFixtureNode{path: "a", uuid: "fa", folder: true})
		So(metaPatch(t, left, right, model.DirectionRight, testMetaGlobs), ShouldResemble, []string{
			"CreateFile a/f",
			"CreateMetadata a/f/usermeta-x",
		})
	})

	Convey("A new folder and its new files get their metadata created", t, func() {
		left := memWith(
			metaFixtureNode{path: "a", uuid: "fa", folder: true, meta: map[string]string{"usermeta-x": `"d"`}},
			metaFixtureNode{path: "a/f", uuid: "f1", etag: "h1", meta: map[string]string{"usermeta-x": `"1"`}},
		)
		right := memWith()
		So(metaPatch(t, left, right, model.DirectionRight, testMetaGlobs), ShouldResemble, []string{
			"CreateFile a/f",
			"CreateFolder a",
			"CreateMetadata a/f/usermeta-x",
			"CreateMetadata a/usermeta-x",
		})
	})

	Convey("A file only on the target is deleted without separate metadata deletes", t, func() {
		left := memWith(metaFixtureNode{path: "a", uuid: "fa", folder: true})
		right := memWith(
			metaFixtureNode{path: "a", uuid: "fa", folder: true},
			metaFixtureNode{path: "a/f", uuid: "f1", etag: "h1", meta: map[string]string{"usermeta-x": `"1"`}},
		)
		So(metaPatch(t, left, right, model.DirectionRight, testMetaGlobs), ShouldResemble, []string{
			"Delete a/f",
		})
	})

	Convey("A folder only on the target is deleted without separate metadata deletes", t, func() {
		left := memWith()
		right := memWith(
			metaFixtureNode{path: "a", uuid: "fa", folder: true, meta: map[string]string{"usermeta-x": `"d"`}},
			metaFixtureNode{path: "a/f", uuid: "f1", etag: "h1", meta: map[string]string{"usermeta-x": `"1"`}},
		)
		So(metaPatch(t, left, right, model.DirectionRight, testMetaGlobs), ShouldResemble, []string{
			"Delete a",
		})
	})

	Convey("A moved file does not delete metadata at its old path", t, func() {
		left := memWith(
			metaFixtureNode{path: "a", uuid: "fa", folder: true},
			metaFixtureNode{path: "a/g", uuid: "f1", etag: "h1", meta: map[string]string{"usermeta-x": `"1"`}},
		)
		right := memWith(
			metaFixtureNode{path: "a", uuid: "fa", folder: true},
			metaFixtureNode{path: "a/f", uuid: "f1", etag: "h1", meta: map[string]string{"usermeta-x": `"1"`}},
		)
		// Metadata follow the moved node; re-creating them at the new path is
		// redundant but harmless (same values).
		So(metaPatch(t, left, right, model.DirectionRight, testMetaGlobs), ShouldResemble, []string{
			"CreateMetadata a/g/usermeta-x",
			"MoveFile a/g",
		})
	})

	Convey("A moved folder does not delete metadata at its old path", t, func() {
		left := memWith(
			metaFixtureNode{path: "b", uuid: "fa", folder: true, meta: map[string]string{"usermeta-x": `"d"`}},
			metaFixtureNode{path: "b/f", uuid: "f1", etag: "h1", meta: map[string]string{"usermeta-x": `"1"`}},
		)
		right := memWith(
			metaFixtureNode{path: "a", uuid: "fa", folder: true, meta: map[string]string{"usermeta-x": `"d"`}},
			metaFixtureNode{path: "a/f", uuid: "f1", etag: "h1", meta: map[string]string{"usermeta-x": `"1"`}},
		)
		// Before the fix, this also produced "DeleteMetadata a/usermeta-x", run
		// after the move against a path that no longer exists.
		So(metaPatch(t, left, right, model.DirectionRight, testMetaGlobs), ShouldResemble, []string{
			"CreateMetadata b/f/usermeta-x",
			"CreateMetadata b/usermeta-x",
			"MoveFolder b",
		})
	})

	Convey("The left direction is symmetric", t, func() {
		left := memWith(metaFixtureNode{path: "a", uuid: "fa", folder: true})
		right := memWith(
			metaFixtureNode{path: "a", uuid: "fa", folder: true},
			metaFixtureNode{path: "a/f", uuid: "f1", etag: "h1", meta: map[string]string{"usermeta-x": `"1"`}},
		)
		So(metaPatch(t, left, right, model.DirectionLeft, testMetaGlobs), ShouldResemble, []string{
			"CreateFile a/f",
			"CreateMetadata a/f/usermeta-x",
		})
	})

	Convey("Without metadata globs nothing changes", t, func() {
		left := memWith(
			metaFixtureNode{path: "a", uuid: "fa", folder: true},
			metaFixtureNode{path: "a/f", uuid: "f1", etag: "h1", meta: map[string]string{"usermeta-x": `"1"`}},
		)
		right := memWith(
			metaFixtureNode{path: "a", uuid: "fa", folder: true},
			metaFixtureNode{path: "a/old", uuid: "f2", etag: "h2", meta: map[string]string{"usermeta-x": `"2"`}},
		)
		So(metaPatch(t, left, right, model.DirectionRight, nil), ShouldResemble, []string{
			"CreateFile a/f",
			"Delete a/old",
		})
	})
}
