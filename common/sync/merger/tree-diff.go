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
	"fmt"
	"github.com/pydio/cells/v4/common/proto/tree"
	"strings"
	"sync"
	"time"

	"github.com/gobwas/glob"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/sync/model"
)

// DiffConflict represents a conflict between two nodes at the same path
type DiffConflict struct {
	Type      ConflictType
	NodeLeft  tree.N
	NodeRight tree.N
}

// TreeDiff represent basic differences between two sources
// It can be then transformed to Patch, depending on the sync being
// unidirectional (transform to Creates and Deletes) or bidirectional (transform only to Creates)
type TreeDiff struct {
	left  model.PathSyncSource
	right model.PathSyncSource

	missingLeft  []tree.N
	missingRight []tree.N
	conflicts    []*DiffConflict

	cmd        *model.Command
	statusChan chan model.Status
	doneChan   chan interface{}

	includeMetas []glob.Glob
}

// NewTreeDiff is public access for instantiating a new TreeDiff
func NewTreeDiff(left model.PathSyncSource, right model.PathSyncSource) *TreeDiff {
	return newTreeDiff(left, right)
}

// newTreeDiff instantiates a new TreeDiff - If left is a MetadataProvider and right a MetadataReceiver,
// it will set up metadata diff management
func newTreeDiff(left model.PathSyncSource, right model.PathSyncSource) *TreeDiff {
	t := &TreeDiff{
		//ctx:   ctx,
		left:  left,
		right: right,
	}
	mp, leftOk := left.(model.MetadataProvider)
	_, rightOk := right.(model.MetadataReceiver)
	if leftOk && rightOk {
		if globs, o := mp.ProvidesMetadataNamespaces(); o {
			t.includeMetas = globs
		}
	}
	return t
}

// Compute performs the actual diff between left and right
func (diff *TreeDiff) Compute(ctx context.Context, root string, lock chan bool, rootStats map[string]*model.EndpointRootStat, ignores ...glob.Glob) error {
	defer func() {
		diff.Done(true)
		// Wait that monitor has finished its messaging before returning function
		if lock != nil {
			<-lock
		}
	}()

	lTree := NewTree()
	rTree := NewTree()
	var errs []error
	wg := &sync.WaitGroup{}

	for _, k := range []string{"left", "right"} {
		wg.Add(1)
		go func(logId string) {
			start := time.Now()
			h := ""
			uri := diff.left.GetEndpointInfo().URI
			if logId == "right" {
				uri = diff.right.GetEndpointInfo().URI
			}
			defer func() {
				s := model.NewProcessingStatus(fmt.Sprintf("[%s] Snapshot loaded in %v - Root Hash is %s", logId, time.Since(start), h)).SetEndpoint(uri)
				diff.Status(s)
				wg.Done()
			}()
			st := model.NewProcessingStatus(fmt.Sprintf("[%s] Loading snapshot", logId)).SetEndpoint(uri)
			diff.Status(st)
			var err error
			if logId == "left" {
				if lTree, err = TreeNodeFromSource(ctx, diff.left, root, ignores, diff.includeMetas, diff.statusChan); err == nil {
					h = lTree.GetHash()
				}
			} else if logId == "right" {
				if rTree, err = TreeNodeFromSource(ctx, diff.right, root, ignores, diff.includeMetas, diff.statusChan); err == nil {
					h = rTree.GetHash()
				}
			}

			if err != nil {
				errs = append(errs, err)
			}
		}(k)
	}
	wg.Wait()
	if len(errs) > 0 {
		diff.Status(model.NewProcessingStatus("[TreeDiff] One side received an error").SetError(errs[0]))
		return errs[0]
	}

	diff.Status(model.NewProcessingStatus("Computing diff between snapshots"))

	// fmt.Println(lTree.PrintTree())
	// fmt.Println(rTree.PrintTree())

	// Additional check before creating diff
	if rootStats != nil {
		if lStat, o := rootStats[diff.left.GetEndpointInfo().URI]; o && lStat.IsKnown() {
			lCompare := lTree.ChildByPath(strings.TrimLeft(root, "/"))
			if (lCompare == nil || len(lCompare.SortedChildren()) == 0) && !lStat.IsEmpty() {
				fmt.Println("==> left stats :", lStat)
				fmt.Println("==> left tree :")
				lTree.PrintTree()
				return fmt.Errorf("unexpected error : endpoints stat and collected children discrepancy")
			}
		}
		if rStat, o := rootStats[diff.right.GetEndpointInfo().URI]; o && rStat.IsKnown() {
			rCompare := rTree.ChildByPath(strings.TrimLeft(root, "/"))
			if (rCompare == nil || len(rCompare.SortedChildren()) == 0) && !rStat.IsEmpty() {
				fmt.Println("==> right stats :", rStat)
				fmt.Println("==> right tree :")
				rTree.PrintTree()
				return fmt.Errorf("unexpected error : endpoints stat and collected children discrepancy")
			}
		}
	}

	diff.mergeNodes(lTree, rTree)
	log.Logger(ctx).Info("Diff Stats", zap.Any("s", diff.Stats()))

	diff.Status(model.NewProcessingStatus(fmt.Sprintf("Diff contents: missing left %v - missing right %v", len(diff.missingLeft), len(diff.missingRight))))
	return nil

}

