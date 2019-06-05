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
	"net/url"
	"path"
	"strings"

	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

const OpNone OperationType = 100

type Solver func(left, right *TreeNode)

type BidirectionalPatch struct {
	TreePatch
	conflicts           []*Conflict
	matrix              map[OperationType]map[OperationType]Solver
	inputsModified      bool
	unexpected          []error
	ctx                 context.Context
	ignoreUUIDConflicts bool
}

func ComputeBidirectionalPatch(ctx context.Context, left, right Patch) (*BidirectionalPatch, error) {
	source := left.Source()
	target, _ := model.AsPathSyncTarget(right.Source())
	b := &BidirectionalPatch{
		TreePatch:           *newTreePatch(source, target, PatchOptions{MoveDetection: false}),
		ctx:                 ctx,
		ignoreUUIDConflicts: ignoreUUIDConflictsForEndpoints(source, target),
	}
	b.initMatrix()
	left.Filter(ctx)
	right.Filter(ctx)
	l, ok1 := left.(*TreePatch)
	r, ok2 := right.(*TreePatch)
	var e error
	if ok1 && ok2 {
		b.mergeTrees(&l.TreeNode, &r.TreeNode)
		if b.inputsModified {
			log.Logger(ctx).Info("Input trees modified, running a second pass")
			b.TreePatch = *newTreePatch(source, target, PatchOptions{MoveDetection: false})
			b.mergeTrees(&l.TreeNode, &r.TreeNode)
		}
		log.Logger(ctx).Info("Merged Patch")
		fmt.Println(b.Stats())
	}
	if len(b.unexpected) > 0 {
		var ss []string
		for _, e := range b.unexpected {
			ss = append(ss, e.Error())
		}
		return nil, fmt.Errorf("error during merge: %s", strings.Join(ss, "|"))
	}
	b.FilterToTarget(ctx)
	return b, e
}

func (p *BidirectionalPatch) AppendBranch(ctx context.Context, branch *BidirectionalPatch) {
	p.enqueueOperations(&branch.TreeNode)
}

func ignoreUUIDConflictsForEndpoints(left, right model.Endpoint) bool {
	// If syncing on same server, do not trigger conflicts on .pydio
	u1, _ := url.Parse(left.GetEndpointInfo().URI)
	u2, _ := url.Parse(right.GetEndpointInfo().URI)
	if u1.Scheme == "router" && u2.Scheme == "router" {
		return true
	}
	if strings.HasPrefix(u1.Scheme, "http") && strings.HasPrefix(u2.Scheme, "http") && u1.Host == u2.Host {
		return true
	}
	return false
}

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
				p.merge(a, b)
				p.mergeTrees(a, b)
				a = cL.Next()
				b = cR.Next()
				continue
			case 1:
				p.enqueueOperations(b, OperationDirLeft)
				b = cR.Next()
				continue
			case -1:
				p.enqueueOperations(a, OperationDirRight)
				a = cL.Next()
				continue
			}
		} else if a == nil && b != nil {
			p.enqueueOperations(b, OperationDirLeft)
			b = cR.Next()
			continue
		} else if b == nil && a != nil {
			p.enqueueOperations(a, OperationDirRight)
			a = cL.Next()
			continue
		}
	}

}

func (p *BidirectionalPatch) enqueueOperations(branch *TreeNode, direction ...OperationDirection) {
	branch.WalkOperations([]OperationType{}, func(operation Operation) {
		toEnqueue := operation.Clone()
		if len(direction) > 0 {
			toEnqueue.SetDirection(direction[0])
		}
		p.Enqueue(toEnqueue)
	})
}

