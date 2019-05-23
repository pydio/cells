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
	"fmt"
	"sort"

	"github.com/pydio/cells/common/log"

	"github.com/pydio/cells/common/sync/model"
)

type TreePatch struct {
	AbstractPatch
	TreeNode

	createFiles   map[string]*Operation
	createFolders map[string]*Operation
	deletes       map[string]*Operation
	refreshUUIDs  map[string]*Operation
}

func newTreePatch(source model.PathSyncSource, target model.PathSyncTarget) *TreePatch {
	p := &TreePatch{
		AbstractPatch: AbstractPatch{
			source: source,
			target: target,
		},
		TreeNode:      *NewTree(),
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
		t.QueueOperation(op)
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
	t.WalkOperations(types, func(operation *Operation) {
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

	t.prune(ctx)

	fmt.Println("Source: " + t.source.GetEndpointInfo().URI)
	fmt.Println("Target: " + t.target.GetEndpointInfo().URI)
	fmt.Println(t.PrintTree())

}

func (t *TreePatch) FilterToTarget(ctx context.Context) {
	log.Logger(ctx).Error("FilterToTarget Not Implemented Yet")
}

func (t *TreePatch) HasTransfers() bool {
	var count int
	t.WalkOperations([]OperationType{OpCreateFile, OpUpdateFile}, func(operation *Operation) {
		count++
	})
	return count > 0
}

func (t *TreePatch) Size() int {
	all := t.OperationsByType([]OperationType{})
	return len(all)
}

func (t *TreePatch) ProgressTotal() int64 {
	if t.HasTransfers() {
		var total int64
		t.WalkOperations([]OperationType{}, func(operation *Operation) {
			switch operation.Type {
			case OpCreateFolder, OpMoveFolder, OpMoveFile, OpDelete:
				total++
			case OpCreateFile, OpUpdateFile:
				total += operation.Node.Size
			}
		})
		return total
	} else {
		return int64(t.Size())
	}
}

func (t *TreePatch) String() string {
	return t.Source().GetEndpointInfo().URI + "\n" + t.PrintTree()
}

func (t *TreePatch) Stats() map[string]interface{} {
	s := map[string]interface{}{
		"Type":   "TreePatch",
		"Source": t.Source().GetEndpointInfo().URI,
		"Target": t.Target().GetEndpointInfo().URI,
	}
	t.WalkOperations([]OperationType{}, func(operation *Operation) {
		opType := operation.Type.String()
		if val, ok := s[opType]; ok {
			count := val.(int)
			s[opType] = count + 1
		} else {
			s[opType] = 1
		}
	})
	return s
}

func (t *TreePatch) sortedKeys(events map[string]*Operation) []string {
	var keys []string
	for k, _ := range events {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}
