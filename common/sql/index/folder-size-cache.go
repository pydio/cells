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
	"fmt"
	"sync"

	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/mtree"
)

var (
	folderSizeCache = make(map[string]int64)
	folderSizeLock  = &sync.RWMutex{}
)

// FolderSizeCacheSQL implementation
type FolderSizeCacheSQL struct {
	DAO
}

func init() {
	queries["childrenSize"] = func(dao sql.DAO, mpathes ...string) (string, []interface{}) {
		sub, args := getMPathLike([]byte(mpathes[0]))
		return fmt.Sprintf(`
			select sum(size)
			FROM %%PREFIX%%_idx_tree
			WHERE %s AND level >= ? AND leaf=1`, sub), args
	}
}

// NewFolderSizeCacheDAO provides a middleware implementation of the index sql dao that removes duplicate entries of the .pydio file that have the same etag at the same level
func NewFolderSizeCacheDAO(dao DAO) DAO {
	//return dao
	return &FolderSizeCacheSQL{
		dao,
	}
}

// GetNode from path
func (dao *FolderSizeCacheSQL) GetNode(path mtree.MPath) (*mtree.TreeNode, error) {

	node, err := dao.DAO.GetNode(path)
	if err != nil {
		return nil, err
	}

	if node != nil && !node.IsLeaf() {
		dao.folderSize(node)
	}

	return node, nil
}

// GetNodeByUUID returns the node stored with the unique uuid
func (dao *FolderSizeCacheSQL) GetNodeByUUID(uuid string) (*mtree.TreeNode, error) {

	node, err := dao.DAO.GetNodeByUUID(uuid)
	if err != nil {
		return nil, err
	}

	if node != nil && !node.IsLeaf() {
		dao.folderSize(node)
	}

	return node, nil
}

// GetNodeChildren List
func (dao *FolderSizeCacheSQL) GetNodeChildren(ctx context.Context, path mtree.MPath, filter ...*tree.MetaFilter) chan interface{} {
	c := make(chan interface{})

	go func() {
		defer close(c)

		cc := dao.DAO.GetNodeChildren(ctx, path, filter...)

		for obj := range cc {
			if node, ok := obj.(*mtree.TreeNode); ok {
				if node != nil && !node.IsLeaf() {
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
func (dao *FolderSizeCacheSQL) GetNodeTree(ctx context.Context, path mtree.MPath, filter ...*tree.MetaFilter) chan interface{} {
	c := make(chan interface{})

	go func() {
		defer close(c)

		cc := dao.DAO.GetNodeTree(ctx, path, filter...)

		for obj := range cc {
			if node, ok := obj.(*mtree.TreeNode); ok {
				if node != nil && !node.IsLeaf() {
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

func (dao *FolderSizeCacheSQL) Path(strpath string, create bool, reqNode ...tree.N) (mtree.MPath, []*mtree.TreeNode, error) {
	mpath, nodes, err := dao.DAO.Path(strpath, create, reqNode...)

	if create {
		go dao.invalidateMPathHierarchy(mpath, -1)
	}

	return mpath, nodes, err
}

// AddNode adds a node in the tree.
func (dao *FolderSizeCacheSQL) AddNode(node *mtree.TreeNode) error {
	dao.invalidateMPathHierarchy(node.MPath, -1)
	return dao.DAO.AddNode(node)
}

// SetNode updates a node, including its tree position
func (dao *FolderSizeCacheSQL) SetNode(node *mtree.TreeNode) error {
	dao.invalidateMPathHierarchy(node.MPath, -1)
	return dao.DAO.SetNode(node)
}

// DelNode removes a node from the tree
func (dao *FolderSizeCacheSQL) DelNode(node *mtree.TreeNode) error {
	dao.invalidateMPathHierarchy(node.MPath, -1)
	return dao.DAO.DelNode(node)
}

// MoveNodeTree move all the nodes belonging to a tree by calculating the new mpathes
func (dao *FolderSizeCacheSQL) MoveNodeTree(nodeFrom *mtree.TreeNode, nodeTo *mtree.TreeNode) error {
	root := nodeTo.MPath.CommonRoot(nodeFrom.MPath)

	dao.invalidateMPathHierarchy(nodeTo.MPath, len(root))
	dao.invalidateMPathHierarchy(nodeFrom.MPath, len(root))

	return dao.DAO.MoveNodeTree(nodeFrom, nodeTo)
}

func (dao *FolderSizeCacheSQL) GetSQLDAO() sql.DAO {
	return dao.DAO.GetSQLDAO()
}

func (dao *FolderSizeCacheSQL) invalidateMPathHierarchy(mpath mtree.MPath, level int) {

	parents := mpath.Parents()
	if level > -1 {
		parents = mpath.Parents()[level:]
	}

	folderSizeLock.Lock()
	delete(folderSizeCache, mpath.String())
	folderSizeLock.Unlock()

	for _, p := range parents {
		folderSizeLock.Lock()
		delete(folderSizeCache, p.String())
		folderSizeLock.Unlock()
	}
}

// Compute sizes from children files - Does not handle lock, should be
// used by other functions handling lock
func (dao *FolderSizeCacheSQL) folderSize(node *mtree.TreeNode) {

	mpath := node.MPath.String()

	folderSizeLock.RLock()
	size, ok := folderSizeCache[mpath]
	folderSizeLock.RUnlock()

	if ok {
		node.UpdateSize(size)
		return
	}

	if stmt, args, e := dao.GetSQLDAO().GetStmtWithArgs("childrenSize", mpath); e == nil {
		row := stmt.QueryRow(append(args, len(node.MPath)+1)...)
		if row != nil {
			var size int64
			if er := row.Scan(&size); er == nil {
				node.UpdateSize(size)

				folderSizeLock.Lock()
				folderSizeCache[mpath] = size
				folderSizeLock.Unlock()
			}
		}
	}
}
