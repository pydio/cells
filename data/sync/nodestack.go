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
	"unsafe"

	"github.com/emirpasic/gods/stacks/arraystack"
	"github.com/pydio/cells/common/proto/tree"
)

type stackIter arraystack.Iterator

func (i *stackIter) Next() bool { return (*arraystack.Iterator)(unsafe.Pointer(i)).Next() }
func (i *stackIter) Node() *tree.Node {
	return (*arraystack.Iterator)(unsafe.Pointer(i)).Value().(*tree.Node)
}

type nodeStack arraystack.Stack

func newStack() *nodeStack { return (*nodeStack)(arraystack.New()) }

func (n *nodeStack) Push(nd *tree.Node) {
	(*arraystack.Stack)(unsafe.Pointer(n)).Push(nd)
}

func (n *nodeStack) Empty() bool {
	return (*arraystack.Stack)(unsafe.Pointer(n)).Empty()
}

func (n *nodeStack) Pop() (t *tree.Node, ok bool) {
	var v interface{}
	if v, ok = (*arraystack.Stack)(unsafe.Pointer(n)).Pop(); ok {
		t = v.(*tree.Node)
	}
	return
}

func (n *nodeStack) Iter() stackIter {
	return (stackIter)((*arraystack.Stack)(unsafe.Pointer(n)).Iterator())
}
