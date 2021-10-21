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
	"net/url"
	"path"
	"strings"

	json "github.com/pydio/cells/x/jsonx"

	"github.com/gobwas/glob"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

const OpNone OperationType = 100
const OpMoveTarget OperationType = 101

type Solver func(left, right *TreeNode)

// BidirectionalPatch is a Patch that can handle operations going both left and right side.
// It handles conflicts detection and tries to solve them automatically if possible
type BidirectionalPatch struct {
	TreePatch
	matrix              map[OperationType]map[OperationType]Solver
	inputsModified      bool
	unexpected          []error
	ctx                 context.Context
	ignoreUUIDConflicts bool
}

func NewBidirectionalPatch(ctx context.Context, source, target model.Endpoint) *BidirectionalPatch {
	b := &BidirectionalPatch{
		TreePatch: *newTreePatch(source.(model.PathSyncSource), target.(model.PathSyncTarget), PatchOptions{MoveDetection: false}),
		ctx:       ctx,
	}
	// If syncing on same server, do not trigger conflicts on .pydio
	u1, _ := url.Parse(source.GetEndpointInfo().URI)
	u2, _ := url.Parse(target.GetEndpointInfo().URI)
	if u1.Scheme == "router" && u2.Scheme == "router" {
		b.ignoreUUIDConflicts = true
	}
	if strings.HasPrefix(u1.Scheme, "http") && strings.HasPrefix(u2.Scheme, "http") && u1.Host == u2.Host {
		b.ignoreUUIDConflicts = true
	}
	b.initMatrix()
	return b
}

// ComputeBidirectionalPatch merges two unidirectional Patch into one BidirectionalPatch
func ComputeBidirectionalPatch(ctx context.Context, left, right Patch) (*BidirectionalPatch, error) {
	source := left.Source()
	target, _ := model.AsPathSyncTarget(right.Source())
	b := &BidirectionalPatch{
		TreePatch: *newTreePatch(source, target, PatchOptions{MoveDetection: false}),
		ctx:       ctx,
	}

	// If syncing on same server, do not trigger conflicts on .pydio
	u1, _ := url.Parse(source.GetEndpointInfo().URI)
	u2, _ := url.Parse(target.GetEndpointInfo().URI)
	if u1.Scheme == "router" && u2.Scheme == "router" {
		b.ignoreUUIDConflicts = true
	}
	if strings.HasPrefix(u1.Scheme, "http") && strings.HasPrefix(u2.Scheme, "http") && u1.Host == u2.Host {
		b.ignoreUUIDConflicts = true
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
			// SECOND PASS WILL RESET PATCH TOTALLY
			log.Logger(ctx).Info("Input trees modified, running a second pass")
			b.TreePatch = *newTreePatch(source, target, PatchOptions{MoveDetection: false})
			b.mergeTrees(&l.TreeNode, &r.TreeNode)
		}
		log.Logger(ctx).Info("Merged Patch", zap.Any("stats", b.Stats()))
	}
	if len(b.unexpected) > 0 {
		var ss []string
		for _, e := range b.unexpected {
			ss = append(ss, e.Error())
		}
		b.patchError = fmt.Errorf("error during merge: %s", strings.Join(ss, "|"))
		return b, fmt.Errorf("error during merge: %s", strings.Join(ss, "|"))
	}
	return b, e
}

// StartSession overrides AbstractPatch method to handle source and/or target as session provider
func (p *BidirectionalPatch) StartSession(rootNode *tree.Node) (*tree.IndexationSession, error) {
	if p.sessionProviderContext == nil {
		return &tree.IndexationSession{Uuid: "", Description: "no-op"}, nil
	}
	ids := make(map[string]*tree.IndexationSession)
	if sessionProvider, ok := p.Source().(model.SessionProvider); ok {
		if sourceSession, er := sessionProvider.StartSession(p.sessionProviderContext, rootNode, p.sessionSilent); er != nil {
			return nil, er
		} else {
			ids["source"] = sourceSession
		}
	}
	if sessionProvider, ok := p.Target().(model.SessionProvider); ok {
		if targetSession, er := sessionProvider.StartSession(p.sessionProviderContext, rootNode, p.sessionSilent); er != nil {
			return nil, er
		} else {
			ids["target"] = targetSession
		}
	}
	session := &tree.IndexationSession{}
	if len(ids) > 0 {
		data, _ := json.Marshal(ids)
		session.Uuid = string(data)
	}
	return session, nil
}

