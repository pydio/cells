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

package nodes

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/runtime"
	"google.golang.org/grpc/status"
	"io"
	"path"
	"strings"

	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/cache"
)

var (
	ancestorsParentsCache cache.Cache
	ancestorsNodesCache cache.Cache
)

func getAncestorsParentsCache() cache.Cache {
	if ancestorsParentsCache == nil {
		c, _ := cache.OpenCache(context.TODO(), runtime.ShortCacheURL()+"?evictionTime=800ms&cleanWindow=800ms")
		ancestorsParentsCache = c
	}
	return ancestorsParentsCache
}

func getAncestorsNodesCache() cache.Cache {
	if ancestorsNodesCache == nil {
		c, _ := cache.OpenCache(context.TODO(), runtime.ShortCacheURL()+"?evictionTime=800ms&cleanWindow=5s")
		ancestorsNodesCache = c
	}
	return ancestorsNodesCache
}

// BuildAncestorsList uses ListNodes with "Ancestors" flag to build the list of parent nodes.
// It uses an internal short-lived cache to throttle calls to the TreeService
func BuildAncestorsList(ctx context.Context, treeClient tree.NodeProviderClient, node *tree.Node) (parentUuids []*tree.Node, err error) {
	/*
		sT := time.Now()
		defer func() {
			fmt.Println("--- End BuildAncestorsList for "+node.GetPath(), time.Now().Sub(sT))
		}()
	*/
	dirPath := path.Dir(node.GetPath())
	if node.GetPath() != "" {
		if cached, has := getAncestorsParentsCache().Get(dirPath); has {
			if parents, ok := cached.([]*tree.Node); ok {
				// Lookup First node
				if cachedNode, h := getAncestorsNodesCache().Get(node.GetPath()); h {
					parentUuids = append(parentUuids, cachedNode.(*tree.Node))
				} else {
					r, er := treeClient.ReadNode(ctx, &tree.ReadNodeRequest{Node: node})
					if er != nil {
						return parentUuids, er
					}
					getAncestorsNodesCache().Set(node.GetPath(), r.GetNode())
					parentUuids = append(parentUuids, r.GetNode())
				}
				parentUuids = append(parentUuids, parents...)
				return parentUuids, nil
			}
		}
	}

	ancestorStream, lErr := treeClient.ListNodes(ctx, &tree.ListNodesRequest{
		Node:      node,
		Ancestors: true,
	})
	if lErr != nil {
		return parentUuids, lErr
	}
	defer ancestorStream.CloseSend()

	for {
		parent, e := ancestorStream.Recv()
		if e != nil {
			if e == io.EOF || e == io.ErrUnexpectedEOF {
				break
			} else {
				if s, o := status.FromError(e); o {
					return nil, fmt.Errorf(s.Message())
				}
				return nil, e
			}
		}
		if parent == nil {
			continue
		}
		parentUuids = append(parentUuids, parent.Node)
	}
	if dirPath != "" && parentUuids != nil && len(parentUuids) > 1 {
		cNode := parentUuids[0]
		pNodes := parentUuids[1:]
		getAncestorsNodesCache().Set(node.GetPath(), cNode)
		getAncestorsParentsCache().Set(dirPath, pNodes)
	}
	return parentUuids, err
}

// BuildAncestorsListOrParent builds ancestors list when the node does not exist yet, by trying to find all existing parents.
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
