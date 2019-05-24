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
	"strings"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/sync/model"
)

type BidirectionalPatch struct {
	TreePatch
	conflicts []*Conflict
}

func ComputeBidirectionalPatch(ctx context.Context, left, right Patch) (*BidirectionalPatch, error) {
	source := left.Source()
	target, _ := model.AsPathSyncTarget(right.Source())
	b := &BidirectionalPatch{
		TreePatch: *newTreePatch(source, target, PatchOptions{MoveDetection: false}),
	}
	left.Filter(ctx)
	right.Filter(ctx)
	l, ok1 := left.(*TreePatch)
	r, ok2 := right.(*TreePatch)
	var e error
	if ok1 && ok2 {
		b.mergeTrees(&l.TreeNode, &r.TreeNode)
		log.Logger(ctx).Info("After merge tree in BiPatch")
		fmt.Println(b.String())
	}
	b.FilterToTarget(ctx)
	return b, e
}

// Merge takes consider current batches are delta B(t-1) -> B(t) and merge them as proper instructions
/*
func (p *BidirectionalPatch) Merge(ctx context.Context, left, right *TreePatch) error {

	// Naive Merge - Cross Targets
	lt, _ := model.AsPathSyncTarget(p.Left.Source())
	rt, _ := model.AsPathSyncTarget(p.Right.Source())

	p.Left.Target(rt)
	p.Right.Target(lt)

	left, ok1 := p.Left.(*TreePatch)
	right, ok2 := p.Right.(*TreePatch)
	if ok1 && ok2 {
		p.mergeTrees(&left.TreeNode, &right.TreeNode)
		log.Logger(ctx).Info("After merge tree in BiPatch")
		fmt.Println(p.result.String())
	} else {
		p.Left.FilterToTarget(ctx)
		p.Right.FilterToTarget(ctx)
	}

	return nil
}
*/

func (p *BidirectionalPatch) mergeTrees(left, right *TreeNode) {
	cL := left.GetCursor()
	cR := right.GetCursor()
	a := cL.Next()
	b := cR.Next()
	for a != nil || b != nil {
		if a != nil && b != nil {
			switch strings.Compare(a.Label(), b.Label()) {
			case 0:
				// MAYBE A Conflict here!
				p.EnqueueOperations(a, OperationDirRight)
				p.EnqueueOperations(b, OperationDirLeft)
				p.mergeTrees(a, b)
				a = cL.Next()
				b = cR.Next()
				continue
			case 1:
				p.EnqueueOperations(b, OperationDirLeft)
				b = cR.Next()
				continue
			case -1:
				p.EnqueueOperations(a, OperationDirRight)
				a = cL.Next()
				continue
			}
		} else if a == nil && b != nil {
			p.EnqueueOperations(b, OperationDirLeft)
			b = cR.Next()
			continue
		} else if b == nil && a != nil {
			p.EnqueueOperations(a, OperationDirRight)
			a = cL.Next()
			continue
		}
	}

}

func (p *BidirectionalPatch) EnqueueOperations(branch *TreeNode, direction OperationDirection) {
	branch.WalkOperations([]OperationType{}, func(operation Operation) {
		p.Enqueue(operation.Clone().SetDirection(direction))
	})
}