// FlushSession overrides AbstractPatch method to handle source and/or target as session provider
func (p *BidirectionalPatch) FlushSession(sessionUuid string) error {
	if len(sessionUuid) == 0 {
		return nil
	}
	var ids map[string]*tree.IndexationSession
	if e := json.Unmarshal([]byte(sessionUuid), &ids); e != nil {
		return nil
	}
	targetSession, o1 := ids["target"]
	var e1, e2 error
	if sessionProvider, ok := p.Target().(model.SessionProvider); ok && o1 {
		e1 = sessionProvider.FlushSession(p.sessionProviderContext, targetSession.Uuid)
	}
	sourceSession, o2 := ids["source"]
	if sessionProvider, ok := p.Source().(model.SessionProvider); ok && o2 {
		e2 = sessionProvider.FlushSession(p.sessionProviderContext, sourceSession.Uuid)
	}
	if e1 != nil {
		return e1
	}
	if e2 != nil {
		return e2
	}
	return nil
}

// FinishSession overrides AbstractPatch method to handle source and/or target as session provider
func (p *BidirectionalPatch) FinishSession(sessionUuid string) error {
	if len(sessionUuid) == 0 {
		return nil
	}
	var ids map[string]*tree.IndexationSession
	if e := json.Unmarshal([]byte(sessionUuid), &ids); e != nil {
		return nil
	}
	targetSession, o1 := ids["target"]
	var e1, e2 error
	if sessionProvider, ok := p.Target().(model.SessionProvider); ok && o1 {
		e1 = sessionProvider.FinishSession(p.sessionProviderContext, targetSession.Uuid)
	}
	sourceSession, o2 := ids["source"]
	if sessionProvider, ok := p.Source().(model.SessionProvider); ok && o2 {
		e2 = sessionProvider.FinishSession(p.sessionProviderContext, sourceSession.Uuid)
	}
	if e1 != nil {
		return e1
	}
	if e2 != nil {
		return e2
	}
	return nil
}

// Filter override TreePatch.Filter and does nothing. Left and right patches are
// filtered at BidirectionalPatch creation time.
func (p *BidirectionalPatch) Filter(ctx context.Context, ignores ...glob.Glob) {
}

// AppendBranch merges another bidir patch into this existing patch
func (p *BidirectionalPatch) AppendBranch(ctx context.Context, branch *BidirectionalPatch) {
	p.enqueueOperations(&branch.TreeNode)
}

// initMatrix builds a matrix of left/right operations with Solver functions
func (p *BidirectionalPatch) initMatrix() {
	// Use three chars symbols for nice display of the matrix
	ign := p.ignore
	eqb := p.enqueueBoth
	eql := p.enqueueLeft
	eqr := p.enqueueRight
	rst := p.reSyncTarget
	cmt := p.compareMoveTargets
	cms := p.compareMoveSources
	mrg := p.mergeDataOperations
	cnT := func(left, right *TreeNode) { p.enqueueConflict(left, right, ConflictNodeType) }
	cnP := func(left, right *TreeNode) { p.enqueueConflict(left, right, ConflictPathOperation) }
	p.matrix = map[OperationType]map[OperationType]Solver{
		OpNone:         {OpNone: ign, OpCreateFolder: eqb, OpMoveFile: eqb, OpMoveFolder: eqb, OpDelete: eqb, OpCreateFile: eqb, OpUpdateFile: eqb, OpMoveTarget: eqb},
		OpCreateFolder: {OpNone: nil, OpCreateFolder: ign, OpMoveFile: cnP, OpMoveFolder: cnP, OpDelete: eql, OpCreateFile: cnP, OpUpdateFile: cnP, OpMoveTarget: eqb},
		OpMoveFile:     {OpNone: nil, OpCreateFolder: nil, OpMoveFile: cmt, OpMoveFolder: cnT, OpDelete: rst, OpCreateFile: cnP, OpUpdateFile: eqb, OpMoveTarget: eqb},
		OpMoveFolder:   {OpNone: nil, OpCreateFolder: nil, OpMoveFile: nil, OpMoveFolder: cmt, OpDelete: rst, OpCreateFile: cnT, OpUpdateFile: cnT, OpMoveTarget: eqb},
		OpDelete:       {OpNone: nil, OpCreateFolder: nil, OpMoveFile: nil, OpMoveFolder: nil, OpDelete: ign, OpCreateFile: eqr, OpUpdateFile: eqr, OpMoveTarget: eqb},
		OpCreateFile:   {OpNone: nil, OpCreateFolder: nil, OpMoveFile: nil, OpMoveFolder: nil, OpDelete: nil, OpCreateFile: mrg, OpUpdateFile: mrg, OpMoveTarget: eqb},
		OpUpdateFile:   {OpNone: nil, OpCreateFolder: nil, OpMoveFile: nil, OpMoveFolder: nil, OpDelete: nil, OpCreateFile: nil, OpUpdateFile: mrg, OpMoveTarget: eqb},
		OpMoveTarget:   {OpNone: nil, OpCreateFolder: nil, OpMoveFile: nil, OpMoveFolder: nil, OpDelete: nil, OpCreateFile: nil, OpUpdateFile: nil, OpMoveTarget: cms},
	}
}

