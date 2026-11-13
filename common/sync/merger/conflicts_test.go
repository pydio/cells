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
	"encoding/json"
	"errors"
	"strings"
	"testing"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/model"
)

// CS-U-06: an unsolved conflict holds back its path and children, the rest of the patch is applied.
func TestConflictHoldsBackOnlyItsPath(t *testing.T) {
	left, right, _, _ := bidiInputs()
	left.Enqueue(&patchOperation{OpType: OpCreateFolder, Node: &tree.Node{Path: "X", Type: tree.NodeType_COLLECTION}, EventInfo: model.EventInfo{Path: "X"}})
	left.Enqueue(&patchOperation{OpType: OpCreateFile, Node: &tree.Node{Path: "X/child", Etag: "C", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "X/child"}})
	left.Enqueue(&patchOperation{OpType: OpCreateFile, Node: &tree.Node{Path: "other", Etag: "O", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "other"}})
	right.Enqueue(&patchOperation{OpType: OpCreateFile, Node: &tree.Node{Path: "X", Etag: "F", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "X"}})
	right.Enqueue(&patchOperation{OpType: OpCreateFile, Node: &tree.Node{Path: "Y", Etag: "Y", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "Y"}})

	bi, e := ComputeBidirectionalPatch(context.Background(), left, right)
	if e != nil {
		t.Fatalf("a conflict must not fail the merge: %v", e)
	}
	ops := opsByTypeAndPath(bi)
	for _, k := range []string{"CreateFile other", "CreateFile Y", "Conflict X"} {
		if ops[k] == nil {
			t.Fatalf("expected %s: %v", k, ops)
		}
	}
	if len(ops) != 3 {
		t.Fatalf("the conflicting path and its children must be held back: %v", ops)
	}
	errs, has := bi.HasErrors()
	var ce *ConflictError
	if !has || len(errs) != 1 || !errors.As(errs[0], &ce) || ce.Path != "X" || ce.Type != ConflictPathOperation {
		t.Fatalf("expected one ConflictError on X, got %v", errs)
	}
	if len(WithoutConflicts(errs)) != 0 {
		t.Fatalf("WithoutConflicts must drop conflict errors")
	}
}

// Content conflicts are solved by keeping both versions, and recorded as solved conflicts naming the two copies.
func TestKeepBothRecordsSolvedConflict(t *testing.T) {
	bg := context.Background()
	left, right, lEP, rEP := bidiInputs()
	_ = lEP.CreateNode(bg, &tree.Node{Path: "d/a.txt", Type: tree.NodeType_LEAF, Etag: "L"}, true)
	_ = rEP.CreateNode(bg, &tree.Node{Path: "d/a.txt", Type: tree.NodeType_LEAF, Etag: "R"}, true)
	left.Enqueue(&patchOperation{OpType: OpUpdateFile, Node: &tree.Node{Path: "d/a.txt", Etag: "L", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "d/a.txt"}})
	right.Enqueue(&patchOperation{OpType: OpUpdateFile, Node: &tree.Node{Path: "d/a.txt", Etag: "R", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "d/a.txt"}})

	bi, e := ComputeBidirectionalPatch(bg, left, right)
	if e != nil {
		t.Fatal(e)
	}
	if errs, has := bi.HasErrors(); has {
		t.Fatalf("a solved conflict is not an error: %v", errs)
	}
	conflicts := bi.OperationsByType([]OperationType{OpConflict})
	if len(conflicts) != 1 {
		t.Fatalf("expected one solved conflict: %v", opsByTypeAndPath(bi))
	}
	c, ok := conflicts[0].(ConflictOperation)
	if !ok || !c.IsSolved() || conflicts[0].GetRefPath() != "d/a.txt" {
		t.Fatalf("expected a solved conflict on d/a.txt, got %v", conflicts[0])
	}
	ct, l, r := c.ConflictInfo()
	if ct != ConflictFileContent || l.GetRefPath() != "d/a-left.txt" || r.GetRefPath() != "d/a-right.txt" {
		t.Fatalf("expected the copies d/a-left.txt and d/a-right.txt, got %v %s %s", ct, l.GetRefPath(), r.GetRefPath())
	}
	if _, ok := bi.Stats()["Errors"]; ok {
		t.Fatalf("a solved conflict is not counted as an error: %v", bi.Stats())
	}
	data, _ := json.Marshal(conflicts[0])
	if !strings.Contains(string(data), `"Solved":true`) {
		t.Fatalf("Solved flag is not marshalled: %s", data)
	}
	if cl, _ := conflicts[0].Clone().(ConflictOperation); cl == nil || !cl.IsSolved() {
		t.Fatalf("Clone must keep the Solved flag")
	}
}

type failingMoves struct {
	*memory.MemDB
}

func (f failingMoves) MoveNode(context.Context, string, string) error {
	return errors.New("rename refused")
}

// A content conflict whose rename fails is not solved: both versions stay in place, the path is held back.
func TestKeepBothRenameFailureHoldsBackPath(t *testing.T) {
	bg := context.Background()
	for _, failLeft := range []bool{true, false} {
		lEP, rEP := memory.NewMemDB(), memory.NewMemDB()
		_ = lEP.CreateNode(bg, &tree.Node{Path: "a.txt", Type: tree.NodeType_LEAF, Etag: "L"}, true)
		_ = rEP.CreateNode(bg, &tree.Node{Path: "a.txt", Type: tree.NodeType_LEAF, Etag: "R"}, true)
		var lSrc, rSrc model.PathSyncSource = lEP, failingMoves{rEP}
		if failLeft {
			lSrc, rSrc = failingMoves{lEP}, rEP
		}
		left := newTreePatch(lSrc, memory.NewMemDB(), PatchOptions{NoRescan: true})
		right := newTreePatch(rSrc, memory.NewMemDB(), PatchOptions{NoRescan: true})
		left.Enqueue(&patchOperation{OpType: OpUpdateFile, Node: &tree.Node{Path: "a.txt", Etag: "L", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "a.txt"}})
		right.Enqueue(&patchOperation{OpType: OpUpdateFile, Node: &tree.Node{Path: "a.txt", Etag: "R", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "a.txt"}})

		bi, e := ComputeBidirectionalPatch(bg, left, right)
		if e != nil {
			t.Fatal(e)
		}
		ops := opsByTypeAndPath(bi)
		if len(ops) != 1 || ops["Conflict a.txt"] == nil || isSolvedConflict(ops["Conflict a.txt"]) {
			t.Fatalf("failLeft=%v: expected only an unsolved conflict on a.txt, got %v", failLeft, ops)
		}
		if n, er := lEP.LoadNode(bg, "a.txt"); er != nil || n.GetEtag() != "L" {
			t.Fatalf("failLeft=%v: the left version must be back at its path: %v", failLeft, er)
		}
	}
}
