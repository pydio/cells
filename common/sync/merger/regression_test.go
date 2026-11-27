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
	"reflect"
	"strings"
	"testing"
	"time"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/model"
)

// Tests in this file pin bugs that were fixed (formerly in known_bugs_test.go).

func TestMoveDetectionDoesNotReuseCreate(t *testing.T) {
	for i := 0; i < 50; i++ {
		src, tgt := memory.NewMemDB(), memory.NewMemDB()
		bg := context.Background()
		_ = tgt.CreateNode(bg, &tree.Node{Path: "/a.txt", Uuid: "U1", Etag: "E", Type: tree.NodeType_LEAF}, true)
		_ = tgt.CreateNode(bg, &tree.Node{Path: "/b.txt", Uuid: "U2", Etag: "E", Type: tree.NodeType_LEAF}, true)
		_ = src.CreateNode(bg, &tree.Node{Path: "/c.txt", Uuid: "U1", Etag: "E", Type: tree.NodeType_LEAF}, true)
		p := newTreePatch(src, tgt, PatchOptions{MoveDetection: true, NoRescan: true})
		p.Enqueue(&patchOperation{OpType: OpDelete, EventInfo: model.EventInfo{Path: "/a.txt"}})
		p.Enqueue(&patchOperation{OpType: OpDelete, EventInfo: model.EventInfo{Path: "/b.txt"}})
		p.Enqueue(&patchOperation{OpType: OpCreateFile, EventInfo: model.EventInfo{Path: "/c.txt"}})
		p.Filter(bg)
		ops := opsByTypeAndPath(p)
		moves := len(p.OperationsByType([]OperationType{OpMoveFile}))
		if _, ok := ops["MoveFile c.txt"]; !ok || moves != 1 {
			t.Fatalf("iteration %d: expected exactly one move to c.txt, got %d moves: %v", i, moves, ops)
		}
		if _, ok := ops["Delete b.txt"]; !ok {
			t.Fatalf("iteration %d: expected Delete b.txt, got %v", i, ops)
		}
	}
}

func TestDivergingMovesLoadTargetsFromEndpoints(t *testing.T) {
	bg := context.Background()
	lEP, lSnap, rEP, rSnap := memory.NewMemDB(), memory.NewMemDB(), memory.NewMemDB(), memory.NewMemDB()
	now := time.Now().Unix()
	_ = lEP.CreateNode(bg, &tree.Node{Path: "/x-left", Type: tree.NodeType_LEAF, MTime: now}, true)
	_ = rEP.CreateNode(bg, &tree.Node{Path: "/x-right", Type: tree.NodeType_LEAF, MTime: now - 10}, true)
	_ = lSnap.CreateNode(bg, &tree.Node{Path: "/x", Type: tree.NodeType_LEAF}, true)
	_ = rSnap.CreateNode(bg, &tree.Node{Path: "/x", Type: tree.NodeType_LEAF}, true)
	left := newTreePatch(lEP, lSnap, PatchOptions{NoRescan: true})
	right := newTreePatch(rEP, rSnap, PatchOptions{NoRescan: true})
	left.Enqueue(&patchOperation{OpType: OpMoveFile, Node: &tree.Node{Path: "/x"}, EventInfo: model.EventInfo{Path: "/x-left"}})
	right.Enqueue(&patchOperation{OpType: OpMoveFile, Node: &tree.Node{Path: "/x"}, EventInfo: model.EventInfo{Path: "/x-right"}})
	bi, e := ComputeBidirectionalPatch(bg, left, right)
	if e != nil {
		t.Fatalf("diverging moves should be resolved, got error: %v", e)
	}
	if len(bi.OperationsByType([]OperationType{OpMoveFile})) != 1 {
		t.Fatalf("expected one surviving move, got %v", opsByTypeAndPath(bi))
	}
}