// mergeTrees performs the walk of left and right to enqueue operations to the current Patch
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

// enqueueOperation adds an operation to the patch, with an optional operation direction
func (p *BidirectionalPatch) enqueueOperations(branch *TreeNode, direction ...OperationDirection) {
	branch.WalkOperations([]OperationType{}, func(operation Operation) {
		toEnqueue := operation.Clone()
		if len(direction) > 0 {
			toEnqueue.SetDirection(direction[0])
		}
		p.Enqueue(toEnqueue)
	})
}

// merge finds the correct solver for two similar nodes
func (p *BidirectionalPatch) merge(left, right *TreeNode) {
	// Merge PATH or Data Ops
	opLeft, opRight := OpNone, OpNone
	if left.PathOperation != nil {
		opLeft = left.PathOperation.Type()
	} else if left.DataOperation != nil {
		opLeft = left.DataOperation.Type()
	} else if left.MoveSourcePath != "" {
		opLeft = OpMoveTarget
	}
	if right.PathOperation != nil {
		opRight = right.PathOperation.Type()
	} else if right.DataOperation != nil {
		opRight = right.DataOperation.Type()
	} else if right.MoveSourcePath != "" {
		opRight = OpMoveTarget
	}
	solver := p.matrix[opLeft][opRight]
	if solver == nil {
		solver = p.matrix[opRight][opLeft]
	}
	solver(left, right)
}

// ignore does not enqueue anything to patch
func (p *BidirectionalPatch) ignore(left, right *TreeNode) {
	if left.PathOperation != nil || right.PathOperation != nil {
		log.Logger(p.ctx).Debug("Ignoring Change", zap.Any("left", left.PathOperation), zap.Any("right", right.PathOperation))
	}
}

// enqueueBoth enqueue both operations to the patch
func (p *BidirectionalPatch) enqueueBoth(left, right *TreeNode) {
	p.enqueueLeft(left, right)
	p.enqueueRight(left, right)
}

// enqueueLeft only enqueues the Left operation with DirRight
func (p *BidirectionalPatch) enqueueLeft(left, right *TreeNode) {
	p.enqueueOperations(left, OperationDirRight)
}

// enqueueRight only enqueues the Right operation with DirLeft
func (p *BidirectionalPatch) enqueueRight(left, right *TreeNode) {
	p.enqueueOperations(right, OperationDirLeft)
}

