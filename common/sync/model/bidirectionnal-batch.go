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

package model

import (
	"context"

	"github.com/micro/go-micro/errors"

	"github.com/pydio/cells/common/log"
)

type BidirectionalBatch struct {
	Left  *Batch
	Right *Batch
}

// Merge takes consider current batches are delta B(t-1) -> B(t) and merge them as proper instructions
func (b *BidirectionalBatch) Merge(ctx context.Context) error {

	// Naive Merge - Cross Targets
	lt, _ := AsPathSyncTarget(b.Left.Source)
	rt, _ := AsPathSyncTarget(b.Right.Source)

	b.Left.Target = rt
	b.Right.Target = lt
	//b.Right.Source = rt
	b.Filter(ctx, b.Left)
	b.Filter(ctx, b.Right)

	return nil
}

func (b *BidirectionalBatch) Filter(ctx context.Context, batch *Batch) {
	for p, e := range batch.CreateFiles {
		// Check it's not already on target
		if node, err := e.Target().LoadNode(ctx, p); err == nil && node.Etag == e.Node.Etag {
			log.Logger(ctx).Debug("Skipping Create File", node.Zap())
			delete(batch.CreateFiles, p)
		}
	}
	for p, e := range batch.CreateFolders {
		// Check it's not already on target
		if node, err := e.Target().LoadNode(ctx, p); err == nil {
			log.Logger(ctx).Debug("Skipping Create Folder", node.Zap())
			delete(batch.CreateFolders, p)
		}
	}
	for p, e := range batch.Deletes {
		// Check it's not already on target
		if _, err := e.Target().LoadNode(ctx, p); err != nil && errors.Parse(err.Error()).Code == 404 {
			log.Logger(ctx).Debug("Skipping Delete for path " + p)
			delete(batch.Deletes, p)
		}
	}
	for p, e := range batch.FolderMoves {
		// Check it's not already on target
		if n, err := e.Target().LoadNode(ctx, p); err == nil {
			log.Logger(ctx).Debug("Skipping Folder move", n.Zap())
			delete(batch.FolderMoves, p)
		}
	}
	for p, e := range batch.FileMoves {
		// Check it's not already on target
		if n, err := e.Target().LoadNode(ctx, p); err == nil && n.Etag == e.Node.Etag {
			log.Logger(ctx).Debug("Skipping File move for path " + p)
			delete(batch.FileMoves, p)
		}
	}
}

func (b *BidirectionalBatch) String() string {
	return b.Left.String() + "\n" + b.Right.String()
}

func (b *BidirectionalBatch) Stats() map[string]interface{} {
	return map[string]interface{}{
		"Left":  b.Left.Stats(),
		"Right": b.Right.Stats(),
	}
}
