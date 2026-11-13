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
	"fmt"
	"testing"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/merger"
	"github.com/pydio/cells/v5/common/sync/model"
)

// loadOverride is a MemDB whose LoadNode answers from another MemDB, or fails with err
type loadOverride struct {
	*memory.MemDB
	loadFrom *memory.MemDB
	err      error
}

func (l *loadOverride) LoadNode(ctx context.Context, p string, x ...bool) (tree.N, error) {
	if l.err != nil {
		return nil, l.err
	}
	return l.loadFrom.LoadNode(ctx, p, x...)
}

// folders creates n folders in each db
func folders(n int, dbs ...*memory.MemDB) {
	for _, db := range dbs {
		for i := 0; i < n; i++ {
			p := fmt.Sprintf("/d%02d", i)
			_ = db.CreateNode(context.Background(), &tree.Node{Path: p, Uuid: "u" + p, Type: tree.NodeType_COLLECTION, Etag: "-1"}, false)
		}
	}
}

// runFailsafe computes a unidirectional patch with FailsafeDeletes, filters it like the processor
// does, and returns the filtering error and the number of deletes.
func runFailsafe(t *testing.T, left, right model.Endpoint, dir model.DirectionType) (error, int) {
	t.Helper()
	ctx := context.Background()
	s := NewSync(left, right, dir)
	s.FailsafeDeletes = true
	var patch merger.Patch
	if dir == model.DirectionRight {
		patch = merger.NewPatch(left.(model.PathSyncSource), right.(model.PathSyncTarget), merger.PatchOptions{MoveDetection: true})
	} else {
		patch = merger.NewPatch(right.(model.PathSyncSource), left.(model.PathSyncTarget), merger.PatchOptions{MoveDetection: true})
	}
	patch.SkipFilterToTarget(true)
	if e := s.runUni(ctx, patch, "/", false, map[string]*model.EndpointRootStat{}); e != nil {
		t.Fatal(e)
	}
	patch.Filter(ctx)
	deletes := len(patch.OperationsByType([]merger.OperationType{merger.OpDelete}))
	if errs, ok := patch.HasErrors(); ok {
		return errs[0], deletes
	}
	for _, f := range patch.PostFilter() {
		if e := f(); e != nil {
			return e, deletes
		}
	}
	return nil, deletes
}

func TestFailsafeDeletes(t *testing.T) {
	const n = 60 // above the 50 folders threshold

	t.Run("deletes really observed on the source are allowed", func(t *testing.T) {
		left, right := memory.NewMemDB(), memory.NewMemDB()
		folders(n, right)
		e, deletes := runFailsafe(t, left, right, model.DirectionRight)
		if e != nil || deletes != n {
			t.Fatalf("expected %d allowed deletes, got %d (error: %v)", n, deletes, e)
		}
	})

	t.Run("deletes of folders still present on the source are rejected", func(t *testing.T) {
		present, right := memory.NewMemDB(), memory.NewMemDB()
		folders(n, present, right)
		left := &loadOverride{MemDB: memory.NewMemDB(), loadFrom: present} // walk misses the folders
		if e, _ := runFailsafe(t, left, right, model.DirectionRight); e == nil {
			t.Fatal("deletes of existing folders should be rejected")
		}
	})

	t.Run("deletes that cannot be verified are rejected", func(t *testing.T) {
		right := memory.NewMemDB()
		folders(n, right)
		left := &loadOverride{MemDB: memory.NewMemDB(), err: errors.New("connection refused")}
		if e, _ := runFailsafe(t, left, right, model.DirectionRight); e == nil {
			t.Fatal("a LoadNode error does not prove the folder was deleted: deletes should be rejected")
		}
	})

	t.Run("deletes observed on the right are allowed in DirectionLeft", func(t *testing.T) {
		left, right := memory.NewMemDB(), memory.NewMemDB()
		folders(n, left)
		e, deletes := runFailsafe(t, left, right, model.DirectionLeft)
		if e != nil || deletes != n {
			t.Fatalf("expected %d allowed deletes, got %d (error: %v)", n, deletes, e)
		}
	})
}
