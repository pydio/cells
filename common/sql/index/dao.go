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
	"github.com/pydio/cells/common/dao"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/common/utils"
)

// DAO interface
type DAO interface {
	Path(strpath string, create bool, reqNode ...*tree.Node) (utils.MPath, []*utils.TreeNode, error)

	// Simple Add / Set / Delete
	AddNode(*utils.TreeNode) error
	SetNode(*utils.TreeNode) error
	DelNode(*utils.TreeNode) error

	// Simple Add / Set / Delete
	AddNodeStream(int) (chan *utils.TreeNode, chan error)
	Flush(bool) error

	// Batch Add / Set / Delete
	GetNodes(...utils.MPath) chan *utils.TreeNode
	SetNodes(string, int64) sql.BatchSender

	// Getters
	GetNode(utils.MPath) (*utils.TreeNode, error)
	GetNodeByUUID(string) (*utils.TreeNode, error)
	GetNodeChild(utils.MPath, string) (*utils.TreeNode, error)
	GetNodeLastChild(utils.MPath) (*utils.TreeNode, error)
	GetNodeFirstAvailableChildIndex(utils.MPath) (uint64, error)
	GetNodeChildren(utils.MPath) chan *utils.TreeNode
	GetNodeTree(utils.MPath) chan *utils.TreeNode

	MoveNodeTree(nodeFrom *utils.TreeNode, nodeTo *utils.TreeNode) error

	PushCommit(node *utils.TreeNode) error
	DeleteCommits(node *utils.TreeNode) error
	ListCommits(node *utils.TreeNode) ([]*tree.ChangeLog, error)
	ResyncDirtyEtags(rootNode *utils.TreeNode) error
	CleanResourcesOnDeletion() (error, string)
}

// NewDAO for the common sql index
func NewDAO(o dao.DAO, rootNodeId string) dao.DAO {
	switch v := o.(type) {
	case sql.DAO:
		return &IndexSQL{Handler: v.(*sql.Handler), rootNodeId: rootNodeId}
	}
	return nil
}
