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
