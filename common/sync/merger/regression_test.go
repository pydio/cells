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
