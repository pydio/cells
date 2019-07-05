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
	"encoding/json"
	"sort"
	"time"

	"github.com/gobwas/glob"

	"github.com/pborman/uuid"

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

func (t *TreePatch) Enqueue(op Operation) {

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

func (t *TreePatch) Filter(ctx context.Context, ignores ...glob.Glob) {

	t.filterCreateFiles(ctx)

	t.filterCreateFolders(ctx)

	t.detectFolderMoves(ctx)

	t.detectFileMoves(ctx)

	t.enqueueRemaining(ctx)

	t.rescanFoldersIfRequired(ctx, ignores...)

	t.prune(ctx)

	//fmt.Println("Source: " + t.source.GetEndpointInfo().URI)
	//fmt.Println("Target: " + t.target.GetEndpointInfo().URI)
	//fmt.Println(t.PrintTree())

}

// HasTransfers looks for create/update files between DataSyncTargets
func (t *TreePatch) HasTransfers() bool {
	var count int
	t.WalkOperations([]OperationType{OpCreateFile, OpUpdateFile}, func(operation Operation) {
		count++
	})
	_, o1 := t.Source().(model.DataSyncSource)
	_, o2 := t.Target().(model.DataSyncTarget)
	return count > 0 && o1 && o2
}

// HasErrors checks if this patch has a global error status or any operation in Error state
func (t *TreePatch) HasErrors() (errs []error, has bool) {
	if t.patchError != nil {
		errs = append(errs, t.patchError)
	}
	t.WalkOperations([]OperationType{}, func(operation Operation) {
		if e := operation.Error(); e != nil {
			errs = append(errs, e)
		}
	})
	return errs, len(errs) > 0
}

func (t *TreePatch) CleanErrors() {
	t.patchError = nil
	t.WalkOperations([]OperationType{}, func(operation Operation) {
		operation.CleanError()
	})
}

// Size returns the size of all operations
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
		} else if operation.GetStatus() != nil && operation.GetStatus().IsError() {
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
	//t.PrintTree()
	return s
}

// MarshalJSON implements custom JSON marshalling
func (t *TreePatch) MarshalJSON() ([]byte, error) {
	data := map[string]interface{}{
		"Root":  &t.TreeNode,
		"Stats": t.Stats(),
	}
	return json.Marshal(data)
}

func (t *TreePatch) sortedKeys(events map[string]Operation) []string {
	var keys []string
	for k, _ := range events {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}
