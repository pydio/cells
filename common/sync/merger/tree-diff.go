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
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/gobwas/glob"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

// Diff represent basic differences between two sources
// It can be then transformed to Patch, depending on the sync being
// unidirectional (transform to Creates and Deletes) or bidirectional (transform only to Creates)
type TreeDiff struct {
	left  model.PathSyncSource
	right model.PathSyncSource

	missingLeft  []*tree.Node
	missingRight []*tree.Node
	conflicts    []*Conflict
	ctx          context.Context

	cmd        *model.Command
	statusChan chan model.ProcessStatus
	doneChan   chan interface{}
}

// newTreeDiff instanciate a new TreeDiff
func newTreeDiff(ctx context.Context, left model.PathSyncSource, right model.PathSyncSource) *TreeDiff {
	return &TreeDiff{
		ctx:   ctx,
		left:  left,
		right: right,
	}
}

// Compute performs the actual diff between left and right
func (diff *TreeDiff) Compute(root string, ignores ...glob.Glob) error {
	defer diff.Done(true)

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
			if k == "right" {
				uri = diff.right.GetEndpointInfo().URI
			}
			defer func() {
				diff.Status(model.ProcessStatus{
					EndpointURI:  uri,
					StatusString: fmt.Sprintf("[%s] Snapshot loaded in %v - Root Hash is %s", logId, time.Now().Sub(start), h),
				})
				wg.Done()
			}()
			diff.Status(model.ProcessStatus{StatusString: fmt.Sprintf("[%s] Loading snapshot", logId)})
			var err error
			if logId == "left" {
				if lTree, err = TreeNodeFromSource(diff.left, root, ignores, diff.statusChan); err == nil {
					h = lTree.GetHash()
				}
			} else if logId == "right" {
				if rTree, err = TreeNodeFromSource(diff.right, root, ignores, diff.statusChan); err == nil {
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
		return errs[0]
	}

	diff.Status(model.ProcessStatus{StatusString: "Now computing diff between snapshots"})

	//lTree.PrintOut()
	//rTree.PrintOut()
	diff.mergeNodes(lTree, rTree)
	log.Logger(diff.ctx).Info("Diff Stats", zap.Any("s", diff.Stats()))

	diff.Status(model.ProcessStatus{StatusString: fmt.Sprintf("Diff contents: missing left %v - missing right %v", len(diff.missingLeft), len(diff.missingRight))})
	return nil

}

// ToUnidirectionalPatch transforms this diff to a patch
func (diff *TreeDiff) ToUnidirectionalPatch(direction model.DirectionType) (patch Patch, err error) {

	rightTarget, rightOk := diff.right.(model.PathSyncTarget)
	leftTarget, leftOk := diff.left.(model.PathSyncTarget)

	if direction == model.DirectionRight && rightOk {
		patch = NewPatch(diff.left, rightTarget, PatchOptions{MoveDetection: true})
		diff.toMissing(patch, diff.missingRight, true, false)
		diff.toMissing(patch, diff.missingRight, false, false)
		diff.toMissing(patch, diff.missingLeft, false, true)
	} else if direction == model.DirectionLeft && leftOk {
		patch = NewPatch(diff.right, leftTarget, PatchOptions{MoveDetection: true})
		diff.toMissing(patch, diff.missingLeft, true, false)
		diff.toMissing(patch, diff.missingLeft, false, false)
		diff.toMissing(patch, diff.missingRight, false, true)
	} else {
		return nil, errors.New("error while extracting unidirectional patch. either left or right is not a sync target")
	}
	for _, c := range ConflictsByType(diff.conflicts, ConflictFileContent) {
		n := MostRecentNode(c.NodeLeft, c.NodeRight)
		patch.Enqueue(NewOperation(OpUpdateFile, model.NodeToEventInfo(diff.ctx, n.Path, n, model.EventCreate), n))
	}
	log.Logger(diff.ctx).Info("Sending Unidirectionnal patch", zap.Any("patch", patch.Stats()))
	//fmt.Println(patch)
	return
}

// ToBidirectionalPatch transforms this diff to a patch
func (diff *TreeDiff) ToBidirectionalPatches(leftTarget model.PathSyncTarget, rightTarget model.PathSyncTarget) (leftPatch Patch, rightPatch Patch) {

	leftPatch = NewPatch(leftTarget.(model.PathSyncSource), rightTarget, PatchOptions{MoveDetection: true})
	if rightTarget != nil {
		diff.toMissing(leftPatch, diff.missingRight, true, false)
		diff.toMissing(leftPatch, diff.missingRight, false, false)
	}

	rightPatch = NewPatch(rightTarget.(model.PathSyncSource), leftTarget, PatchOptions{MoveDetection: true})
	if leftTarget != nil {
		diff.toMissing(rightPatch, diff.missingLeft, true, false)
		diff.toMissing(rightPatch, diff.missingLeft, false, false)
	}
	return

}

// conflicts list discovered conflicts
func (diff *TreeDiff) Conflicts() []*Conflict {
	return diff.conflicts
}

// Status sends status to internal channel
func (diff *TreeDiff) Status(status model.ProcessStatus) {
	if diff.statusChan != nil {
		diff.statusChan <- status
	}
}

// SetupChannels registers status chan internally. Done chan is ignored
func (diff *TreeDiff) SetupChannels(status chan model.ProcessStatus, done chan interface{}, cmd *model.Command) {
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
			output += "\n " + node.Path
		}
	}
	if len(diff.missingRight) > 0 {
		output += "\n missingRight : "
		for _, node := range diff.missingRight {
			output += "\n " + node.Path
		}
	}
	if len(diff.conflicts) > 0 {
		output += "\n Diverging conflicts : "
		for _, c := range diff.conflicts {
			output += "\n " + c.NodeLeft.Path
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
	if left.Type != right.Type {
		// Node changed of type - Register conflict and keep browsing
		diff.conflicts = append(diff.conflicts, &Conflict{
			Type:      ConflictNodeType,
			NodeLeft:  &left.Node,
			NodeRight: &right.Node,
		})
	} else if !left.IsLeaf() && left.Uuid != right.Uuid {
		// Folder has different UUID - Register conflict and keep browsing
		diff.conflicts = append(diff.conflicts, &Conflict{
			Type:      ConflictFolderUUID,
			NodeLeft:  &left.Node,
			NodeRight: &right.Node,
		})
	} else if left.IsLeaf() {
		// Files differ - Register conflict and return (no children)
		diff.conflicts = append(diff.conflicts, &Conflict{
			Type:      ConflictFileContent,
			NodeLeft:  &left.Node,
			NodeRight: &right.Node,
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
func (diff *TreeDiff) toMissing(patch Patch, in []*tree.Node, folders bool, removes bool) {

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
		if removes || !folders && n.IsLeaf() || folders && !n.IsLeaf() {
			eventInfo := model.NodeToEventInfo(diff.ctx, n.Path, n, eventType)
			patch.Enqueue(NewOperation(batchEventType, eventInfo, n))
		}
	}

}
