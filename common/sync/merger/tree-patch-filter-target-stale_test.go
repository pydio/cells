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

// #30: late server events of our own recursive delete must not delete a path recreated in the meantime. A delete
// whose path exists again on its source is stale and dropped.
func TestFilterToTargetDropsStaleDeletes(t *testing.T) {
	ctx := context.Background()
	with := func(paths ...string) *memory.MemDB {
		db := memory.NewMemDB()
		for _, p := range paths {
			_ = db.CreateNode(ctx, &tree.Node{Path: p, Uuid: "u" + p, Type: tree.NodeType_LEAF, Etag: "e"}, false)
		}
		return db
	}
	// For a left operation, the delete goes from the patch target to the patch source
	for _, tc := range []struct {
		name     string
		patchSrc model.PathSyncSource
		patchTgt model.PathSyncTarget
		dir      OperationDirection
		other    string // path of another operation in the patch
		kept     bool
	}{
		{"recreated on source", with("/a"), with("/a"), OperationDirDefault, "", false},
		{"deleted on source", with(), with("/a"), OperationDirDefault, "", true},
		{"source LoadNode fails", &loadErrorTarget{with("/a")}, with("/a"), OperationDirDefault, "", true},
		{"case-only rename on source", with("/a"), with("/a"), OperationDirDefault, "/A", true},
		{"left: recreated on the patch target", with("/a"), with("/a"), OperationDirLeft, "", false},
		{"left: deleted on the patch target", with("/a"), with(), OperationDirLeft, "", true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			patch := newTreePatch(tc.patchSrc, tc.patchTgt, PatchOptions{})
			patch.Enqueue(&patchOperation{OpType: OpDelete, Node: &tree.Node{Path: "/a", Type: tree.NodeType_LEAF}, EventInfo: model.EventInfo{Path: "/a"}, Dir: tc.dir})
			if tc.other != "" {
				patch.Enqueue(&patchOperation{OpType: OpCreateFile, Node: &tree.Node{Path: tc.other, Type: tree.NodeType_LEAF, Etag: "x"}, EventInfo: model.EventInfo{Path: tc.other}})
			}
			patch.FilterToTarget(ctx)
			if got := len(patch.OperationsByType([]OperationType{OpDelete})) == 1; got != tc.kept {
				t.Fatalf("delete kept=%v, expected %v", got, tc.kept)
			}
		})
	}
}
