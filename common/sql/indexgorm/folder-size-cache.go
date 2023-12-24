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

package index

import (
	"context"
	"sync"

	"github.com/pydio/cells/v4/common/proto/tree"
)

var (
	folderSizeCache = make(map[string]int)
	folderSizeLock  = &sync.RWMutex{}
)

// FolderSizeCacheSQL implementation
type FolderSizeCacheSQL struct {
	DAO
}

// NewFolderSizeCacheDAO provides a middleware implementation of the index sql dao that removes duplicate entries of the .pydio file that have the same etag at the same level
func NewFolderSizeCacheDAO(dao DAO) DAO {
	return &FolderSizeCacheSQL{
		dao,
	}
}

// GetNode from path
func (dao *FolderSizeCacheSQL) GetNode(ctx context.Context, path *tree.MPath) (tree.ITreeNode, error) {

	node, err := dao.DAO.GetNode(nil, path)
	if err != nil {
		return nil, err
	}

	if node != nil && !node.GetNode().IsLeaf() {
		dao.folderSize(node)
	}

	return node, nil
}

// GetNodeByUUID returns the node stored with the unique uuid
func (dao *FolderSizeCacheSQL) GetNodeByUUID(ctx context.Context, uuid string) (tree.ITreeNode, error) {

	node, err := dao.DAO.GetNodeByUUID(ctx, uuid)
	if err != nil {
		return nil, err
	}

	if node != nil && !node.GetNode().IsLeaf() {
		dao.folderSize(node)
	}

	return node, nil
}

// GetNodeChildren List
func (dao *FolderSizeCacheSQL) GetNodeChildren(ctx context.Context, path *tree.MPath, filter ...*tree.MetaFilter) chan interface{} {
	c := make(chan interface{})

	go func() {
		defer close(c)

		cc := dao.DAO.GetNodeChildren(ctx, path, filter...)

		for obj := range cc {
			if node, ok := obj.(*tree.TreeNode); ok {
				if node != nil && !node.GetNode().IsLeaf() {
					dao.folderSize(node)
				}
			}

			select {
			case c <- obj:
			case <-ctx.Done():
				return
			}
		}
	}()

	return c
}

// GetNodeTree List from the path
func (dao *FolderSizeCacheSQL) GetNodeTree(ctx context.Context, path *tree.MPath, filter ...*tree.MetaFilter) chan interface{} {
	c := make(chan interface{})

	go func() {
		defer close(c)

		cc := dao.DAO.GetNodeTree(ctx, path, filter...)

		for obj := range cc {
			if node, ok := obj.(*tree.TreeNode); ok {
				if node != nil && !node.GetNode().IsLeaf() {
					dao.folderSize(node)
				}
			}
			select {
			case c <- obj:
			case <-ctx.Done():
				return
			}
		}
	}()

	return c
}

func (dao *FolderSizeCacheSQL) Path(ctx context.Context, node tree.ITreeNode, create bool) (*tree.MPath, []tree.ITreeNode, error) {
	mpath, nodes, err := dao.DAO.Path(ctx, node, create)

	if create {
		go dao.invalidateMPathHierarchy(mpath, -1)
	}

	return mpath, nodes, err
}

// AddNode adds a node in the tree.
func (dao *FolderSizeCacheSQL) AddNode(ctx context.Context, node tree.ITreeNode) error {
	dao.invalidateMPathHierarchy(node.GetMPath(), -1)
	return dao.DAO.AddNode(nil, node)
}

// SetNode updates a node, including its tree position
func (dao *FolderSizeCacheSQL) SetNode(ctx context.Context, node tree.ITreeNode) error {
	dao.invalidateMPathHierarchy(node.GetMPath(), -1)
	return dao.DAO.SetNode(nil, node)
}

// DelNode removes a node from the tree
func (dao *FolderSizeCacheSQL) DelNode(ctx context.Context, node tree.ITreeNode) error {
	dao.invalidateMPathHierarchy(node.GetMPath(), -1)
	return dao.DAO.DelNode(nil, node)
}

// MoveNodeTree move all the nodes belonging to a tree by calculating the new mpathes
func (dao *FolderSizeCacheSQL) MoveNodeTree(ctx context.Context, nodeFrom tree.ITreeNode, nodeTo tree.ITreeNode) error {
	root := nodeTo.GetMPath().CommonRoot(nodeFrom.GetMPath())

	dao.invalidateMPathHierarchy(nodeTo.GetMPath(), root.Length())
	dao.invalidateMPathHierarchy(nodeFrom.GetMPath(), root.Length())

	return dao.DAO.MoveNodeTree(ctx, nodeFrom, nodeTo)
}

func (dao *FolderSizeCacheSQL) invalidateMPathHierarchy(mpath *tree.MPath, level int) {

	parents := mpath.Parents()
	if level > -1 {
		parents = mpath.Parents()[level:]
	}

	folderSizeLock.Lock()
	delete(folderSizeCache, mpath.ToString())
	folderSizeLock.Unlock()

	for _, p := range parents {
		folderSizeLock.Lock()
		delete(folderSizeCache, p.ToString())
		folderSizeLock.Unlock()
	}
}

// Compute sizes from children files - Does not handle lock, should be
// used by other functions handling lock
func (dao *FolderSizeCacheSQL) folderSize(node tree.ITreeNode) {

	mpath := node.GetMPath().ToString()

	folderSizeLock.RLock()
	size, ok := folderSizeCache[mpath]
	folderSizeLock.RUnlock()

	if ok {
		node.GetNode().SetSize(int64(size))
		return
	}

	size, err := dao.GetNodeChildrenSize(nil, node.GetMPath())
	if err != nil {
		return
	}

	node.GetNode().SetSize(int64(size))

	folderSizeLock.Lock()
	folderSizeCache[mpath] = size
	folderSizeLock.Unlock()
}
