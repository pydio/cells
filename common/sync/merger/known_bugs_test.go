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
	"os"
	"strings"
	"testing"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/internal/timings"
	"github.com/pydio/cells/v5/common/sync/model"
)

// Tests in this file pin known bugs that are not fixed yet: they assert the expected behaviour
// and are skipped by default. Run them with SYNC_KNOWN_BUGS=1 to check they still detect the bug.
// When fixing a bug, remove the knownBug call of its test.
func knownBug(t *testing.T, id, summary string) {
	t.Helper()
	if os.Getenv("SYNC_KNOWN_BUGS") != "1" {
		t.Skipf("known bug %s: %s", id, summary)
	}
}

// opsByTypeAndPath indexes the operations of a patch as "Type path" strings.
func opsByTypeAndPath(p Patch) map[string]Operation {
	m := map[string]Operation{}
	for _, o := range p.OperationsByType(nil) {
		m[o.Type().String()+" "+strings.Trim(o.GetRefPath(), "/")] = o
	}
	return m
}

func bidiInputs() (left, right *TreePatch, lEP, rEP *memory.MemDB) {
	lEP, lSnap, rEP, rSnap := memory.NewMemDB(), memory.NewMemDB(), memory.NewMemDB(), memory.NewMemDB()
	left = newTreePatch(lEP, lSnap, PatchOptions{NoRescan: true})
	right = newTreePatch(rEP, rSnap, PatchOptions{NoRescan: true})
	return
}

func TestKnownBug_MoveOntoNewFileFromOtherSide(t *testing.T) {
	knownBug(t, "BUG-03", "a move onto a path created on the other side is not a conflict: the new file is overwritten")
	left, right, _, _ := bidiInputs()
	left.Enqueue(&patchOperation{OpType: OpMoveFile, Node: &tree.Node{Path: "/a", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "/X"}})
	right.Enqueue(&patchOperation{OpType: OpCreateFile, Node: &tree.Node{Path: "/X", Etag: "other", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "/X"}})
	bi, e := ComputeBidirectionalPatch(context.Background(), left, right)
	ops := opsByTypeAndPath(bi)
	_, hasMove := ops["MoveFile X"]
	_, hasCreate := ops["CreateFile X"]
	if e == nil && hasMove && hasCreate {
		t.Fatalf("move and create on the same path without conflict: %v", ops)
	}
}

func TestKnownBug_MoveAndEditVsEdit(t *testing.T) {
	knownBug(t, "BUG-04", "concurrent edits are not detected when one side also moved the file: one edit is lost")
	left, right, _, _ := bidiInputs()
	n := &tree.Node{Path: "a", Type: tree.NodeType_LEAF, Etag: "L"}
	left.Enqueue(&patchOperation{OpType: OpMoveFile, Node: n, EventInfo: model.EventInfo{Path: "b"}})
	left.Enqueue(&patchOperation{OpType: OpUpdateFile, Node: n, EventInfo: model.EventInfo{Path: "a"}})
	right.Enqueue(&patchOperation{OpType: OpUpdateFile, Node: &tree.Node{Path: "a", Type: tree.NodeType_LEAF, Etag: "R"}, EventInfo: model.EventInfo{Path: "a"}})
	bi, e := ComputeBidirectionalPatch(context.Background(), left, right)
	etags := map[string]bool{}
	for _, o := range bi.OperationsByType([]OperationType{OpUpdateFile}) {
		etags[o.GetNode().GetEtag()] = true
	}
	if e == nil && etags["L"] && etags["R"] {
		t.Fatalf("both edits are applied over each other without conflict")
	}
}

func TestKnownBug_FolderDeleteVsChildEdit(t *testing.T) {
	knownBug(t, "BUG-05", "a folder deleted on one side wins over a file edited inside it on the other side")
	left, right, _, _ := bidiInputs()
	left.Enqueue(&patchOperation{OpType: OpUpdateFile, Node: &tree.Node{Path: "/A/x", Type: tree.NodeType_LEAF, Etag: "new"}, EventInfo: model.EventInfo{Path: "/A/x"}})
	right.Enqueue(&patchOperation{OpType: OpDelete, Node: &tree.Node{Path: "/A", Type: tree.NodeType_COLLECTION}, EventInfo: model.EventInfo{Path: "/A"}})
	bi, e := ComputeBidirectionalPatch(context.Background(), left, right)
	ops := opsByTypeAndPath(bi)
	_, hasDelete := ops["Delete A"]
	if e == nil && hasDelete {
		t.Fatalf("folder A is deleted although a file was edited inside it: %v", ops)
	}
}

