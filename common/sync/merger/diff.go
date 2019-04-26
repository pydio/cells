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

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

// Diff represent basic differences between two sources
// It can be then transformed to Batch, depending on the sync being
// unidirectional (transform to Creates and Deletes) or bidirectional (transform only to Creates)
type Diff struct {
	Left         model.PathSyncSource
	Right        model.PathSyncSource
	MissingLeft  []*tree.Node
	MissingRight []*tree.Node
	Conflicts    []*Conflict
	Context      context.Context
}

// FilterMissing transforms Missing slices to BatchEvents
func (diff *Diff) FilterMissing(batch Batch, in []*tree.Node, folders bool, removes bool) {

	var eventType model.EventType
	var batchEventType BatchOperationType
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
			eventInfo := model.NodeToEventInfo(diff.Context, n.Path, n, eventType)
			batch.Enqueue(&BatchOperation{
				Key:       n.Path,
				Type:      batchEventType,
				Node:      n,
				EventInfo: eventInfo,
				Batch:     batch,
			})
		}
	}

}

// String provides a string representation of this diff
func (diff *Diff) String() string {
	output := ""
	if len(diff.MissingLeft) > 0 {
		output += "\n MissingLeft : "
		for _, node := range diff.MissingLeft {
			output += "\n " + node.Path
		}
	}
	if len(diff.MissingRight) > 0 {
		output += "\n MissingRight : "
		for _, node := range diff.MissingRight {
			output += "\n " + node.Path
		}
	}
	if len(diff.Conflicts) > 0 {
		output += "\n Diverging Conflicts : "
		for _, c := range diff.Conflicts {
			output += "\n " + c.NodeLeft.Path
		}
	}
	return output
}

func (diff *Diff) Stats() map[string]interface{} {
	return map[string]interface{}{
		"EndpointLeft":  diff.Left.GetEndpointInfo().URI,
		"EndpointRight": diff.Right.GetEndpointInfo().URI,
		"MissingLeft":   len(diff.MissingLeft),
		"MissingRight":  len(diff.MissingRight),
		"Conflicts":     len(diff.Conflicts),
	}
}

// ToUnidirectionalBatch transforms this diff to a batch
func (diff *Diff) ToUnidirectionalBatch(direction model.DirectionType) (batch Batch, err error) {

	rightTarget, rightOk := diff.Right.(model.PathSyncTarget)
	leftTarget, leftOk := diff.Left.(model.PathSyncTarget)

	if direction == model.DirectionRight && rightOk {
		batch = NewSimpleBatch(diff.Left, rightTarget)
		diff.FilterMissing(batch, diff.MissingRight, true, false)
		diff.FilterMissing(batch, diff.MissingRight, false, false)
		diff.FilterMissing(batch, diff.MissingLeft, false, true)
	} else if direction == model.DirectionLeft && leftOk {
		batch = NewSimpleBatch(diff.Right, leftTarget)
		diff.FilterMissing(batch, diff.MissingLeft, true, false)
		diff.FilterMissing(batch, diff.MissingLeft, false, false)
		diff.FilterMissing(batch, diff.MissingRight, false, true)
	} else {
		return nil, errors.New("error while extracting unidirectional batch. either left or right is not a sync target")
	}
	for _, c := range ConflictsByType(diff.Conflicts, ConflictFileContent) {
		n := MostRecentNode(c.NodeLeft, c.NodeRight)
		batch.Enqueue(&BatchOperation{
			Key:       n.Path,
			Type:      OpUpdateFile,
			Batch:     batch,
			Node:      n,
			EventInfo: model.NodeToEventInfo(diff.Context, n.Path, n, model.EventCreate),
		})
	}
	return
}

// ToBidirectionalBatch transforms this diff to a batch
func (diff *Diff) ToBidirectionalBatch(leftTarget model.PathSyncTarget, rightTarget model.PathSyncTarget) (batch *BidirectionalBatch, err error) {

	leftBatch := NewSimpleBatch(leftTarget.(model.PathSyncSource), rightTarget)
	if rightTarget != nil {
		diff.FilterMissing(leftBatch, diff.MissingRight, true, false)
		diff.FilterMissing(leftBatch, diff.MissingRight, false, false)
	}

	rightBatch := NewSimpleBatch(rightTarget.(model.PathSyncSource), leftTarget)
	if leftTarget != nil {
		diff.FilterMissing(rightBatch, diff.MissingLeft, true, false)
		diff.FilterMissing(rightBatch, diff.MissingLeft, false, false)
	}

	batch = &BidirectionalBatch{
		Left:  leftBatch,
		Right: rightBatch,
	}
	return batch, nil

}