func TestPruneKeepsMoveOutOfDeletedFolder(t *testing.T) {
	bg := context.Background()
	src, tgt := memory.NewMemDB(), memory.NewMemDB()
	_ = tgt.CreateNode(bg, &tree.Node{Path: "/A", Uuid: "UA", Type: tree.NodeType_COLLECTION}, true)
	_ = tgt.CreateNode(bg, &tree.Node{Path: "/A/x", Uuid: "UX", Etag: "E", Type: tree.NodeType_LEAF}, true)
	_ = src.CreateNode(bg, &tree.Node{Path: "/C", Uuid: "UC", Type: tree.NodeType_COLLECTION}, true)
	_ = src.CreateNode(bg, &tree.Node{Path: "/C/x", Uuid: "UX", Etag: "E", Type: tree.NodeType_LEAF}, true)
	p := newTreePatch(src, tgt, PatchOptions{MoveDetection: true, NoRescan: true})
	p.Enqueue(&patchOperation{OpType: OpDelete, EventInfo: model.EventInfo{Path: "/A/x"}})
	p.Enqueue(&patchOperation{OpType: OpDelete, EventInfo: model.EventInfo{Path: "/A"}})
	p.Enqueue(&patchOperation{OpType: OpCreateFile, EventInfo: model.EventInfo{Path: "/C/x"}})
	p.Filter(bg)
	ops := opsByTypeAndPath(p)
	if _, ok := ops["MoveFile C/x"]; !ok {
		t.Fatalf("expected the move to C/x to be kept, got %v", ops)
	}
	if _, ok := ops["Delete A"]; !ok || len(ops) != 2 {
		t.Fatalf("expected the move and the delete of A only, got %v", ops)
	}
}

func TestMergeMetadataOperations(t *testing.T) {
	meta := func(op OperationType, value string) *patchOperation {
		return &patchOperation{OpType: op, Node: &tree.Node{Path: "/f/usermeta-tags", Type: NodeType_METADATA, Etag: value}, EventInfo: model.EventInfo{Path: "/f/usermeta-tags"}}
	}
	for _, tc := range []struct {
		name        string
		left, right *patchOperation
		want        []string // "Type Direction Value"
	}{
		{"left only", meta(OpUpdateMeta, `"a"`), nil, []string{"UpdateMetadata right \"a\""}},
		{"right only", nil, meta(OpCreateMeta, `"b"`), []string{"CreateMetadata left \"b\""}},
		{"same value", meta(OpUpdateMeta, `"a"`), meta(OpUpdateMeta, `"a"`), nil},
		{"different values: right wins", meta(OpUpdateMeta, `"a"`), meta(OpUpdateMeta, `"b"`), []string{"UpdateMetadata left \"b\""}},
		{"created on both sides: right wins", meta(OpCreateMeta, `"a"`), meta(OpCreateMeta, `"b"`), []string{"CreateMetadata left \"b\""}},
		{"deleted left, updated right: value kept", meta(OpDeleteMeta, ""), meta(OpUpdateMeta, `"b"`), []string{"UpdateMetadata left \"b\""}},
		{"updated left, deleted right: value kept", meta(OpUpdateMeta, `"a"`), meta(OpDeleteMeta, ""), []string{"UpdateMetadata right \"a\""}},
		{"deleted on both sides", meta(OpDeleteMeta, ""), meta(OpDeleteMeta, ""), nil},
	} {
		t.Run(tc.name, func(t *testing.T) {
			left, right, _, _ := bidiInputs()
			if tc.left != nil {
				left.Enqueue(tc.left)
			}
			if tc.right != nil {
				right.Enqueue(tc.right)
			}
			var bi *BidirectionalPatch
			var e error
			func() {
				defer func() {
					if r := recover(); r != nil {
						t.Fatalf("merge panicked: %v", r)
					}
				}()
				bi, e = ComputeBidirectionalPatch(context.Background(), left, right)
			}()
			if e != nil {
				t.Fatal(e)
			}
			var got []string
			for _, op := range bi.OperationsByType(nil) {
				dir := "right"
				if op.(*patchOperation).Dir == OperationDirLeft {
					dir = "left"
				}
				got = append(got, op.Type().String()+" "+dir+" "+op.GetNode().GetEtag())
			}
			if strings.Join(got, ",") != strings.Join(tc.want, ",") {
				t.Fatalf("got %v, want %v", got, tc.want)
			}
		})
	}
}

