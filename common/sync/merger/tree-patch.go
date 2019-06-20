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
	"time"

	"github.com/pborman/uuid"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/sync/model"
)

type TreePatch struct {
	AbstractPatch
	TreeNode

	createFiles   map[string]Operation
	createFolders map[string]Operation
	deletes       map[string]Operation
	refreshUUIDs  map[string]Operation
}

func newTreePatch(source model.PathSyncSource, target model.PathSyncTarget, options PatchOptions) *TreePatch {
	p := &TreePatch{
		AbstractPatch: AbstractPatch{
			uuid:    uuid.New(),
			source:  source,
			target:  target,
			options: options,
			mTime:   time.Now(),
		},
		TreeNode:      *NewTree(),
		createFiles:   make(map[string]Operation),
		createFolders: make(map[string]Operation),
		deletes:       make(map[string]Operation),
		refreshUUIDs:  make(map[string]Operation),
	}
	return p
}

func (t *TreePatch) Enqueue(op Operation, key ...string) {

	if model.Ignores(t.target, op.GetRefPath()) {
		return
	}
	op.AttachToPatch(t)
	switch op.Type() {
	case OpMoveFolder, OpMoveFile, OpUpdateFile:
		t.QueueOperation(op)
	case OpCreateFile:
		if t.options.MoveDetection {
			t.createFiles[op.GetRefPath()] = op
		} else {
			t.QueueOperation(op)
		}
	case OpCreateFolder:
		if t.options.MoveDetection {
			t.createFolders[op.GetRefPath()] = op
		} else {
			t.QueueOperation(op)
		}
	case OpDelete:
		if t.options.MoveDetection {
			t.deletes[op.GetRefPath()] = op
		} else {
			t.QueueOperation(op)
		}
	case OpRefreshUuid:
		t.refreshUUIDs[op.GetRefPath()] = op
	}

}

func (t *TreePatch) OperationsByType(types []OperationType, sorted ...bool) (events []Operation) {
	// walk tree to collect operations
	t.WalkOperations(types, func(operation Operation) {
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

	t.rescanFoldersIfRequired(ctx)

	t.prune(ctx)

	//fmt.Println("Source: " + t.source.GetEndpointInfo().URI)
	//fmt.Println("Target: " + t.target.GetEndpointInfo().URI)
	//fmt.Println(t.PrintTree())

}

func (t *TreePatch) FilterToTarget(ctx context.Context, snapshots model.SnapshotFactory) {
	if t.skipFilterToTarget {
		return
	}
	log.Logger(ctx).Info("Running patch.FilterToTarget")
	// We will try to stat directly on snapshots instead of calling the source
	// If returning nil, will ignore the operation
	getTarget := func(target model.PathSyncTarget) model.PathSyncSource {
		src, ok := model.AsPathSyncSource(target)
		if !ok {
			return nil
		}
		if snapshots != nil {
			snapshot, err := snapshots.Load(src)
			if err != nil {
				return snapshot
			} else {
				log.Logger(ctx).Error("[FilterToTarget] Cannot load snapshot, using original target", zap.Error(err))
				return src
			}
		} else {
			return src
		}
	}
	// Load the source to stat, then check if a node already exists, and optionally check its ETag value
	exists := func(target model.PathSyncTarget, path string, n ...*TreeNode) bool {
		src := getTarget(target)
		if src == nil {
			return false
		}
		node, err := src.LoadNode(ctx, path)
		ex := node != nil && err == nil
		if len(n) == 0 || node == nil {
			return ex
		}
		// Check nodes have exists ETag
		check := n[0]
		return node.Etag == check.Etag
	}
	// Walk the tree to prune operations
	t.Walk(func(n *TreeNode) bool {
		if n.DataOperation != nil {
			dataPath := n.ProcessedPath(false)
			if exists(n.DataOperation.Target(), dataPath, n) {
				log.Logger(ctx).Info("[FilterToTarget] Ignoring DataOperation (node exists with same ETag)", zap.String("path", dataPath))
				n.DataOperation = nil
			}
		} else if n.PathOperation != nil {
			if n.PathOperation.Type() == OpCreateFolder {
				dataPath := n.ProcessedPath(false)
				if exists(n.PathOperation.Target(), dataPath) {
					log.Logger(ctx).Info("[FilterToTarget] Ignoring CreateFolder Operation (folder exists)", zap.String("path", dataPath))
					n.PathOperation = nil
				}
			} else if n.PathOperation.Type() == OpDelete {
				dataPath := n.ProcessedPath(false)
				if !exists(n.PathOperation.Target(), dataPath) {
					log.Logger(ctx).Info("[FilterToTarget] Ignoring Delete Operation (node is not there)", zap.String("path", dataPath))
					n.PathOperation = nil
				}
			}
		}
		return false
	})
}

func (t *TreePatch) HasTransfers() bool {
	var count int
	t.WalkOperations([]OperationType{OpCreateFile, OpUpdateFile}, func(operation Operation) {
		count++
	})
	_, o1 := t.Source().(model.DataSyncTarget)
	_, o2 := t.Target().(model.DataSyncTarget)
	return count > 0 && o1 && o2
}

func (t *TreePatch) Size() int {
	all := t.OperationsByType([]OperationType{})
	return len(all)
}

func (t *TreePatch) ProgressTotal() int64 {
	if t.HasTransfers() {
		var total int64
		t.WalkOperations([]OperationType{}, func(operation Operation) {
			switch operation.Type() {
			case OpCreateFolder, OpMoveFolder, OpMoveFile, OpDelete:
				total++
			case OpCreateFile, OpUpdateFile:
				total += operation.GetNode().Size
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
	processed, pending, errors := make(map[string]int), make(map[string]int), make(map[string]int)
	s := map[string]interface{}{
		"Type":   "TreePatch",
		"Source": t.Source().GetEndpointInfo().URI,
		"Target": t.Target().GetEndpointInfo().URI,
	}
	t.WalkOperations([]OperationType{}, func(operation Operation) {
		var target map[string]int
		if operation.IsProcessed() {
			target = processed
		} else if operation.GetStatus().IsError {
			target = errors
		} else {
			target = pending
		}
		opType := operation.Type().String()
		if count, ok := target[opType]; ok {
			target[opType] = count + 1
		} else {
			target[opType] = 1
		}
		if total, ok := target["Total"]; ok {
			target["Total"] = total + 1
		} else {
			target["Total"] = 1
		}
	})
	if len(processed) > 0 {
		s["Processed"] = processed
	}
	if len(errors) > 0 {
		s["Errors"] = errors
	}
	if len(pending) > 0 {
		s["Pending"] = pending
	}
	return s
}

func (t *TreePatch) sortedKeys(events map[string]Operation) []string {
	var keys []string
	for k, _ := range events {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}
