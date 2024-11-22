/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

	"gorm.io/gorm"

	"github.com/pydio/cells/v5/common/proto/tree"
)

// BatchSender interface
type BatchSender interface {
	Send(interface{})
	Close() error
}

type innerDAO interface {
	// insertNode adds a node in the tree
	insertNode(context.Context, tree.ITreeNode) error
	// getNodeChild finds a node by its name and parent
	getNodeChild(context.Context, *tree.MPath, string) (tree.ITreeNode, error)
	// getNodeLastChild finds the last child of a parent
	getNodeLastChild(context.Context, *tree.MPath) (tree.ITreeNode, error)
	// getNodeFirstAvailableChildIndex finds the first slot available to insert a node a specific level.
	getNodeFirstAvailableChildIndex(context.Context, *tree.MPath) (uint64, error)
}

// DAO interface
type DAO interface {
	innerDAO

	Migrate(ctx context.Context) error

	// Multiple nodes selectors
	// ************************

	// GetNodeTree retrieves all children recursively
	GetNodeTree(context.Context, *tree.MPath, ...*tree.MetaFilter) chan interface{}
	// GetNodeChildren retrieves all direct children of a Collection
	GetNodeChildren(context.Context, *tree.MPath, ...*tree.MetaFilter) chan interface{}
	// GetNodeChildrenCounts counts all collection children
	GetNodeChildrenCounts(context.Context, *tree.MPath, bool) (int, int)
	// GetNodeChildrenSize sums up all collection children sizes
	GetNodeChildrenSize(context.Context, *tree.MPath) (int, error)
	// GetNodesByMPaths takes multiple MPath as input and load all nodes at once
	GetNodesByMPaths(context.Context, ...*tree.MPath) chan tree.ITreeNode

	// Unitary CRUD Operation
	// ************************

	// GetNodeByMPath finds an existing node by its MPath
	GetNodeByMPath(context.Context, *tree.MPath) (tree.ITreeNode, error)
	// GetNodeByUUID finds an existing node by its UUID
	GetNodeByUUID(context.Context, string) (tree.ITreeNode, error)
	// GetNodeByPath lookups for a node at a given path, returning error if it does not exist
	GetNodeByPath(ctx context.Context, nodePath string) (tree.ITreeNode, error)
	// GetOrCreateNodeByPath lookups for an existing node at a given path, and creates it if required. It also creates intermediary collections if necessary.
	GetOrCreateNodeByPath(ctx context.Context, nodePath string, info *tree.Node, rootInfo ...*tree.Node) (tree.ITreeNode, []tree.ITreeNode, error)
	// UpdateNode updates a node position (mPath) and metadata
	UpdateNode(context.Context, tree.ITreeNode) error
	// DelNode removes a node from the tree
	DelNode(context.Context, tree.ITreeNode) error
	// MoveNodeTree moves a whole tree from one position to another. The target must not exist.
	MoveNodeTree(ctx context.Context, nodeFrom tree.ITreeNode, nodeTo tree.ITreeNode) error

	// BATCH Operations
	// ****************

	// AddNodeStream Simple Add / Set / Delete
	AddNodeStream(context.Context, int) (chan tree.ITreeNode, chan error)
	// Flush triggers underlying flush
	Flush(context.Context, bool) error
	// SetNodes returns a batcher that can be used for quick updates
	SetNodes(context.Context, string, int64) BatchSender

	// Clean Operations
	// ****************

	ResyncDirtyEtags(ctx context.Context, rootNode tree.ITreeNode) error
	CleanResourcesOnDeletion(context.Context) (string, error)
	LostAndFounds(context.Context) ([]LostAndFound, error)
	FixLostAndFound(ctx context.Context, lost LostAndFound) error
	Flatten(context.Context) (string, error)
	UpdateNameInPlace(ctx context.Context, oldName, newName string, knownUuid string, knownLevel int) (int64, error)
}

type CacheDAO interface {
	// PathCreateNoAdd does the same as Path(create=true) but does not really
	// create the node in the cache, just find a firstAvailableIndex
	PathCreateNoAdd(ctx context.Context, strpath string) (*tree.MPath, tree.ITreeNode, error)
}

// NewDAO for the common sql index
func NewDAO[T tree.ITreeNode](db *gorm.DB) DAO {
	return &gormImpl[T]{DB: db, factory: &treeNodeFactory[T]{}}
}