// enqueueConflict sets a Conflict flag on the the given path in side the patch. The Conflict has references to left and right operations
func (p *BidirectionalPatch) enqueueConflict(left, right *TreeNode, t ConflictType) {
	log.Logger(p.ctx).Error("-- Unsolvable conflict!", zap.Any("left", left.PathOperation), zap.Any("right", right.PathOperation))
	p.unexpected = append(p.unexpected, fmt.Errorf("registered conflict at path %s", left.Path))
	var leftOp, rightOp Operation
	if left.PathOperation != nil {
		leftOp = left.PathOperation
	} else if left.DataOperation != nil {
		leftOp = left.DataOperation
	}
	if right.PathOperation != nil {
		rightOp = right.PathOperation
	} else if right.DataOperation != nil {
		rightOp = right.DataOperation
	}
	op := NewConflictOperation(&left.Node, t, leftOp, rightOp)
	p.QueueOperation(op)
}

// reSyncTarget tries to fix a Deleted resource that has been recreated on the other target by recreating it recursively
func (p *BidirectionalPatch) reSyncTarget(left, right *TreeNode) {
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
		log.Logger(p.ctx).Debug("Cannot find move target, ignoring")
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
			childOp.AttachToPatch(p)
			requeueNode.getRoot().QueueOperation(childOp)
		}, targetPath, true)
	}
	p.inputsModified = true
}

// compareMoveSources finds conflicts on "MoveTarget" nodes that don't have operation but that may have been moved
// from two different sources. No auto-solving there
func (p *BidirectionalPatch) compareMoveSources(left, right *TreeNode) {
	if left.MoveSourcePath == right.MoveSourcePath {
		log.Logger(p.ctx).Debug("-- Moved from the same source, do not trigger conflict")
	} else {
		log.Logger(p.ctx).Info("-- Different sources pointing to same target, trigger a conflict")
		p.enqueueConflict(left, right, ConflictMoveSameSource)
	}
}

// compareMoveTargets finds conflicts on Move operations where a source node would have been moved to two different targets.
// Auto-solving is performed by detecting the most recent operation.
func (p *BidirectionalPatch) compareMoveTargets(left, right *TreeNode) {
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

// mergeDataOperations handles DataOperations (CreateFile, UpdateFile) by checking the nodes ETag. If they differ, auto-solving
// is done by creating a -left and -right version on both side, so that users can fix them manually afterward.
func (p *BidirectionalPatch) mergeDataOperations(left, right *TreeNode) {
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
		if path.Base(initialPath) == common.PydioSyncHiddenFile {
			if p.ignoreUUIDConflicts {
				log.Logger(p.ctx).Info("-- Conflict found on .pydio but patch must ignore")
				return
			} else {
				log.Logger(p.ctx).Error("-- Conflict found on .pydio => One .pydio content should be refreshed!")
				return
			}
		}

		// TODO - FIND A CLEANER WAY ?
		leftSuffix, rightSuffix := p.computeAutoFixSuffixes(left.DataOperation.Source().GetEndpointInfo(), right.DataOperation.Source().GetEndpointInfo())
		leftSource, _ := model.AsPathSyncTarget(left.DataOperation.Source())
		leftSource.MoveNode(p.ctx, initialPath, basePath+"-"+leftSuffix+ext)

		lOp.UpdateRefPath(basePath + "-" + leftSuffix + ext)
		lOp.UpdateType(OpCreateFile)
		p.Enqueue(lOp.Clone().SetDirection(OperationDirRight))

		rightSource, _ := model.AsPathSyncTarget(right.DataOperation.Source())
		rightSource.MoveNode(p.ctx, initialPath, basePath+"-"+rightSuffix+ext)

		rOp.UpdateRefPath(basePath + "-" + rightSuffix + ext)
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

func (p *BidirectionalPatch) computeAutoFixSuffixes(source, target model.EndpointInfo) (string, string) {
	leftSuffix := "left"
	rightSuffix := "right"
	leftUri, _ := url.Parse(source.URI)
	rightUri, _ := url.Parse(target.URI)
	if leftUri.Scheme != rightUri.Scheme {
		leftSuffix = p.autoFixSuffix(leftUri.Scheme)
		rightSuffix = p.autoFixSuffix(rightUri.Scheme)
	}
	return leftSuffix, rightSuffix
}

func (p *BidirectionalPatch) autoFixSuffix(scheme string) string {
	switch scheme {
	case "fs":
		return "local"
	case "http", "https":
		return "server"
	case "s3":
		return "s3"
	case "local":
		return "datasource"
	default:
		return scheme
	}
}
