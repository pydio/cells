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

package utils

import (
	"context"
	"io"
	"path"
	"strings"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/tree"
)

// BuildAncestorsList uses ListNodes with Ancestors flag set to build the list of parent nodes.
func BuildAncestorsList(ctx context.Context, treeClient tree.NodeProviderClient, node *tree.Node) (parentUuids []*tree.Node, err error) {
	ancestorStream, lErr := treeClient.ListNodes(ctx, &tree.ListNodesRequest{
		Node:      node,
		Ancestors: true,
	})
	if lErr != nil {
		return parentUuids, lErr
	}
	defer ancestorStream.Close()
	for {
		parent, e := ancestorStream.Recv()
		if e != nil {
			if e == io.EOF || e == io.ErrUnexpectedEOF {
				break
			} else {
				return nil, e
			}
		}
		if parent == nil {
			continue
		}
		parentUuids = append(parentUuids, parent.Node)
	}
	return parentUuids, err
}

// Recursive listing to build ancestors list when the node does not exists yet : try to find all existing parents
func BuildAncestorsListOrParent(ctx context.Context, treeClient tree.NodeProviderClient, node *tree.Node) (parentUuids []*tree.Node, err error) {
	parents, err := BuildAncestorsList(ctx, treeClient, node)
	nodePathParts := strings.Split(node.Path, "/")
	if err != nil && len(nodePathParts) > 1 {
		// Try to list parent node right
		parentNode := &tree.Node{}
		parentNode.Path = strings.Join(nodePathParts[0:len(nodePathParts)-1], "/")
		parents, err = BuildAncestorsListOrParent(ctx, treeClient, parentNode)
		if err != nil {
			return parents, err
		}
	}
	return parents, nil
}

// IgnoreNodeForOutput checks wether a node shall be ignored for
// outputs sent to end user (typically websocket events, activities, etc)
func IgnoreNodeForOutput(ctx context.Context, node *tree.Node) bool {
	base := path.Base(node.Path)
	return base == common.PYDIO_SYNC_HIDDEN_FILE_META || strings.HasPrefix(base, ".")
}
