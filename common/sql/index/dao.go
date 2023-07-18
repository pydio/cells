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

// Package index provides ready-to-use tables and DAOs for storing hierarchical data using the nested sets pattern
package index

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/sync/model"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/mtree"
)

// DAO interface
type DAO interface {
	Path(strpath string, create bool, reqNode ...model.Node) (mtree.MPath, []*mtree.TreeNode, error)

	// AddNode adds a node in the tree
	AddNode(*mtree.TreeNode) error
	// SetNode updates a node, including its tree position
	SetNode(*mtree.TreeNode) error
	// SetNodeMeta Update a node metadata, without touching its tree position
	SetNodeMeta(*mtree.TreeNode) error
	// DelNode removes a node from the tree
	DelNode(*mtree.TreeNode) error

	// AddNodeStream Simple Add / Set / Delete
	AddNodeStream(int) (chan *mtree.TreeNode, chan error)
	Flush(bool) error

	// GetNodes Batch Add / Set / Delete
	GetNodes(...mtree.MPath) chan *mtree.TreeNode
	SetNodes(string, int64) sql.BatchSender

	// Getters

	GetNodeChildren(context.Context, mtree.MPath, ...*tree.MetaFilter) chan interface{}
	GetNodeTree(context.Context, mtree.MPath, ...*tree.MetaFilter) chan interface{}
	GetNode(mtree.MPath) (*mtree.TreeNode, error)
	GetNodeByUUID(string) (*mtree.TreeNode, error)
	GetNodeChild(mtree.MPath, string) (*mtree.TreeNode, error)
	GetNodeLastChild(mtree.MPath) (*mtree.TreeNode, error)
	GetNodeFirstAvailableChildIndex(mtree.MPath) (uint64, error)
	GetNodeChildrenCounts(mtree.MPath, bool) (int, int)
	MoveNodeTree(nodeFrom *mtree.TreeNode, nodeTo *mtree.TreeNode) error

	ResyncDirtyEtags(rootNode *mtree.TreeNode) error
	CleanResourcesOnDeletion() (string, error)
	LostAndFounds(context.Context) ([]LostAndFound, error)
	FixLostAndFound(lost LostAndFound) error
	FixRandHash2(excludes ...LostAndFound) (int64, error)
	Flatten() (string, error)

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
