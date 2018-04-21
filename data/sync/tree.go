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

package sync

import (
	"context"

	"github.com/pkg/errors"

	"github.com/pydio/cells/common/proto/tree"
)

//
// tools for manipulating tree structures
//

type nodeFunc func(*tree.Node)

// mapTraversal applies a recursively descends a Pydio datasource (depth-first),
// applying a nodeFunc to each node.
func mapTraversal(ctx context.Context, c EndpointClient, f nodeFunc) (err error) {
	var ok bool
	var node *tree.Node

	q := newStack() // depth-first seach
	if node, err = c.GetRoot(ctx); err != nil {
		return
	}
	if node == nil { // Sanity check
		panic(errors.New("Assertion failed:  node is nil"))
	}

	q.Push(node)

	seen := newVolatileSet()
	for !q.Empty() {
		if node, ok = q.Pop(); !ok {
			panic(errors.New("stack unexpectedly empty")) // unreachable
		}

		if !seen.Contains(node) {
			seen.Add(node)
			f(node)

			// OPTIMIZATION: only request children for collection-type nodes
			if !node.IsLeaf() {
				var children chan *tree.Node
				if children, err = c.GetChildren(ctx, node.Path); err != nil {
					return errors.Wrap(err, "failed to fetch node's children")
				}

				for node = range children {
					q.Push(node)
				}
			}
		}
	}

	return
}