func (p *BidirectionalPatch) initMatrix() {
	p.matrix = map[OperationType]map[OperationType]Solver{
		OpNone:         {OpNone: p.Ignore, OpCreateFolder: p.enqueueBoth, OpMoveFile: p.enqueueBoth, OpMoveFolder: p.enqueueBoth, OpDelete: p.enqueueBoth},
		OpCreateFolder: {OpNone: nil, OpCreateFolder: p.Ignore, OpMoveFile: p.Conflict, OpMoveFolder: p.Conflict, OpDelete: p.enqueueLeft},
		OpMoveFile:     {OpNone: nil, OpCreateFolder: nil, OpMoveFile: p.CompareMoveTargets, OpMoveFolder: p.Conflict, OpDelete: p.ReSyncTarget},
		OpMoveFolder:   {OpNone: nil, OpCreateFolder: nil, OpMoveFile: nil, OpMoveFolder: p.CompareMoveTargets, OpDelete: p.ReSyncTarget},
		OpDelete:       {OpNone: nil, OpCreateFolder: nil, OpMoveFile: nil, OpMoveFolder: nil, OpDelete: p.Ignore},
	}
}

func (p *BidirectionalPatch) merge(left, right *TreeNode) {
	// Merge PATH Ops
	opLeft, opRight := OpNone, OpNone
	if left.PathOperation != nil {
		opLeft = left.PathOperation.Type()
	}
	if right.PathOperation != nil {
		opRight = right.PathOperation.Type()
	}
	solver := p.matrix[opLeft][opRight]
	if solver == nil {
		solver = p.matrix[opRight][opLeft]
	}
	solver(left, right)

	// Merge DATA Ops
	p.MergeDataOperations(left, right)
}

func (p *BidirectionalPatch) Ignore(left, right *TreeNode) {
	if left.PathOperation != nil || right.PathOperation != nil {
		log.Logger(p.ctx).Debug("Ignoring Change", zap.Any("left", left.PathOperation), zap.Any("right", right.PathOperation))
	}
}

func (p *BidirectionalPatch) enqueueBoth(left, right *TreeNode) {
	p.enqueueLeft(left, right)
	p.enqueueRight(left, right)
}

func (p *BidirectionalPatch) enqueueLeft(left, right *TreeNode) {
	p.enqueueOperations(left, OperationDirRight)
}

func (p *BidirectionalPatch) enqueueRight(left, right *TreeNode) {
	p.enqueueOperations(right, OperationDirLeft)
}

func (p *BidirectionalPatch) ReSyncTarget(left, right *TreeNode) {
	var requeueNode *TreeNode
	if left.PathOperation.Type() == OpDelete {
		requeueNode = right
	} else {
		requeueNode = left
	}
	source := requeueNode.PathOperation.Source()
	log.Logger(p.ctx).Info("Delete + Move: should recreate target (file or folder) for " + requeueNode.OpMoveTarget.Path)
	targetPath := requeueNode.OpMoveTarget.Path
	n, e := source.LoadNode(p.ctx, targetPath)
	if e != nil {
		// Cannot find move target, ignore
		fmt.Println(e)
		return
	}
	newOp := requeueNode.PathOperation.Clone()
	if n.IsLeaf() {
		newOp.UpdateType(OpCreateFile)
	} else {
		newOp.UpdateType(OpCreateFolder)
	}
	newOp.UpdateRefPath(targetPath)

	left.PathOperation = nil
	left.OpMoveTarget = nil
	right.PathOperation = nil
	right.OpMoveTarget = nil

	requeueNode.getRoot().QueueOperation(newOp)
	if !n.IsLeaf() {
		// Enqueue folder children as creates
		source.Walk(func(path string, node *tree.Node, err error) {
			oType := OpCreateFolder
			if node.IsLeaf() {
				oType = OpCreateFile
			}
			childOp := NewOperation(oType, model.NodeToEventInfo(p.ctx, node.GetPath(), node, model.EventCreate))
			childOp.SetNode(node)
			requeueNode.getRoot().QueueOperation(childOp)
		}, targetPath, true)
	}
	p.inputsModified = true
}

