/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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
	"sort"

	"github.com/pydio/cells/common/sync/model"
)

type TreePatch struct {
	AbstractPatch

	createFiles   map[string]*Operation
	createFolders map[string]*Operation
	deletes       map[string]*Operation
	refreshUUIDs  map[string]*Operation

	tree *TreeNode
}

func newTreePatch(source model.PathSyncSource, target model.PathSyncTarget) *TreePatch {
	p := &TreePatch{
		AbstractPatch: AbstractPatch{
			source: source,
			target: target,
		},
		tree:          NewTree(),
		createFiles:   make(map[string]*Operation),
		createFolders: make(map[string]*Operation),
		deletes:       make(map[string]*Operation),
		refreshUUIDs:  make(map[string]*Operation),
	}
	return p
}

func (t *TreePatch) Enqueue(op *Operation, key ...string) {

	if model.Ignores(t.target, op.Key) {
		return
	}
	switch op.Type {
	case OpMoveFolder, OpMoveFile, OpUpdateFile:
		t.tree.QueueOperation(op)
	case OpCreateFile:
		t.createFiles[op.Key] = op
	case OpCreateFolder:
		t.createFolders[op.Key] = op
	case OpDelete:
		t.deletes[op.Key] = op
	case OpRefreshUuid:
		t.refreshUUIDs[op.Key] = op
	}

}

func (t *TreePatch) OperationsByType(types []OperationType, sorted ...bool) (events []*Operation) {
	// walk tree to collect operations
	t.tree.WalkOperations(types, func(operation *Operation) {
		events = append(events, operation)
	})
	return
}

func (t *TreePatch) Filter(ctx context.Context) {

	t.filterCreateFiles(ctx)

	t.filterCreateFolders(ctx)

	t.detectFolderMoves(ctx)

	t.detectFileMoves(ctx)

	t.enqueueRemaining(ctx)

	t.tree.PrintOut()

}

func (t *TreePatch) FilterToTarget(ctx context.Context) {
	panic("implement me")
}

func (t *TreePatch) HasTransfers() bool {
	panic("implement me")
}

func (t *TreePatch) Size() int {
	panic("implement me")
}

func (t *TreePatch) ProgressTotal() int64 {
	panic("implement me")
}

func (t *TreePatch) String() string {
	t.tree.PrintOut()
	return t.tree.String()
}

func (t *TreePatch) Stats() map[string]interface{} {
	panic("implement me")
}

func (t *TreePatch) sortedKeys(events map[string]*Operation) []string {
	var keys []string
	for k, _ := range events {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}