// ToUnidirectionalPatch transforms this diff to a patch
func (diff *TreeDiff) ToUnidirectionalPatch(ctx context.Context, direction model.DirectionType, patch Patch) (err error) {

	_, rightOk := diff.right.(model.PathSyncTarget)
	_, leftOk := diff.left.(model.PathSyncTarget)

	if direction == model.DirectionRight && rightOk {
		diff.toMissing(ctx, patch, diff.missingRight, true, false)
		diff.toMissing(ctx, patch, diff.missingRight, false, false)
		diff.toMissing(ctx, patch, diff.missingLeft, false, true)
		diff.toMissingMeta(ctx, patch, diff.missingRight, false)
		diff.toMissingMeta(ctx, patch, diff.missingLeft, true)
	} else if direction == model.DirectionLeft && leftOk {
		diff.toMissing(ctx, patch, diff.missingLeft, true, false)
		diff.toMissing(ctx, patch, diff.missingLeft, false, false)
		diff.toMissing(ctx, patch, diff.missingRight, false, true)
		diff.toMissingMeta(ctx, patch, diff.missingLeft, false)
		diff.toMissingMeta(ctx, patch, diff.missingRight, true)
	} else {
		return errors.New("error while extracting unidirectional patch. either left or right is not a sync target")
	}
	// Enqueue ConflictFileContent as DataOperation of type OpUpdateFile
	for _, c := range diff.conflictsByType(ConflictFileContent) {
		var n tree.N
		if direction == model.DirectionRight {
			n = c.NodeLeft
		} else if direction == model.DirectionLeft {
			n = c.NodeRight
		} else {
			n = MostRecentNode(c.NodeLeft, c.NodeRight)
		}
		patch.Enqueue(NewOperation(OpUpdateFile, model.NodeToEventInfo(ctx, n.GetPath(), n, model.EventCreate), n))
	}
	// Enqueue ConflictMetaChanged as DataOperation of type OpUpdateMeta
	for _, c := range diff.conflictsByType(ConflictMetaChanged) {
		var n tree.N
		if direction == model.DirectionRight {
			n = c.NodeLeft
		} else {
			n = c.NodeRight
		}
		patch.Enqueue(NewOperation(OpUpdateMeta, model.NodeToEventInfo(ctx, n.GetPath(), n, model.EventCreate), n))
	}
	log.Logger(ctx).Info("Sending unidirectional patch", zap.Any("patch", patch.Stats()))
	return
}

// ToBidirectionalPatch computes a bidirectional patch from this diff using the given targets
func (diff *TreeDiff) ToBidirectionalPatch(ctx context.Context, leftTarget model.PathSyncTarget, rightTarget model.PathSyncTarget, patch *BidirectionalPatch) (err error) {

	var b *BidirectionalPatch
	defer func() {
		if b != nil {
			patch.AppendBranch(ctx, b)
		}
	}()

	diff.solveConflicts(ctx)

	leftPatch, rightPatch := diff.leftAndRightPatches(ctx, leftTarget, rightTarget)
	b, err = ComputeBidirectionalPatch(ctx, leftPatch, rightPatch)
	if err != nil {
		return
	}

	// Re-enqueue Diff conflicts to Patch conflicts
	for _, c := range diff.conflicts {
		var leftOp, rightOp Operation
		if c.NodeLeft.IsLeaf() {
			leftOp = NewOperation(OpCreateFile, model.EventInfo{Path: c.NodeLeft.GetPath()}, c.NodeLeft)
		} else {
			leftOp = NewOperation(OpCreateFolder, model.EventInfo{Path: c.NodeLeft.GetPath()}, c.NodeLeft)
		}
		if c.NodeRight.IsLeaf() {
			rightOp = NewOperation(OpCreateFile, model.EventInfo{Path: c.NodeRight.GetPath()}, c.NodeRight)
		} else {
			rightOp = NewOperation(OpCreateFolder, model.EventInfo{Path: c.NodeRight.GetPath()}, c.NodeRight)
		}
		b.Enqueue(NewConflictOperation(c.NodeLeft, c.Type, leftOp, rightOp))
	}
	if errs, ok := b.HasErrors(); ok {
		err = fmt.Errorf("diff has conflicts %v", errs)
	}
	return
}

