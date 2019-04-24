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
	FolderUUIDs  []*Conflict
	Context      context.Context
}

// FilterMissing transforms Missing slices to BatchEvents
func (diff *Diff) FilterMissing(batch *Batch, in []*tree.Node, folders bool, removes bool) (out map[string]*BatchEvent) {

	var eventType model.EventType
	if removes {
		eventType = model.EventRemove
	} else {
		eventType = model.EventCreate
	}
	out = make(map[string]*BatchEvent)
	for _, n := range in {
		if removes || !folders && n.IsLeaf() || folders && !n.IsLeaf() {
			eventInfo := model.NodeToEventInfo(diff.Context, n.Path, n, eventType)
			be := &BatchEvent{
				Key:       n.Path,
				Node:      n,
				EventInfo: eventInfo,
				Batch:     batch,
			}
			out[n.Path] = be
		}
	}
	return out

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
	if len(diff.FolderUUIDs) > 0 {
		output += "\n Diverging FolderUUIDs : "
		for _, c := range diff.FolderUUIDs {
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
		"FolderUUIDs":   len(diff.FolderUUIDs),
	}
}

// ToUnidirectionalBatch transforms this diff to a batch
func (diff *Diff) ToUnidirectionalBatch(direction model.DirectionType) (batch *Batch, err error) {

	rightTarget, rightOk := diff.Right.(model.PathSyncTarget)
	leftTarget, leftOk := diff.Left.(model.PathSyncTarget)

	if direction == model.DirectionRight && rightOk {
		batch = NewBatch(diff.Left, rightTarget)
		batch.CreateFolders = diff.FilterMissing(batch, diff.MissingRight, true, false)
		batch.CreateFiles = diff.FilterMissing(batch, diff.MissingRight, false, false)
		batch.Deletes = diff.FilterMissing(batch, diff.MissingLeft, false, true)
		return batch, nil
	} else if direction == model.DirectionLeft && leftOk {
		batch = NewBatch(diff.Right, leftTarget)
		batch.CreateFolders = diff.FilterMissing(batch, diff.MissingLeft, true, false)
		batch.CreateFiles = diff.FilterMissing(batch, diff.MissingLeft, false, false)
		batch.Deletes = diff.FilterMissing(batch, diff.MissingRight, false, true)
		return batch, nil
	}
	return nil, errors.New("error while extracting unidirectional batch. either left or right is not a sync target")

}

// ToBidirectionalBatch transforms this diff to a batch
func (diff *Diff) ToBidirectionalBatch(leftTarget model.PathSyncTarget, rightTarget model.PathSyncTarget) (batch *BidirectionalBatch, err error) {

	leftBatch := NewBatch(leftTarget.(model.PathSyncSource), rightTarget)
	if rightTarget != nil {
		leftBatch.CreateFolders = diff.FilterMissing(leftBatch, diff.MissingRight, true, false)
		leftBatch.CreateFiles = diff.FilterMissing(leftBatch, diff.MissingRight, false, false)
	}

	rightBatch := NewBatch(rightTarget.(model.PathSyncSource), leftTarget)
	if leftTarget != nil {
		rightBatch.CreateFolders = diff.FilterMissing(rightBatch, diff.MissingLeft, true, false)
		rightBatch.CreateFiles = diff.FilterMissing(rightBatch, diff.MissingLeft, false, false)
	}

	batch = &BidirectionalBatch{
		Left:  leftBatch,
		Right: rightBatch,
	}
	return batch, nil

}