func TestKnownBug_SecondPassDropsConflictCopies(t *testing.T) {
	knownBug(t, "BUG-06", "when a second merge pass runs, the conflict copies created by the first pass are not synced")
	bg := context.Background()
	left, right, lEP, rEP := bidiInputs()
	_ = lEP.CreateNode(bg, &tree.Node{Path: "/a.txt", Type: tree.NodeType_LEAF, Etag: "L"}, true)
	_ = rEP.CreateNode(bg, &tree.Node{Path: "/a.txt", Type: tree.NodeType_LEAF, Etag: "R"}, true)
	_ = lEP.CreateNode(bg, &tree.Node{Path: "/z-moved", Type: tree.NodeType_LEAF, Etag: "Z"}, true)
	left.Enqueue(&patchOperation{OpType: OpUpdateFile, Node: &tree.Node{Path: "/a.txt", Etag: "L", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "/a.txt"}})
	right.Enqueue(&patchOperation{OpType: OpUpdateFile, Node: &tree.Node{Path: "/a.txt", Etag: "R", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "/a.txt"}})
	// A move/delete pair forcing a second pass (reSyncTarget)
	left.Enqueue(&patchOperation{OpType: OpMoveFile, Node: &tree.Node{Path: "/z", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "/z-moved"}})
	right.Enqueue(&patchOperation{OpType: OpDelete, Node: &tree.Node{Path: "/z", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "/z"}})
	bi, e := ComputeBidirectionalPatch(bg, left, right)
	if e != nil {
		t.Fatal(e)
	}
	var copies int
	for _, o := range bi.OperationsByType([]OperationType{OpCreateFile}) {
		if strings.HasPrefix(strings.Trim(o.GetRefPath(), "/"), "a-") {
			copies++
		}
	}
	if copies != 2 {
		t.Fatalf("expected both conflict copies of a.txt to be synced, got %d: %v", copies, opsByTypeAndPath(bi))
	}
}

func TestKnownBug_ValidateIsNoopForCachedTargets(t *testing.T) {
	knownBug(t, "BUG-14", "Validate skips processed operations, so it validates nothing on cached (remote/index) targets")
	defer timings.ForTests()()
	src, tgt := memory.NewMemDB(), memory.NewMemDBWithCacheTest()
	src.SetTestPathURI("src")
	tgt.SetTestPathURI("tgt")
	p := newTreePatch(src, tgt, PatchOptions{NoRescan: true})
	op := &patchOperation{OpType: OpCreateFile, Node: &tree.Node{Path: "missing.txt", Etag: "E", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "missing.txt"}}
	p.Enqueue(op)
	op.SetProcessed()
	if e := p.Validate(context.Background()); e == nil {
		t.Fatal("validation should fail: the created file is missing on the target")
	}
}

func TestKnownBug_MetadataOnBothSidesPanics(t *testing.T) {
	knownBug(t, "BUG-15", "the bidirectional merge has no solver for metadata operations: nil solver panic")
	defer func() {
		if r := recover(); r != nil {
			t.Fatalf("merge panicked: %v", r)
		}
	}()
	left, right, _, _ := bidiInputs()
	left.Enqueue(&patchOperation{OpType: OpUpdateMeta, Node: &tree.Node{Path: "/f/usermeta-tags", Type: NodeType_METADATA, Etag: "\"a\""}, EventInfo: model.EventInfo{Path: "/f/usermeta-tags"}})
	right.Enqueue(&patchOperation{OpType: OpUpdateMeta, Node: &tree.Node{Path: "/f/usermeta-tags", Type: NodeType_METADATA, Etag: "\"b\""}, EventInfo: model.EventInfo{Path: "/f/usermeta-tags"}})
	_, _ = ComputeBidirectionalPatch(context.Background(), left, right)
}

func TestKnownBug_UnloadableCreateDropsDelete(t *testing.T) {
	knownBug(t, "BUG-16", "a create that cannot be loaded also removes the delete of the same path")
	bg := context.Background()
	src, tgt := memory.NewMemDB(), memory.NewMemDB()
	_ = tgt.CreateNode(bg, &tree.Node{Path: "/a", Uuid: "U", Etag: "E", Type: tree.NodeType_LEAF}, true)
	p := newTreePatch(src, tgt, PatchOptions{MoveDetection: true, NoRescan: true})
	p.Enqueue(&patchOperation{OpType: OpDelete, EventInfo: model.EventInfo{Path: "/a"}})
	p.Enqueue(&patchOperation{OpType: OpCreateFile, EventInfo: model.EventInfo{Path: "/a"}})
	p.Filter(bg)
	if _, ok := opsByTypeAndPath(p)["Delete a"]; !ok {
		t.Fatalf("expected Delete a, got %v", opsByTypeAndPath(p))
	}
}

func TestKnownBug_RescanDuplicatesDetectedMove(t *testing.T) {
	knownBug(t, "BUG-17", "the folder rescan re-adds a create for a file already detected as moved into the new folder")
	bg := context.Background()
	src, tgt := memory.NewMemDB(), memory.NewMemDB()
	_ = tgt.CreateNode(bg, &tree.Node{Path: "y", Uuid: "UY", Etag: "E", Type: tree.NodeType_LEAF}, true)
	_ = src.CreateNode(bg, &tree.Node{Path: "F", Uuid: "UF", Type: tree.NodeType_COLLECTION}, true)
	_ = src.CreateNode(bg, &tree.Node{Path: "F/y", Uuid: "UY", Etag: "E", Type: tree.NodeType_LEAF}, true)
	p := newTreePatch(src, tgt, PatchOptions{MoveDetection: true})
	p.Enqueue(&patchOperation{OpType: OpCreateFolder, EventInfo: model.EventInfo{Path: "F"}})
	p.Enqueue(&patchOperation{OpType: OpDelete, EventInfo: model.EventInfo{Path: "y"}})
	p.Enqueue(&patchOperation{OpType: OpCreateFile, EventInfo: model.EventInfo{Path: "F/y"}})
	p.Filter(bg)
	ops := opsByTypeAndPath(p)
	if _, ok := ops["CreateFile F/y"]; ok {
		t.Fatalf("F/y is both moved and created: %v", ops)
	}
}
