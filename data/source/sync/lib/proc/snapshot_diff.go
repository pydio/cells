/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package proc

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/data/source/sync/lib/common"
	"github.com/pydio/cells/data/source/sync/lib/filters"
)

// SourceDiff represent basic differences between two sources
// It can be then transformed to Batch, depending on the sync being
// unidirectional (transform to Creates and Deletes) or bidirectional (transform only to Creates)
type SourceDiff struct {
	Left         common.PathSyncSource
	Right        common.PathSyncSource
	MissingLeft  []*tree.Node
	MissingRight []*tree.Node
	Context      context.Context
}

// ComputeSourceDiff loads the diff by crawling the sources in parallel, filling up a Hash Tree and performing the merge
func ComputeSourcesDiff(ctx context.Context, left common.PathSyncSource, right common.PathSyncSource, strong bool, statusChan chan filters.BatchProcessStatus) (diff *SourceDiff, err error) {

	diff = &SourceDiff{
		Left:    left,
		Right:   right,
		Context: ctx,
	}

	lTree := NewTreeNode(&tree.Node{Path: "", Etag: "-1"})
	rTree := NewTreeNode(&tree.Node{Path: "", Etag: "-1"})
	var errs []error
	wg := &sync.WaitGroup{}

	for _, k := range []string{"left", "right"} {
		wg.Add(1)
		go func(logId string) {
			start := time.Now()
			h := ""
			defer func() {
				if statusChan != nil {
					statusChan <- filters.BatchProcessStatus{StatusString: fmt.Sprintf("[%s] Snapshot loaded in %v - Root Hash is %s", logId, time.Now().Sub(start), h)}
				}
				wg.Done()
			}()
			if statusChan != nil {
				statusChan <- filters.BatchProcessStatus{StatusString: fmt.Sprintf("[%s] Loading snapshot", logId)}
			}
			var err error
			if logId == "left" {
				lTree, err = TreeNodeFromSource(left)
				h = lTree.GetHash()
			} else if logId == "right" {
				rTree, err = TreeNodeFromSource(right)
				h = rTree.GetHash()
			}
			if err != nil {
				errs = append(errs, err)
			}
		}(k)
	}
	wg.Wait()
	if len(errs) > 0 {
		return nil, errs[0]
	}

	if statusChan != nil {
		statusChan <- filters.BatchProcessStatus{StatusString: "Now computing diff between snapshots"}
	}

	treeMerge := &SourceDiff{
		Left:    left,
		Right:   right,
		Context: ctx,
	}
	MergeNodes(lTree, rTree, treeMerge)

	if statusChan != nil {
		statusChan <- filters.BatchProcessStatus{StatusString: fmt.Sprintf("Diff contents: missing left %v - missing right %v", len(diff.MissingLeft), len(diff.MissingRight))}
	}
	return treeMerge, nil
}

// FilterMissing transforms Missing slices to BatchEvents
func (diff *SourceDiff) FilterMissing(source common.PathSyncSource, target common.PathSyncTarget, in []*tree.Node, folders bool, removes bool) (out map[string]*filters.BatchedEvent) {

	var eventType common.EventType
	if removes {
		eventType = common.EventRemove
	} else {
		eventType = common.EventCreate
	}
	out = make(map[string]*filters.BatchedEvent)
	for _, n := range in {
		if removes || !folders && n.IsLeaf() || folders && !n.IsLeaf() {
			eventInfo := common.NodeToEventInfo(diff.Context, n.Path, n, eventType)
			be := &filters.BatchedEvent{
				Key:       n.Path,
				Node:      n,
				EventInfo: eventInfo,
				Source:    source,
				Target:    target,
			}
			out[n.Path] = be
		}
	}
	return out

}

// String provides a string representation of this diff
func (diff *SourceDiff) String() string {
	output := ""
	output += "\n MissingLeft : "
	for _, node := range diff.MissingLeft {
		output += "\n " + node.Path
	}
	output += "\n MissingRight : "
	for _, node := range diff.MissingRight {
		output += "\n " + node.Path
	}
	return output
}

// ToUnidirectionalBatch transforms this diff to a batch
func (diff *SourceDiff) ToUnidirectionalBatch(direction string) (batch *filters.Batch, err error) {

	rightTarget, rightOk := interface{}(diff.Right).(common.PathSyncTarget)
	leftTarget, leftOk := interface{}(diff.Left).(common.PathSyncTarget)

	if direction == "left" && rightOk {
		batch = filters.NewBatch()
		batch.CreateFolders = diff.FilterMissing(diff.Left, rightTarget, diff.MissingRight, true, false)
		batch.CreateFiles = diff.FilterMissing(diff.Left, rightTarget, diff.MissingRight, false, false)
		batch.Deletes = diff.FilterMissing(diff.Left, rightTarget, diff.MissingLeft, false, true)
		return batch, nil
	} else if direction == "right" && leftOk {
		batch = filters.NewBatch()
		batch.CreateFolders = diff.FilterMissing(diff.Right, leftTarget, diff.MissingLeft, true, false)
		batch.CreateFiles = diff.FilterMissing(diff.Right, leftTarget, diff.MissingLeft, false, false)
		batch.Deletes = diff.FilterMissing(diff.Right, leftTarget, diff.MissingRight, false, true)
		return batch, nil
	}
	return nil, errors.New("Error while extracting unidirectional batch. Either left or right is not a sync target")

}

// ToBidirectionalBatch transforms this diff to a batch
func (diff *SourceDiff) ToBidirectionalBatch(leftTarget common.PathSyncTarget, rightTarget common.PathSyncTarget) (batch *filters.BidirectionalBatch, err error) {

	leftBatch := filters.NewBatch()
	if rightTarget != nil {
		leftBatch.CreateFolders = diff.FilterMissing(diff.Left, rightTarget, diff.MissingRight, true, false)
		leftBatch.CreateFiles = diff.FilterMissing(diff.Left, rightTarget, diff.MissingRight, false, false)
	}

	rightBatch := filters.NewBatch()
	if leftTarget != nil {
		rightBatch.CreateFolders = diff.FilterMissing(diff.Right, leftTarget, diff.MissingLeft, true, false)
		rightBatch.CreateFiles = diff.FilterMissing(diff.Right, leftTarget, diff.MissingLeft, false, false)
	}

	batch = &filters.BidirectionalBatch{
		Left:  leftBatch,
		Right: rightBatch,
	}
	return batch, nil

}
