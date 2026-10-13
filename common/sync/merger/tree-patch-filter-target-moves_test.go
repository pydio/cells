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

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/model"
)

// Echoes of our own moves come back from asynchronous targets (Cells) without echo lock: FilterToTarget must drop
// a move already applied on the target, and only that one.
func TestFilterToTargetDropsAppliedMoves(t *testing.T) {
	ctx := context.Background()
	with := func(paths ...string) *memory.MemDB {
		db := memory.NewMemDB()
		for _, p := range paths {
			_ = db.CreateNode(ctx, &tree.Node{Path: p, Uuid: "u" + p, Type: tree.NodeType_LEAF, Etag: "e"}, false)
		}
		return db
	}
	for _, tc := range []struct {
		name   string
		target model.PathSyncTarget
		opType OperationType
		kept   bool
	}{
		{"file already moved", with("/b"), OpMoveFile, false},
		{"folder already moved", with("/b"), OpMoveFolder, false},
		{"move not applied yet", with("/a"), OpMoveFile, true},
		{"source and destination both missing", with(), OpMoveFile, true},
		{"source still there and destination exists", with("/a", "/b"), OpMoveFile, true},
		{"target LoadNode fails", &loadErrorTarget{with("/b")}, OpMoveFile, true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			patch := newTreePatch(memory.NewMemDB(), tc.target, PatchOptions{})
			patch.Enqueue(&patchOperation{OpType: tc.opType, Node: &tree.Node{Path: "/a", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "/b"}})
			patch.FilterToTarget(ctx)
			if got := len(patch.OperationsByType([]OperationType{tc.opType})) == 1; got != tc.kept {
				t.Fatalf("move kept=%v, expected %v", got, tc.kept)
			}
		})
	}
}
