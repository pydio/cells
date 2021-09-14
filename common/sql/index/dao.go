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

// Package index provides ready-to-use tables and DAOs for storing hierarchical data using the nested sets pattern
package index

import (
	"fmt"

	"github.com/pydio/cells/common/dao"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/common/utils/mtree"
)

// DAO interface
type DAO interface {
	Path(strpath string, create bool, reqNode ...*tree.Node) (mtree.MPath, []*mtree.TreeNode, error)

	// Add a node in the tree
	AddNode(*mtree.TreeNode) error
	// SetNode updates a node, including its tree position
	SetNode(*mtree.TreeNode) error
	// Update a node metadata, without touching its tree position
	SetNodeMeta(*mtree.TreeNode) error
	// Remove a node from the tree
	DelNode(*mtree.TreeNode) error

	// Simple Add / Set / Delete
	AddNodeStream(int) (chan *mtree.TreeNode, chan error)
	Flush(bool) error

	// Batch Add / Set / Delete
	GetNodes(...mtree.MPath) chan *mtree.TreeNode
	SetNodes(string, int64) sql.BatchSender

	// Getters
	GetNode(mtree.MPath) (*mtree.TreeNode, error)
	GetNodeByUUID(string) (*mtree.TreeNode, error)
	GetNodeChildren(mtree.MPath) chan interface{}
	GetNodeTree(mtree.MPath) chan interface{}
	GetNodeChild(mtree.MPath, string) (*mtree.TreeNode, error)
	GetNodeLastChild(mtree.MPath) (*mtree.TreeNode, error)
	GetNodeFirstAvailableChildIndex(mtree.MPath) (uint64, error)
	GetNodeChildrenCounts(mtree.MPath) (int, int)
	MoveNodeTree(nodeFrom *mtree.TreeNode, nodeTo *mtree.TreeNode) error

	ResyncDirtyEtags(rootNode *mtree.TreeNode) error
	CleanResourcesOnDeletion() (error, string)
	LostAndFounds() ([]LostAndFound, error)
	FixLostAndFound(lost LostAndFound) error
	FixRandHash2(excludes ...LostAndFound) (int64, error)

	GetSQLDAO() sql.DAO
}

type CacheDAO interface {
	// PathCreateNoAdd does the same as Path(create=true) but does not really
	// create the node in the cache, just find a firstAvailableIndex
	PathCreateNoAdd(strpath string) (mtree.MPath, *mtree.TreeNode, error)
}

// NewDAO for the common sql index
func NewDAO(o dao.DAO, rootNodeId string) dao.DAO {
	switch v := o.(type) {
	case sql.DAO:
		return &IndexSQL{Handler: v.(*sql.Handler), rootNodeId: rootNodeId}
	}
	return nil
}

type LostAndFound interface {
	fmt.Stringer
	IsDuplicate() bool
	IsLostParent() bool
	IsDir() bool

	GetUUIDs() []string
	MarkForDeletion([]string)
}
