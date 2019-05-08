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

type BidirectionalPatch struct {
	Left  Patch
	Right Patch
}

// Merge takes consider current batches are delta B(t-1) -> B(t) and merge them as proper instructions
func (p *BidirectionalPatch) Merge(ctx context.Context) error {

	// Naive Merge - Cross Targets
	lt, _ := model.AsPathSyncTarget(p.Left.Source())
	rt, _ := model.AsPathSyncTarget(p.Right.Source())

	p.Left.Target(rt)
	p.Right.Target(lt)

	p.Left.FilterToTarget(ctx)
	p.Right.FilterToTarget(ctx)

	return nil
}

func (p *BidirectionalPatch) String() string {
	var lines []string
	l := p.Left.String()
	if l != "" {
		lines = append(lines, l)
	}
	r := p.Right.String()
	if r != "" {
		lines = append(lines, r)
	}
	return strings.Join(lines, "\n")
}

func (p *BidirectionalPatch) Stats() map[string]interface{} {
	return map[string]interface{}{
		"Left":  p.Left.Stats(),
		"Right": p.Right.Stats(),
	}
}
