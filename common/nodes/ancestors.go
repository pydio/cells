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
	"path"
	"strings"

	"google.golang.org/grpc/status"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/tracing"
	"github.com/pydio/cells/v4/common/utils/cache"
	cache_helper "github.com/pydio/cells/v4/common/utils/cache/helper"
)

var (
	ancestorsConfig = cache.Config{
		Prefix:      "ancestors",
		Eviction:    "1500ms",
		CleanWindow: "3m",
	}
	ancestorsParentsConfig = cache.Config{
		Prefix:      "ancestors-parents",
		Eviction:    "1500ms",
		CleanWindow: "3m",
	}
)

func getAncestorsParentsCache(ctx context.Context) cache.Cache {
	return cache_helper.MustResolveCache(ctx, "short", ancestorsParentsConfig)
}

func getAncestorsNodesCache(ctx context.Context) cache.Cache {
	return cache_helper.MustResolveCache(ctx, "short", ancestorsConfig)
}

// BuildAncestorsList uses ListNodes with "Ancestors" flag to build the list of parent nodes.
// It uses an internal short-lived cache to throttle calls to the TreeService
func BuildAncestorsList(ctx context.Context, treeClient tree.NodeProviderClient, node *tree.Node) (parentUuids []*tree.Node, err error) {
	/*
		sT := time.Now()
		defer func() {
			fmt.Println("--- End BuildAncestorsList for "+node.GetPath(), time.Since(sT))
		}()
	*/
	if node.GetPath() != "" {
		var parents []*tree.Node
		if getAncestorsParentsCache(ctx).Get(path.Dir(node.GetPath()), &parents) {
			var cachedNode *tree.Node
			// Lookup First node
			anc := getAncestorsNodesCache(ctx)
			if anc.Get(node.GetPath(), &cachedNode) {
				parentUuids = append(parentUuids, cachedNode)
			} else {
				ctx, span := tracing.StartLocalSpan(ctx, "AncestorsRead")
				r, er := treeClient.ReadNode(ctx, &tree.ReadNodeRequest{Node: node})
				span.End()
				if er != nil {
					return parentUuids, er
				}
				_ = anc.Set(node.GetPath(), r.GetNode())
				parentUuids = append(parentUuids, r.GetNode())
			}
			parentUuids = append(parentUuids, parents...)
			return parentUuids, nil
		}
	}

	ancestorStream, lErr := treeClient.ListNodes(ctx, &tree.ListNodesRequest{
		Node:      node,
		Ancestors: true,
	})
	if lErr != nil {
		return parentUuids, lErr
	}
	// fmt.Println("Needs actual streaming", node.GetPath())
	for {
		parent, e := ancestorStream.Recv()
		if e != nil {
			if errors.IsStreamFinished(e) {
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

	if len(parentUuids) > 1 {
		apc := getAncestorsParentsCache(ctx)
		anc := getAncestorsNodesCache(ctx)
		cNode := parentUuids[0]
		pNodes := parentUuids[1:]
		_ = anc.Set(node.GetPath(), cNode)
		if !cNode.IsLeaf() {
			storeParents(apc, node.GetPath(), parentUuids)
		}
		dirPath := path.Dir(node.GetPath())
		if dirPath != "." && dirPath != "" {
			storeParents(apc, dirPath, pNodes)
			for i, n := range pNodes {
				_ = anc.Set(n.GetPath(), n)
				if i < len(pNodes)-2 {
					storeParents(apc, path.Dir(n.GetPath()), pNodes[i+1:])
				}
			}
		}
	}
	return parentUuids, err
}

func storeParents(apc cache.Cache, dirPath string, parents []*tree.Node) {
	if len(parents) > 0 {
		_ = apc.Set(dirPath, parents)
	}
}

// BuildAncestorsListOrParent builds ancestors list when the node does not exist yet, by trying to find all existing parents.
func BuildAncestorsListOrParent(ctx context.Context, treeClient tree.NodeProviderClient, node *tree.Node) (parents []*tree.Node, err error) {
	parents, err = BuildAncestorsList(ctx, treeClient, node)
	nodePathParts := strings.Split(node.Path, "/")
	if err != nil && len(nodePathParts) > 1 {
		// Try to list parent node right
		parentNode := &tree.Node{}
		parentNode.Path = strings.Join(nodePathParts[0:len(nodePathParts)-1], "/")
		parents, err = BuildAncestorsListOrParent(ctx, treeClient, parentNode)
		if err != nil {
			return
		}
	}
	return
}
