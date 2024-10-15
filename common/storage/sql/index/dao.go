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
	"errors"
	"fmt"

	"github.com/go-gorm/caches"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/cache"
)

// Errors
var (
	errNotImplemented = errors.New("not implemented")
	errNotFound       = errors.New("not found")
	errAlreadyExists  = errors.New("already exists")
)

// BatchSender interface
type BatchSender interface {
	Send(interface{})
	Close() error
}

// DAO interface
type DAO interface {
	Migrate(ctx context.Context) error

	ResolveMPath(ctx context.Context, create bool, node *tree.ITreeNode, rootNode ...tree.ITreeNode) (*tree.MPath, []tree.ITreeNode, error)

	// AddNode adds a node in the tree
	AddNode(context.Context, tree.ITreeNode) error
	// SetNode updates a node, including its tree position
	SetNode(context.Context, tree.ITreeNode) error
	// SetNodeMeta updates a node metadata, without touching its tree position
	SetNodeMeta(context.Context, tree.ITreeNode) error
	// DelNode removes a node from the tree
	DelNode(context.Context, tree.ITreeNode) error

	// AddNodeStream Simple Add / Set / Delete
	AddNodeStream(context.Context, int) (chan tree.ITreeNode, chan error)
	Flush(context.Context, bool) error

	// Batch Add / Set / Delete
	GetNodes(context.Context, ...*tree.MPath) chan tree.ITreeNode
	SetNodes(context.Context, string, int64) BatchSender

	// Getters
	GetNodeChildren(context.Context, *tree.MPath, ...*tree.MetaFilter) chan interface{}
	GetNodeTree(context.Context, *tree.MPath, ...*tree.MetaFilter) chan interface{}
	GetNode(context.Context, *tree.MPath) (tree.ITreeNode, error)
	GetNodeByUUID(context.Context, string) (tree.ITreeNode, error)
	GetNodeChild(context.Context, *tree.MPath, string) (tree.ITreeNode, error)
	GetNodeLastChild(context.Context, *tree.MPath) (tree.ITreeNode, error)
	GetNodeFirstAvailableChildIndex(context.Context, *tree.MPath) (uint64, error)
	GetNodeChildrenCounts(context.Context, *tree.MPath, bool) (int, int)
	GetNodeChildrenSize(context.Context, *tree.MPath) (int, error)
	MoveNodeTree(ctx context.Context, nodeFrom tree.ITreeNode, nodeTo tree.ITreeNode) error

	ResyncDirtyEtags(ctx context.Context, rootNode tree.ITreeNode) error
	CleanResourcesOnDeletion(context.Context) (string, error)
	LostAndFounds(context.Context) ([]LostAndFound, error)
	FixLostAndFound(ctx context.Context, lost LostAndFound) error
	FixRandHash2(ctx context.Context, excludes ...LostAndFound) (int64, error)
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

// NewDAOWithCache for the common sql index
func NewDAOWithCache[T tree.ITreeNode](db *gorm.DB, ca cache.Cache) DAO {

	cachesPlugin := &caches.Caches{Conf: &caches.Config{
		//Easer: true, // Cannot enable that, it mixes up GetNodeChild results
		Cacher: NewCacher(ca),
	}}
	db.Use(cachesPlugin)

	return &gormImpl[T]{DB: db, factory: &treeNodeFactory[T]{}}
}

type LostAndFound interface {
	fmt.Stringer
	IsDuplicate() bool
	IsLostParent() bool
	IsDir() bool

	GetUUIDs() []string
	MarkForDeletion([]string)
}
