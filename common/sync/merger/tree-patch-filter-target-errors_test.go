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
	"errors"
	"testing"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/model"
)

// loadErrorTarget fails every LoadNode with a non not-found error
type loadErrorTarget struct{ *memory.MemDB }

func (l *loadErrorTarget) LoadNode(context.Context, string, ...bool) (tree.N, error) {
	return nil, errors.New("connection refused")
}

// targetOnly hides every method but the PathSyncTarget ones: the target cannot be read
type targetOnly struct{ model.PathSyncTarget }

// failingCacheTarget cannot load its branches in cache, like Cells or the index on a network error
type failingCacheTarget struct{ *memory.MemDB }

func (f *failingCacheTarget) GetCachedBranches(context.Context, ...string) (model.PathSyncSource, error) {
	return nil, errors.New("connection refused")
}

func TestFilterToTargetKeepsUnverifiedDeletes(t *testing.T) {
	ctx := context.Background()
	existing := func() *memory.MemDB {
		db := memory.NewMemDB()
		_ = db.CreateNode(ctx, &tree.Node{Path: "/a", Uuid: "ua", Type: tree.NodeType_LEAF, Etag: "e"}, false)
		return db
	}
	for name, target := range map[string]model.PathSyncTarget{
		"target LoadNode fails":            &loadErrorTarget{existing()},
		"target cannot be read":            targetOnly{existing()},
		"target branches cannot be cached": &failingCacheTarget{existing()},
	} {
		t.Run(name, func(t *testing.T) {
			patch := newTreePatch(memory.NewMemDB(), target, PatchOptions{})
			patch.Enqueue(&patchOperation{OpType: OpDelete, EventInfo: model.EventInfo{Path: "/a"}, Node: &tree.Node{Path: "/a"}})
			patch.FilterToTarget(ctx)
			if len(patch.OperationsByType([]OperationType{OpDelete})) != 1 {
				t.Fatal("a delete must only be dropped when the target node is known to be missing")
			}
		})
	}
}
