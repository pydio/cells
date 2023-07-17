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
	"fmt"
	"path"
	"sort"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/sync/model"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/mtree"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

// TreePatch is an implement of the Patch interface representing a sequence of operations as a tree structure.
// It is based on a TreeNode: each node can eventually contain a PathOperation or a DataOperation,
// or no operation at all if they are just for traversing.
//
// MOVES operation will add two nodes (and their traversing parents if required) to the tree, for both the Origin and the Target.
//
// Operations paths are computed dynamically based on the state of the parents (whether they have been processed or not).
// That way, if a move is applied at any level, the operations of the children always return the correct origin/target paths.
type TreePatch struct {
	AbstractPatch
	TreeNode

	createFiles   map[string]Operation
	createFolders map[string]Operation
	deletes       map[string]Operation
	refreshUUIDs  map[string]Operation

	// This will keep an internal value for Transfers detection
	// 0 = not detected
	// 1 = true
	// 2 = false
	hasTransfers int
}

// newTreePatch creates and initializes a TreePatch
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

// Enqueue adds an operation to this patch
func (t *TreePatch) Enqueue(op Operation) {

	if model.Ignores(t.target, op.GetRefPath()) {
		return
	}
	op.AttachToPatch(t)
	switch op.Type() {
	case OpMoveFolder, OpMoveFile, OpUpdateFile, OpConflict:
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
	case OpUpdateMeta, OpCreateMeta, OpDeleteMeta:
		t.QueueOperation(op)
	}

}

// OperationsByType collects operations for a given type and return them in a slice
func (t *TreePatch) OperationsByType(types []OperationType, _ ...bool) (events []Operation) {
	// walk tree to collect operations
	t.WalkOperations(types, func(operation Operation) {
		events = append(events, operation)
	})
	return
}

// BranchesWithOperations finds highest modified paths. It walks the tree to find the first nodes
// having operations, and returns their parent folder.
func (t *TreePatch) BranchesWithOperations(endpoint model.Endpoint) (branches []string) {

	unique := map[string]string{}
	t.WalkToFirstOperations(OpUnknown, func(operation Operation) {
		if operation.IsProcessed() {
			return // Skip Processed Operations
		}
		d := path.Dir(operation.GetRefPath())
		if d == "." {
			d = ""
		}
		unique[d] = d
	}, endpoint)
	for _, d := range unique {
		if d == "" {
			return []string{""} // Return one branch for root!
		}
		branches = append(branches, d)
	}
	if len(branches) > 5 {
		c := mtree.CommonPrefix('/', branches...)
		if c != "" && c != "." {
			//fmt.Println("Loading common prefix", c)
			branches = []string{c}
		}
	}
	return

}

// CachedBranchFromEndpoint will walk to the first operations to find the branches containing some modifications
func (t *TreePatch) CachedBranchFromEndpoint(ctx context.Context, endpoint model.Endpoint) (model.PathSyncSource, bool) {

	branches := t.BranchesWithOperations(endpoint)
	if len(branches) == 0 {
		return nil, false
	}
	if cacheProvider, ok := endpoint.(model.CachedBranchProvider); ok {
		if len(branches) > 5 {
			log.Logger(ctx).Info("[BranchCache] Loading multiple branches in cache...", zap.Int("count", len(branches)), zap.String("endpoint", endpoint.GetEndpointInfo().URI))
		} else if branches[0] == "" {
			log.Logger(ctx).Info("[BranchCache] Loading whole branch in cache, this may take some time...", zap.String("endpoint", endpoint.GetEndpointInfo().URI))
		} else {
			log.Logger(ctx).Info("[BranchCache] Loading multiple branches in cache...", log.DangerouslyZapSmallSlice("branches", branches))
		}
		done := make(chan bool)
		timer := time.NewTicker(10 * time.Second).C
		go func() {
			for {
				select {
				case <-done:
					log.Logger(ctx).Info("[BranchCache] Finished")
					return
				case <-timer:
					log.Logger(ctx).Info("[BranchCache] Still Processing, please wait...")
				}
			}
		}()
		inMemory, _ := cacheProvider.GetCachedBranches(ctx, branches...)
		close(done)
		return inMemory, true
	}
	return nil, false
}

// HasTransfers looks for create/update files between DataSyncTargets
// It keeps an internal state to avoid re-walking the tree unnecessarily each time it is called on a patch
func (t *TreePatch) HasTransfers() bool {
	if t.hasTransfers > 0 {
		if t.hasTransfers == 1 {
			return true
		} else {
			return false
		}
	}
	_, o1 := t.Source().(model.DataSyncSource)
	_, o2 := t.Target().(model.DataSyncTarget)
	if !o1 || !o2 {
		t.hasTransfers = 2
		return false
	}
	ht := false
	t.WalkToFirstOperations(OpCreateFile, func(operation Operation) {
		ht = true
	})
	t.WalkToFirstOperations(OpUpdateFile, func(operation Operation) {
		ht = true
	})
	if ht {
		t.hasTransfers = 1
	} else {
		t.hasTransfers = 2
	}
	return ht
}

// HasErrors checks if this patch has a global error status or any operation in Error state
func (t *TreePatch) HasErrors() (errs []error, has bool) {
	if t.patchError != nil {
		errs = append(errs, t.patchError)
	}
	t.WalkOperations([]OperationType{}, func(operation Operation) {
		if e := operation.Error(); e != nil {
			errs = append(errs, e)
		} else if operation.Type() == OpConflict {
			errs = append(errs, fmt.Errorf("conflict on path %s", operation.GetRefPath()))
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
				total += operation.GetNode().GetSize()
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
		} else if (operation.GetStatus() != nil && operation.GetStatus().IsError()) || operation.Type() == OpConflict {
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
	if t.patchError != nil {
		data["Error"] = t.patchError.Error()
	}
	return json.Marshal(data)
}

func (t *TreePatch) sortedKeys(events map[string]Operation) []string {
	var keys []string
	for k := range events {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}
