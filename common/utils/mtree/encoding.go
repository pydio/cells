/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

// Package mtree provides advanced tools for encoding tree paths in a material format
package mtree

import (
	"sync"

	"github.com/pydio/cells/v4/common/proto/tree"
)

// TreeNode definition
type TreeNode struct {
	*tree.Node
	mutex      *sync.RWMutex
	MPath      MPath
	Level      int
	ChildIndex []int
}

// NewTreeNode wraps a node with its rational equivalent of the mpath
func NewTreeNode() *TreeNode {
	t := new(TreeNode)
	t.Node = new(tree.Node)
	t.MPath = MPath{}
	t.mutex = &sync.RWMutex{}

	return t
}

// SetMeta sets a meta using a lock
func (t *TreeNode) SetMeta(name string, value interface{}) {
	t.mutex.RLock()
	defer t.mutex.RUnlock()

	t.Node.MustSetMeta(name, value)
}

// GetMeta gets a meta from a meta store using the lock
func (t *TreeNode) GetMeta(name string, value interface{}) {
	t.mutex.Lock()
	defer t.mutex.Unlock()

	t.Node.GetMeta(name, value)
}

// SetName records the name of the node in the metastore (uses a lock)
func (t *TreeNode) SetName(name string) {
	t.SetMeta("name", name)
}

// Name from the metastore (uses a rwlock)
func (t *TreeNode) Name() string {
	var name string
	t.GetMeta("name", &name)
	return name
}

// SetMPath triggers the calculation of the rat representation and the sibling rat representation for the node
func (t *TreeNode) SetMPath(mpath ...uint64) {
	t.MPath = MPath(mpath)

	t.Level = len(mpath)
}

func (t *TreeNode) GetMPath() []uint64 {
	return t.MPath
}
