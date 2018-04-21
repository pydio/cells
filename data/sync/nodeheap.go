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
	"sync"
	"unsafe"

	"github.com/emirpasic/gods/trees/binaryheap"
	"github.com/emirpasic/gods/utils"
	"github.com/pkg/errors"
	"github.com/pydio/cells/common/proto/tree"
)

type heapType string

const (
	heapMin heapType = "min"
	heapMax heapType = "max"
)

type heapIter binaryheap.Iterator

func (i *heapIter) Next() bool { return (*binaryheap.Iterator)(unsafe.Pointer(i)).Next() }
func (i *heapIter) Node() *tree.Node {
	return (*binaryheap.Iterator)(unsafe.Pointer(i)).Value().(*tree.Node)
}

type pathGetter interface {
	GetPath() string
}

func pathComparator(a, b interface{}) int {
	return utils.ByteComparator(a.(pathGetter).GetPath(), b.(pathGetter).GetPath())
}

type nodeHeap binaryheap.Heap

func newHeap(t heapType) *nodeHeap {
	if t == heapMin {
		return (*nodeHeap)(binaryheap.NewWith(pathComparator))
	} else if t == heapMax {
		return (*nodeHeap)(binaryheap.NewWith(func(a, b interface{}) int {
			return -pathComparator(a, b)
		}))
	}

	panic(errors.Errorf("unknown heapType %s", t))
}

func (h *nodeHeap) Clear()            { (*binaryheap.Heap)(unsafe.Pointer(h)).Clear() }
func (h *nodeHeap) Empty() bool       { return (*binaryheap.Heap)(unsafe.Pointer(h)).Empty() }
func (h *nodeHeap) Push(n *tree.Node) { (*binaryheap.Heap)(unsafe.Pointer(h)).Push(n) }

func (h *nodeHeap) Pop() (n *tree.Node, ok bool) {
	var v interface{}
	if v, ok = (*binaryheap.Heap)(unsafe.Pointer(h)).Pop(); ok {
		n = v.(*tree.Node)
	}
	return
}

func (h *nodeHeap) Iter() heapIter {
	return (heapIter)((*binaryheap.Heap)(unsafe.Pointer(h)).Iterator())
}

type syncHeap struct {
	sync.Mutex
	nh *nodeHeap
}

func (h *syncHeap) Clear() {
	h.Lock()
	h.nh.Clear()
	h.Unlock()
}

func (h *syncHeap) Empty() (empty bool) {
	h.Lock()
	empty = h.nh.Empty()
	h.Unlock()
	return
}

func (h *syncHeap) Push(n *tree.Node) {
	h.Lock()
	h.nh.Push(n)
	h.Unlock()
}

func (h *syncHeap) Pop() (n *tree.Node, ok bool) {
	h.Lock()
	n, ok = h.nh.Pop()
	h.Unlock()
	return
}

func (h *syncHeap) Iter() (it heapIter, done func()) {
	h.Lock()
	return h.nh.Iter(), h.Unlock
}