// leftAndRightPatches provides two patches from this diff, to be used as input for a BidirectionalPatch computation
func (diff *TreeDiff) leftAndRightPatches(ctx context.Context, leftTarget model.PathSyncTarget, rightTarget model.PathSyncTarget) (leftPatch Patch, rightPatch Patch) {

	leftPatch = NewPatch(leftTarget.(model.PathSyncSource), rightTarget, PatchOptions{MoveDetection: true})
	if rightTarget != nil {
		diff.toMissing(ctx, leftPatch, diff.missingRight, true, false)
		diff.toMissing(ctx, leftPatch, diff.missingRight, false, false)
	}

	rightPatch = NewPatch(rightTarget.(model.PathSyncSource), leftTarget, PatchOptions{MoveDetection: true})
	if leftTarget != nil {
		diff.toMissing(ctx, rightPatch, diff.missingLeft, true, false)
		diff.toMissing(ctx, rightPatch, diff.missingLeft, false, false)
	}
	return

}

// Status sends status to internal channel
func (diff *TreeDiff) Status(status model.Status) {
	if diff.statusChan != nil {
		diff.statusChan <- status
	}
}

// SetupChannels registers status chan internally. Done chan is ignored
func (diff *TreeDiff) SetupChannels(status chan model.Status, done chan interface{}, cmd *model.Command) {
	diff.statusChan = status
	diff.doneChan = done
	diff.cmd = cmd
}

func (diff *TreeDiff) Done(info interface{}) {
	if diff.doneChan != nil {
		diff.doneChan <- info
	}
}

// String provides a string representation of this diff
func (diff *TreeDiff) String() string {
	output := ""
	if len(diff.missingLeft) > 0 {
		output += "\n missingLeft : "
		for _, node := range diff.missingLeft {
			output += "\n " + node.GetPath()
		}
	}
	if len(diff.missingRight) > 0 {
		output += "\n missingRight : "
		for _, node := range diff.missingRight {
			output += "\n " + node.GetPath()
		}
	}
	if len(diff.conflicts) > 0 {
		output += "\n Diverging conflicts : "
		for _, c := range diff.conflicts {
			output += "\n " + c.NodeLeft.GetPath()
		}
	}
	return output
}

// Stats provides info about the diff internals
func (diff *TreeDiff) Stats() map[string]interface{} {
	return map[string]interface{}{
		"EndpointLeft":  diff.left.GetEndpointInfo().URI,
		"EndpointRight": diff.right.GetEndpointInfo().URI,
		"missingLeft":   len(diff.missingLeft),
		"missingRight":  len(diff.missingRight),
		"conflicts":     len(diff.conflicts),
	}
}

