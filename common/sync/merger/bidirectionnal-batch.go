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
	"strings"

	"github.com/pydio/cells/common/sync/model"
)

type BidirectionalBatch struct {
	Left  Batch
	Right Batch
}

// Merge takes consider current batches are delta B(t-1) -> B(t) and merge them as proper instructions
func (b *BidirectionalBatch) Merge(ctx context.Context) error {

	// Naive Merge - Cross Targets
	lt, _ := model.AsPathSyncTarget(b.Left.Source())
	rt, _ := model.AsPathSyncTarget(b.Right.Source())

	b.Left.Target(rt)
	b.Right.Target(lt)

	b.Left.FilterToTarget(ctx)
	b.Right.FilterToTarget(ctx)

	return nil
}

func (b *BidirectionalBatch) String() string {
	var lines []string
	l := b.Left.String()
	if l != "" {
		lines = append(lines, l)
	}
	r := b.Right.String()
	if r != "" {
		lines = append(lines, r)
	}
	return strings.Join(lines, "\n")
}

func (b *BidirectionalBatch) Stats() map[string]interface{} {
	return map[string]interface{}{
		"Left":  b.Left.Stats(),
		"Right": b.Right.Stats(),
	}
}
