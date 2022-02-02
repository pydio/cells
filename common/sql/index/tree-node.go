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
	"strings"

	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/mtree"
)

// NewNode utils
func NewNode(treeNode *tree.Node, path mtree.MPath, filenames []string) *mtree.TreeNode {
	node := mtree.NewTreeNode()
	node.Node = treeNode

	node.SetMPath(path...)
	node.SetName(filenames[len(filenames)-1])

	node.Path = strings.Join(filenames, "/")

	return node
}