// mergeNodes will recursively detect differences between two hash trees.
func (diff *TreeDiff) mergeNodes(left *TreeNode, right *TreeNode) {
	if left.GetHash() == right.GetHash() {
		return
	}
	if left.GetType() != right.GetType() {
		// N changed of type - Register conflict and keep browsing
		diff.conflicts = append(diff.conflicts, &DiffConflict{
			Type:      ConflictNodeType,
			NodeLeft:  left.N,
			NodeRight: right.N,
		})
	} else if !left.IsLeaf() && left.GetUuid() != right.GetUuid() {
		// Folder has different UUID - Register conflict and keep browsing
		diff.conflicts = append(diff.conflicts, &DiffConflict{
			Type:      ConflictFolderUUID,
			NodeLeft:  left.N,
			NodeRight: right.N,
		})
	} else if left.IsLeaf() && left.GetEtag() != right.GetEtag() {
		// Re-check that Etag differ - maybe the hash is composed of both eTag and metadata, and differ but NOT the Etag
		// Files content differ - Register conflict
		diff.conflicts = append(diff.conflicts, &DiffConflict{
			Type:      ConflictFileContent,
			NodeLeft:  left.N,
			NodeRight: right.N,
		})
		// return // do not return here, there might be children (metadata pieces)
	} else if left.GetType() == NodeType_METADATA {
		// Meta differ - Register conflict and return (no children after that)
		diff.conflicts = append(diff.conflicts, &DiffConflict{
			Type:      ConflictMetaChanged,
			NodeLeft:  left.N,
			NodeRight: right.N,
		})
		return
	}
	cL := left.GetCursor()
	cR := right.GetCursor()
	a := cL.Next()
	b := cR.Next()
	for a != nil || b != nil {
		if a != nil && b != nil {
			switch strings.Compare(a.Label(), b.Label()) {
			case 0:
				diff.mergeNodes(a, b)
				a = cL.Next()
				b = cR.Next()
				continue
			case 1:
				diff.missingLeft = b.Enqueue(diff.missingLeft)
				b = cR.Next()
				continue
			case -1:
				diff.missingRight = a.Enqueue(diff.missingRight)
				a = cL.Next()
				continue
			}
		} else if a == nil && b != nil {
			diff.missingLeft = b.Enqueue(diff.missingLeft)
			b = cR.Next()
			continue
		} else if b == nil && a != nil {
			diff.missingRight = a.Enqueue(diff.missingRight)
			a = cL.Next()
			continue
		}
	}
}

// toMissing transforms Missing slices to BatchEvents
func (diff *TreeDiff) toMissing(ctx context.Context, patch Patch, in []tree.N, folders bool, removes bool) {

	var eventType model.EventType
	var batchEventType OperationType
	if removes {
		eventType = model.EventRemove
		batchEventType = OpDelete
	} else {
		eventType = model.EventCreate
		if folders {
			batchEventType = OpCreateFolder
		} else {
			batchEventType = OpCreateFile
		}
	}

	for _, n := range in {
		if n.GetType() == NodeType_METADATA {
			continue
		}
		if removes || !folders && n.IsLeaf() || folders && !n.IsLeaf() {
			eventInfo := model.NodeToEventInfo(ctx, n.GetPath(), n, eventType)
			patch.Enqueue(NewOperation(batchEventType, eventInfo, n))
		}
	}

}

// toMissingMeta is similar to toMissing but only handle Metadata nodes
func (diff *TreeDiff) toMissingMeta(ctx context.Context, patch Patch, in []tree.N, removes bool) {
	var eventType model.EventType
	var batchEventType OperationType
	if removes {
		eventType = model.EventRemove
		batchEventType = OpDeleteMeta
	} else {
		eventType = model.EventCreate
		batchEventType = OpCreateMeta
	}
	for _, n := range in {
		if n.GetType() != NodeType_METADATA {
			continue
		}
		patch.Enqueue(NewOperation(batchEventType, model.NodeToEventInfo(ctx, n.GetPath(), n, eventType), n))
	}
}

// solveConflicts tries to fix existing conflicts and return remaining ones
func (diff *TreeDiff) solveConflicts(ctx context.Context) {

	right := diff.right
	left := diff.left
	var remaining []*DiffConflict

	// Try to refresh UUIDs on target
	var refresher model.UuidFoldersRefresher
	var canRefresh, refresherRight, refresherLeft bool
	if refresher, canRefresh = right.(model.UuidFoldersRefresher); canRefresh {
		refresherRight = true
	} else if refresher, canRefresh = left.(model.UuidFoldersRefresher); canRefresh {
		refresherLeft = true
	}
	for _, c := range diff.conflicts {
		var solved bool

		if c.Type == ConflictFolderUUID && canRefresh {
			var srcUuid tree.N
			if refresherRight {
				srcUuid = c.NodeLeft
			} else if refresherLeft {
				srcUuid = c.NodeRight
			}
			if _, e := refresher.UpdateFolderUuid(ctx, srcUuid); e == nil {
				solved = true
			}
		} else if c.Type == ConflictFileContent {
			// What can we do?
			log.Logger(ctx).Debug("Got a ConflictFileContent case in TreeDiff.solveConflict")
		}

		if !solved {
			remaining = append(remaining, c)
		}
	}

	diff.conflicts = remaining
}

// conflictsByType filters a slice of conflicts for a given type
func (diff *TreeDiff) conflictsByType(conflictType ConflictType) (conflicts []*DiffConflict) {
	for _, c := range diff.conflicts {
		if c.Type == conflictType {
			conflicts = append(conflicts, c)
		}
	}
	return
}
