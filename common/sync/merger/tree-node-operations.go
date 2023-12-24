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
	"path"
	"strings"

	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/sync/model"
)

// OriginalPath rebuilds node Path climbing to the root
func (t *TreeNode) OriginalPath() string {
	if t.parent == nil {
		return t.GetPath()
	}
	return path.Join(t.parent.OriginalPath(), t.Label())
}

// ProcessedPath builds node Path to the root taking all moves into account
func (t *TreeNode) ProcessedPath(asProcessed bool, isNext ...bool) string {
	if t.parent == nil {
		return t.GetPath()
	}
	label := t.Label()
	if len(isNext) > 0 && t.PathOperation != nil && t.PathOperation.IsTypeMove() && (asProcessed || t.PathOperation.IsProcessed()) {
		// Compute target from t.PathOperation.OpMoveTarget
		return t.OpMoveTarget.ProcessedPath(asProcessed, true)
	}
	return path.Join(t.parent.ProcessedPath(asProcessed, true), label)
}

// PruneIdentityPathOperation detects if this PathOperation will result in Identity, remove it in that case.
func (t *TreeNode) PruneIdentityPathOperation() bool {
	if t.OpMoveTarget != nil {
		// Compare finally paths after all tree will be processed
		modSrc := t.ProcessedPath(true)
		modTarget := t.OpMoveTarget.ProcessedPath(true)
		if modSrc == modTarget {
			t.PathOperation = nil
			t.OpMoveTarget = nil
			return true
		}
	}
	return false
}

// QueueOperation registers an operation at a given path, by eventually building
// traversing nodes without operations on them
func (t *TreeNode) QueueOperation(op Operation) {
	crtParent := t
	n := op.GetNode()
	p := n.GetPath()
	split := strings.Split(p, "/")
	for i := range split {
		childPath := strings.Join(split[:i+1], "/")
		if i == len(split)-1 {
			var last *TreeNode
			if c, o := crtParent.children[childPath]; o {
				last = c
			} else {
				last = NewTreeNode(n)
				crtParent.AddChild(last)
			}
			switch op.Type() {
			case OpMoveFile, OpMoveFolder:
				last.PathOperation = op
				moveTarget := t.getRoot().createNodeDeep(op.GetRefPath())
				moveTarget.MoveSourcePath = op.GetMoveOriginPath()
				last.OpMoveTarget = moveTarget
			case OpCreateFolder, OpDelete:
				last.PathOperation = op
			case OpCreateFile, OpUpdateFile, OpRefreshUuid:
				last.DataOperation = op
			case OpConflict:
				last.Conflict = op
			case OpDeleteMeta, OpCreateMeta, OpUpdateMeta:
				last.DataOperation = op
			}
		} else if c, o := crtParent.children[childPath]; o {
			crtParent = c
		} else {
			n := NewTreeNode(&tree.Node{Path: childPath})
			crtParent.AddChild(n)
			crtParent = n
		}
	}
}

// filterByTypes checks if operation is not nul and is of a given type.
// opTypes can be empty, and operation can be nil (will return false)
func (t *TreeNode) filterByTypes(opTypes []OperationType, o Operation) bool {
	if o == nil {
		return false
	}
	if len(opTypes) == 0 {
		return true
	}
	for _, oT := range opTypes {
		if o.Type() == oT {
			return true
		}
	}
	return false
}

// WalkOperations walks the tree looking for operation of a certain type
func (t *TreeNode) WalkOperations(opTypes []OperationType, callback OpWalker) {
	// Shall we clone operation here?
	recompute := func(t *TreeNode, o Operation) {
		if t.OpMoveTarget != nil {
			o.UpdateRefPath(t.OpMoveTarget.ProcessedPath(false))
			updatedSource := t.ProcessedPath(false)
			t.OpMoveTarget.MoveSourcePath = updatedSource
			o.UpdateMoveOriginPath(updatedSource)
		} else {
			o.UpdateRefPath(t.ProcessedPath(false))
		}
	}
	if t.filterByTypes(opTypes, t.PathOperation) {
		recompute(t, t.PathOperation)
		callback(t.PathOperation)
	}
	if t.filterByTypes(opTypes, t.DataOperation) {
		recompute(t, t.DataOperation)
		callback(t.DataOperation)
	}
	if t.filterByTypes(opTypes, t.Conflict) {

		callback(t.Conflict)
	}
	for _, c := range t.SortedChildren() {
		c.WalkOperations(opTypes, callback)
	}
}

// WalkToFirstOperations walks the tree (depth-first) and stops on a branch as soon as it finds a given operation Type
func (t *TreeNode) WalkToFirstOperations(opType OperationType, callback func(Operation), target ...model.Endpoint) {
	recompute := func(t *TreeNode, o Operation) {
		if t.OpMoveTarget != nil {
			o.UpdateRefPath(t.OpMoveTarget.ProcessedPath(false))
			updatedSource := t.ProcessedPath(false)
			t.OpMoveTarget.MoveSourcePath = updatedSource
			o.UpdateMoveOriginPath(updatedSource)
		} else {
			o.UpdateRefPath(t.ProcessedPath(false))
		}
	}
	filter := func(o Operation) bool {
		if o == nil {
			return false
		}
		if opType == OpUnknown {
			return true
		}
		if len(target) > 0 && o.Target() != target[0] {
			return false
		}
		return o.Type() == opType
	}
	var found bool
	if filter(t.PathOperation) {
		found = true
		recompute(t, t.PathOperation)
		callback(t.PathOperation)
	}
	if filter(t.DataOperation) {
		found = true
		recompute(t, t.DataOperation)
		callback(t.DataOperation)
	}
	if filter(t.Conflict) {
		found = true
		callback(t.Conflict)
	}
	if !found {
		for _, c := range t.SortedChildren() {
			c.WalkToFirstOperations(opType, callback)
		}
	}
}
