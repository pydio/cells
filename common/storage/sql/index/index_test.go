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
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	options configx.Values = configx.New()

	mockNode   *tree.TreeNode
	updateNode *tree.TreeNode

	mockLongNodeMPath       *tree.MPath
	mockLongNodeChild1MPath *tree.MPath
	mockLongNodeChild2MPath *tree.MPath

	mockLongNode       *tree.TreeNode
	mockLongNodeChild1 *tree.TreeNode
	mockLongNodeChild2 *tree.TreeNode
)

func init() {
	mockLongNodeMPath = &tree.MPath{MPath1: "1.2.3.4.5.6.7.8.9.10.11.12.13.14.15.16.17.18.19.20.21.22.23.24.25.26.27.28.29.30.31.32.33.34.35.36.37.38.39.40"}
	mockLongNodeChild1MPath = &tree.MPath{MPath1: "1.2.3.4.5.6.7.8.9.10.11.12.13.14.15.16.17.18.19.20.21.22.23.24.25.26.27.28.29.30.31.32.33.34.35.36.37.38.39.40.41"}
	mockLongNodeChild2MPath = &tree.MPath{MPath1: "1.2.3.4.5.6.7.8.9.10.11.12.13.14.15.16.17.18.19.20.21.22.23.24.25.26.27.28.29.30.31.32.33.34.35.36.37.38.39.40.42"}

	mockNode = &tree.TreeNode{
		Node: &tree.Node{
			Uuid: "ROOT",
			Type: tree.NodeType_COLLECTION,
		},
		MPath: &tree.MPath{MPath1: "1"},
		Name:  "ROOT",
	}

	updateNode = &tree.TreeNode{
		Node: &tree.Node{
			Uuid: "Update",
			Type: tree.NodeType_LEAF,
			Etag: "etag1",
			Size: 12,
		},
		MPath: &tree.MPath{MPath1: "1.2"},
		Name:  "update",
	}

	mockLongNode = &tree.TreeNode{
		Node: &tree.Node{
			Uuid: "mockLongNode",
			Type: tree.NodeType_COLLECTION,
		},
		MPath: mockLongNodeMPath,
		Name:  "mockLongNode",
	}

	mockLongNodeChild1 = &tree.TreeNode{
		Node: &tree.Node{
			Uuid: "mockLongNodeChild1",
			Type: tree.NodeType_LEAF,
			Size: 25,
		},
		MPath: mockLongNodeChild1MPath,
		Name:  "mockLongNodeChild1",
	}

	mockLongNodeChild2 = &tree.TreeNode{
		Node: &tree.Node{
			Uuid: "mockLongNodeChild2",
			Type: tree.NodeType_LEAF,
			Size: 27,
		},
		MPath: mockLongNodeChild2MPath,
		Name:  "mockLongNodeChild2",
	}
}

//func getSQLDAO(ctx context.Context) sql.DAO {
//	return servicecontext.GetDAO(ctx).(sql.DAO)
//}
//
//func getDAO(ctx context.Context) DAO {
//	return servicecontext.GetDAO(ctx).(DAO)
//}
//
//func printTree(ctx context.Context) {
//
//	tree := getDAO(ctx).GetNodeTree(ctx, nil)
//
//	for t := range tree {
//		if node, ok := t.(*mtree.TreeNode); ok {
//			fmt.Println(node.Uuid, node.Name(), node.MPath.String(), node.MetaStore)
//		}
//	}
//}