func TestUnloadableCreateKeepsDelete(t *testing.T) {
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

// A file created then deleted in the same batch, never synced to the target: both operations are dropped.
func TestCreatedThenDeletedNodeIgnored(t *testing.T) {
	bg := context.Background()
	src, tgt := memory.NewMemDB(), memory.NewMemDB()
	for _, typ := range []tree.NodeType{tree.NodeType_LEAF, tree.NodeType_COLLECTION} {
		p := newTreePatch(src, tgt, PatchOptions{MoveDetection: true, NoRescan: true})
		p.Enqueue(&patchOperation{OpType: OpDelete, EventInfo: model.EventInfo{Path: "/tmp"}})
		if typ == tree.NodeType_LEAF {
			p.Enqueue(&patchOperation{OpType: OpCreateFile, EventInfo: model.EventInfo{Path: "/tmp"}})
		} else {
			p.Enqueue(&patchOperation{OpType: OpCreateFolder, EventInfo: model.EventInfo{Path: "/tmp"}, Node: &tree.Node{Path: "/tmp", Type: typ}})
		}
		p.Filter(bg)
		if ops := opsByTypeAndPath(p); len(ops) != 0 {
			t.Fatalf("%v: expected no operation, got %v", typ, ops)
		}
	}
}

// BUG-40: the merge must not depend on which side an operation comes from. A local edit (or create) wins over a
// delete on the other side, whatever the side.
func TestMergeEditVsDeleteBothOrientations(t *testing.T) {
	mk := func(o OperationType) *patchOperation {
		n := &tree.Node{Path: "/x", Type: tree.NodeType_LEAF, Etag: "e"}
		if o == OpCreateFolder {
			n.Type = tree.NodeType_COLLECTION
		}
		return &patchOperation{OpType: o, Node: n, EventInfo: model.EventInfo{Path: "/x"}}
	}
	for _, kept := range []OperationType{OpUpdateFile, OpCreateFile, OpCreateFolder} {
		for _, keptOnLeft := range []bool{true, false} {
			left, right, _, _ := bidiInputs()
			want := kept.String() + " right"
			if keptOnLeft {
				left.Enqueue(mk(kept))
				right.Enqueue(mk(OpDelete))
			} else {
				left.Enqueue(mk(OpDelete))
				right.Enqueue(mk(kept))
				want = kept.String() + " left"
			}
			bi, e := ComputeBidirectionalPatch(context.Background(), left, right)
			if e != nil {
				t.Fatal(e)
			}
			var got []string
			for _, op := range bi.OperationsByType(nil) {
				dir := "right"
				if op.(*patchOperation).Dir == OperationDirLeft {
					dir = "left"
				}
				got = append(got, op.Type().String()+" "+dir)
			}
			if strings.Join(got, ",") != want {
				t.Errorf("%v on left: %v, delete on the other side: got %v, want %v", keptOnLeft, kept, got, want)
			}
		}
	}
}

// The merge matrix must be explicit and mirror-symmetric: the solver for (b, a) is the solver for (a, b) with
// enqueueLeft and enqueueRight swapped.
func TestMergeMatrixIsSymmetric(t *testing.T) {
	p := NewBidirectionalPatch(context.Background(), memory.NewMemDB(), memory.NewMemDB())
	ptr := func(s Solver) uintptr {
		if s == nil {
			return 0
		}
		return reflect.ValueOf(s).Pointer()
	}
	eql, eqr := ptr(p.enqueueLeft), ptr(p.enqueueRight)
	mirror := func(v uintptr) uintptr {
		switch v {
		case eql:
			return eqr
		case eqr:
			return eql
		}
		return v
	}
	files := []OperationType{OpNone, OpCreateFolder, OpMoveFile, OpMoveFolder, OpDelete, OpCreateFile, OpUpdateFile, OpMoveTarget}
	metas := []OperationType{OpNone, OpCreateMeta, OpUpdateMeta, OpDeleteMeta}
	for _, group := range [][]OperationType{files, metas} {
		for _, a := range group {
			for _, b := range group {
				ab, ba := ptr(p.matrix[a][b]), ptr(p.matrix[b][a])
				if ab == 0 {
					t.Errorf("no solver for %v x %v", a, b)
				} else if ab != mirror(ba) {
					t.Errorf("solver for %v x %v is not the mirror of %v x %v", a, b, b, a)
				}
			}
		}
	}
}

// BUG-05: a folder deleted on one side while files were created or edited inside it on the other side. The delete
// must not win (seen live: a file added on the server was permanently deleted). The folder is re-created on the
// deleting side with the surviving content.
func TestFolderDeleteVsChildChanges(t *testing.T) {
	ctx := context.Background()
	for _, tc := range []struct {
		name    string
		childOp OperationType
		child   string
	}{
		{"edited file", OpUpdateFile, "A/x"},
		{"created file", OpCreateFile, "A/new"},
		{"created folder", OpCreateFolder, "A/sub"},
	} {
		for _, deleteOnLeft := range []bool{false, true} {
			name := tc.name
			if deleteOnLeft {
				name += ", deleted on left"
			}
			t.Run(name, func(t *testing.T) {
				left, right, lEP, rEP := bidiInputs()
				keptPatch, keptEP, deletingPatch, deletingEP := left, lEP, right, model.PathSyncTarget(rEP)
				if deleteOnLeft {
					keptPatch, keptEP, deletingPatch, deletingEP = right, rEP, left, lEP
				}
				childType := tree.NodeType_LEAF
				if tc.childOp == OpCreateFolder {
					childType = tree.NodeType_COLLECTION
				}
				_ = keptEP.CreateNode(ctx, &tree.Node{Path: "A", Uuid: "uA", Type: tree.NodeType_COLLECTION}, false)
				_ = keptEP.CreateNode(ctx, &tree.Node{Path: "A/keep", Uuid: "uk", Type: tree.NodeType_LEAF, Etag: "k"}, false)
				_ = keptEP.CreateNode(ctx, &tree.Node{Path: tc.child, Uuid: "uc", Type: childType, Etag: "new"}, false)
				keptPatch.Enqueue(&patchOperation{OpType: tc.childOp, Node: &tree.Node{Path: tc.child, Type: childType, Etag: "new"}, EventInfo: model.EventInfo{Path: tc.child}})
				deletingPatch.Enqueue(&patchOperation{OpType: OpDelete, Node: &tree.Node{Path: "A", Type: tree.NodeType_COLLECTION}, EventInfo: model.EventInfo{Path: "A"}})

				bi, e := ComputeBidirectionalPatch(ctx, left, right)
				if e != nil {
					t.Fatalf("unexpected merge error: %v", e)
				}
				ops := opsByTypeAndPath(bi)
				if _, has := ops["Delete A"]; has {
					t.Fatalf("folder A is deleted although its content changed on the other side: %v", ops)
				}
				childKeys := []string{"CreateFile " + tc.child, tc.childOp.String() + " " + tc.child}
				for _, keys := range [][]string{{"CreateFolder A"}, {"CreateFile A/keep"}, childKeys} {
					var op Operation
					for _, k := range keys {
						if o, has := ops[k]; has {
							op = o
						}
					}
					if op == nil {
						t.Fatalf("missing %v to re-create the folder on the deleting side: %v", keys, ops)
					}
					if op.Target() != deletingEP {
						t.Fatalf("%v is not applied on the deleting side", keys)
					}
				}
			})
		}
	}
}

// A file moved on one side and edited on the other: the move is applied on the editing side and the edit is
// written at the moved path. Seen live: redirecting the edit to the moved path renamed the node it shared with the
// tree, and the move came out from the moved path onto itself (NotFound on the server, never converging).
func TestMoveVsEditKeepsMoveOrigin(t *testing.T) {
	left, right, _, _ := bidiInputs()
	left.Enqueue(&patchOperation{OpType: OpUpdateFile, Node: &tree.Node{Path: "d/f", Type: tree.NodeType_LEAF, Etag: "new"}, EventInfo: model.EventInfo{Path: "d/f"}})
	right.Enqueue(&patchOperation{OpType: OpMoveFile, Node: &tree.Node{Path: "d/f", Type: tree.NodeType_LEAF, Etag: "old"}, EventInfo: model.EventInfo{Path: "d/g"}})
	bi, e := ComputeBidirectionalPatch(context.Background(), left, right)
	if e != nil {
		t.Fatal(e)
	}
	for pass := 0; pass < 3; pass++ { // operations are walked many times before and during processing
		ops := opsByTypeAndPath(bi)
		move, update := ops["MoveFile d/g"], ops["UpdateFile d/g"]
		if move == nil || update == nil {
			t.Fatalf("expected a move and an update on d/g: %v", ops)
		}
		if move.GetMoveOriginPath() != "d/f" || move.Target() != left.Source().(model.PathSyncTarget) {
			t.Fatalf("pass %d: the move must go from d/f to d/g on the editing side, got origin %s", pass, move.GetMoveOriginPath())
		}
		if update.Target() != right.Source().(model.PathSyncTarget) {
			t.Fatalf("the edit must be written on the moving side")
		}
	}
}

// Conflict errors must name their path (seen live: "diff has conflicts [conflict on path  conflict on path ]").
func TestConflictErrorsNameTheirPath(t *testing.T) {
	patch := newTreePatch(memory.NewMemDB(), memory.NewMemDB(), PatchOptions{})
	n := &tree.Node{Path: "d/f", Type: tree.NodeType_LEAF}
	patch.Enqueue(NewConflictOperation(n, ConflictFileContent, NewOperation(OpCreateFile, model.EventInfo{Path: "d/f"}, n), NewOperation(OpCreateFile, model.EventInfo{Path: "d/f"}, n)))
	errs, _ := patch.HasErrors()
	if len(errs) != 1 || !strings.Contains(errs[0].Error(), "d/f") {
		t.Fatalf("conflict error does not name its path: %v", errs)
	}
}

// BUG-06: the conflict copies created by the "keep both" solver must survive the second merge pass, which resets the
// patch. Seen live: a second pass triggered by a folder deleted on one side and modified on the other (BUG-05) lost
// the copy of an edit conflict in the same patch, and the server echo of the conflict rename then failed.
func TestSecondPassKeepsConflictCopies(t *testing.T) {
	bg := context.Background()
	for name, secondPass := range map[string]func(left, right *TreePatch, lEP, rEP *memory.MemDB){
		"delete vs move (reSyncTarget)": func(left, right *TreePatch, lEP, rEP *memory.MemDB) {
			_ = lEP.CreateNode(bg, &tree.Node{Path: "z-moved", Type: tree.NodeType_LEAF, Etag: "Z"}, true)
			left.Enqueue(&patchOperation{OpType: OpMoveFile, Node: &tree.Node{Path: "z", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "z-moved"}})
			right.Enqueue(&patchOperation{OpType: OpDelete, Node: &tree.Node{Path: "z", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "z"}})
		},
		"folder delete vs content change (deleteVsBranch)": func(left, right *TreePatch, lEP, rEP *memory.MemDB) {
			_ = lEP.CreateNode(bg, &tree.Node{Path: "F", Uuid: "uF", Type: tree.NodeType_COLLECTION}, true)
			_ = lEP.CreateNode(bg, &tree.Node{Path: "F/new", Uuid: "un", Type: tree.NodeType_LEAF, Etag: "N"}, true)
			left.Enqueue(&patchOperation{OpType: OpCreateFile, Node: &tree.Node{Path: "F/new", Type: tree.NodeType_LEAF, Etag: "N"}, EventInfo: model.EventInfo{Path: "F/new"}})
			right.Enqueue(&patchOperation{OpType: OpDelete, Node: &tree.Node{Path: "F", Type: tree.NodeType_COLLECTION}, EventInfo: model.EventInfo{Path: "F"}})
		},
	} {
		t.Run(name, func(t *testing.T) {
			left, right, lEP, rEP := bidiInputs()
			_ = lEP.CreateNode(bg, &tree.Node{Path: "a.txt", Type: tree.NodeType_LEAF, Etag: "L"}, true)
			_ = rEP.CreateNode(bg, &tree.Node{Path: "a.txt", Type: tree.NodeType_LEAF, Etag: "R"}, true)
			left.Enqueue(&patchOperation{OpType: OpUpdateFile, Node: &tree.Node{Path: "a.txt", Etag: "L", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "a.txt"}})
			right.Enqueue(&patchOperation{OpType: OpUpdateFile, Node: &tree.Node{Path: "a.txt", Etag: "R", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "a.txt"}})
			secondPass(left, right, lEP, rEP)
			bi, e := ComputeBidirectionalPatch(bg, left, right)
			if e != nil {
				t.Fatal(e)
			}
			var copies int
			for _, o := range bi.OperationsByType([]OperationType{OpCreateFile}) {
				if strings.HasPrefix(o.GetRefPath(), "a-") {
					copies++
				}
			}
			if copies != 2 {
				t.Fatalf("expected both conflict copies of a.txt to be synced, got %d: %v", copies, opsByTypeAndPath(bi))
			}
		})
	}
}