func (p *BidirectionalPatch) CompareMoveTargets(left, right *TreeNode) {
	if left.OpMoveTarget.Path == right.OpMoveTarget.Path {
		log.Logger(p.ctx).Debug("-- Moved toward the same path, ignore!")
	} else {
		l, err1 := left.PathOperation.Source().LoadNode(p.ctx, left.OpMoveTarget.Path)
		r, err2 := right.PathOperation.Target().LoadNode(p.ctx, right.OpMoveTarget.Path)
		if err1 != nil {
			p.unexpected = append(p.unexpected, err1)
		} else if err2 != nil {
			p.unexpected = append(p.unexpected, err2)
		} else if l.MTime > r.MTime {
			log.Logger(p.ctx).Info("-- Moved toward different paths, left is more recent that right => left wins")
			// Ignore Left - Change Right from Orig => OpMoveTarget.Path to RIGHT.OpMoveTarget.Path => LEFT.OpMoveTargetPath
			newOp := right.PathOperation.Clone()
			newOp.UpdateMoveOriginPath(right.OpMoveTarget.Path)
			newOp.UpdateRefPath(left.OpMoveTarget.Path)

			right.PathOperation = nil
			right.OpMoveTarget = nil
			left.PathOperation = nil
			left.OpMoveTarget = nil

			left.getRoot().QueueOperation(newOp)
			p.inputsModified = true
		} else {
			log.Logger(p.ctx).Info("-- Moved toward different paths, right is more recent than left => right wins")
			// Ignore Right - Change Left
			newOp := left.PathOperation.Clone()
			newOp.UpdateMoveOriginPath(left.OpMoveTarget.Path)
			newOp.UpdateRefPath(right.OpMoveTarget.Path)

			right.PathOperation = nil
			right.OpMoveTarget = nil
			left.PathOperation = nil
			left.OpMoveTarget = nil

			right.getRoot().QueueOperation(newOp)
			p.inputsModified = true
		}
	}
}

func (p *BidirectionalPatch) Conflict(left, right *TreeNode) {
	log.Logger(p.ctx).Error("-- Unsolvable conflict!", zap.Any("left", left.PathOperation), zap.Any("right", right.PathOperation))
}

func (p *BidirectionalPatch) MergeDataOperations(left, right *TreeNode) {
	if left.DataOperation != nil && right.DataOperation != nil {
		lOp := left.DataOperation
		rOp := right.DataOperation
		initialPath := lOp.GetRefPath()
		ext := path.Ext(initialPath)
		basePath := strings.TrimSuffix(initialPath, ext)

		if lOp.GetNode().GetEtag() == rOp.GetNode().GetEtag() {
			log.Logger(p.ctx).Info("-- DataOperation detected on both sides, but same Etag, ignore")
			return
		}
		log.Logger(p.ctx).Info("-- DataOperation detected on both sides, versions differ - keep both")
		if path.Base(initialPath) == common.PYDIO_SYNC_HIDDEN_FILE_META && p.ignoreUUIDConflicts {
			log.Logger(p.ctx).Info("-- Conflict found on .pydio but patch must ignore")
			return
		}

		// TODO - FIND A CLEANER WAY
		leftSource, _ := model.AsPathSyncTarget(left.DataOperation.Source())
		leftSource.MoveNode(p.ctx, initialPath, basePath+"-left"+ext)

		lOp.UpdateRefPath(basePath + "-left" + ext)
		lOp.UpdateType(OpCreateFile)
		p.Enqueue(lOp.Clone().SetDirection(OperationDirRight))

		rightSource, _ := model.AsPathSyncTarget(right.DataOperation.Source())
		rightSource.MoveNode(p.ctx, initialPath, basePath+"-right"+ext)

		rOp.UpdateRefPath(basePath + "-right" + ext)
		rOp.UpdateType(OpCreateFile)
		p.Enqueue(rOp.Clone().SetDirection(OperationDirLeft))
		// Remove original ones
		left.DataOperation = nil
		right.DataOperation = nil

	} else if left.DataOperation != nil {
		p.Enqueue(left.DataOperation.Clone().SetDirection(OperationDirRight))
	} else if right.DataOperation != nil {
		p.Enqueue(right.DataOperation.Clone().SetDirection(OperationDirLeft))
	}

}
