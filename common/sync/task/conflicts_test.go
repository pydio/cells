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

package task

import (
	"context"
	"errors"
	"strings"
	"testing"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/merger"
)

// CS-U-06: a conflict the merger cannot solve holds back its path only. The rest of the patch is applied, and the
// snapshots are kept, so that the next run still reports the conflict until it is resolved.
func TestConflictDoesNotDropPatch(t *testing.T) {
	f := newBiFixture(t)
	ctx := context.Background()
	_ = f.left.CreateNode(ctx, leaf("seed", "E0"), false)
	f.run(t, false)
	f.run(t, false)
	leftBefore, rightBefore := f.snaps.paths(t, "left"), f.snaps.paths(t, "right")

	// Folder X on the left, file X on the right: no solver for it
	_ = f.left.CreateNode(ctx, &tree.Node{Path: "X", Type: tree.NodeType_COLLECTION, Uuid: "u-X"}, false)
	_ = f.left.CreateNode(ctx, leaf("X/c", "EC"), false)
	_ = f.right.CreateNode(ctx, leaf("X", "EX"), false)
	_ = f.left.CreateNode(ctx, leaf("other", "EO"), false)

	for run := 1; run <= 2; run++ {
		p := f.run(t, false)
		if p == nil {
			t.Fatalf("run %d: no patch processed", run)
		}
		errs, _ := p.HasErrors()
		var ce *merger.ConflictError
		if len(errs) != 1 || !errors.As(errs[0], &ce) || ce.Path != "X" {
			t.Fatalf("run %d: expected one conflict on X, got %v", run, errs)
		}
		if !f.has(f.right, "other") {
			t.Fatalf("run %d: other must be synced despite the conflict", run)
		}
		if f.has(f.right, "X/c") {
			t.Fatalf("run %d: the children of a conflicting path must be held back", run)
		}
		if n, e := f.right.LoadNode(ctx, "X"); e != nil || !n.IsLeaf() {
			t.Fatalf("run %d: file X must be left untouched on the right", run)
		}
		if l, r := f.snaps.paths(t, "left"), f.snaps.paths(t, "right"); strings.Join(l, ",") != strings.Join(leftBefore, ",") || strings.Join(r, ",") != strings.Join(rightBefore, ",") {
			t.Fatalf("run %d: snapshots must be kept while a conflict is pending: left %v -> %v, right %v -> %v", run, leftBefore, l, rightBefore, r)
		}
	}
}
