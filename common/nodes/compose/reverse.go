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

package compose

import (
	"context"
	"strings"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/nodes/acl"
	"github.com/pydio/cells/v4/common/nodes/archive"
	"github.com/pydio/cells/v4/common/nodes/core"
	"github.com/pydio/cells/v4/common/nodes/encryption"
	"github.com/pydio/cells/v4/common/nodes/path"
	"github.com/pydio/cells/v4/common/nodes/put"
	"github.com/pydio/cells/v4/common/nodes/version"
	"github.com/pydio/cells/v4/common/nodes/virtual"
	"github.com/pydio/cells/v4/common/permissions"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/cache"
	cache_helper "github.com/pydio/cells/v4/common/utils/cache/helper"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

var (
	revCacheConfig = cache.Config{
		Prefix:      "nodes-reverse",
		Eviction:    "120s",
		CleanWindow: "10m",
	}
)

// Reverse is an extended clientImpl used mainly to filter events sent from inside to outside the application
type Reverse struct {
	nodes.Client
	runtimeCtx context.Context
}

func ReverseClient(ctx context.Context, oo ...nodes.Option) *Reverse {
	opts := append(oo,
		nodes.WithContext(ctx),
		nodes.WithCore(func(pool *openurl.Pool[nodes.SourcesPool]) nodes.Handler {
			exe := &core.Executor{}
			exe.SetClientsPool(pool)
			return exe
		}),
		acl.WithAccessList(),
		path.WithPermanentPrefix(),
		path.WithWorkspace(),
		path.WithMultipleRoots(),
		virtual.WithResolver(),
		path.WithRootResolver(),
		path.WithDatasource(),
		archive.WithArchives(),
		put.WithPutInterceptor(),
		version.WithVersions(),
		encryption.WithEncryption(),
	)
	cl := newClient(opts...)
	return &Reverse{
		Client:     cl,
		runtimeCtx: cl.runtimeCtx,
	}
}

// WorkspaceCanSeeNode will check workspaces roots to see if a node in below one of them
func (r *Reverse) WorkspaceCanSeeNode(ctx context.Context, accessList *permissions.AccessList, workspace *idm.Workspace, node *tree.Node) (*tree.Node, bool) {
	if node == nil {
		return node, false
	}
	if tree.IgnoreNodeForOutput(ctx, node) {
		return node, false
	}
	roots := workspace.RootUUIDs
	var ancestors []*tree.Node
	var ancestorsLoaded bool
	resolver := abstract.GetVirtualNodesManager(r.runtimeCtx).GetResolver(false)
	for _, root := range roots {
		if parent, ok := r.NodeIsChildOfRoot(ctx, node, root); ok {
			if accessList != nil {
				if !ancestorsLoaded {
					var e error
					if ancestors, e = nodes.BuildAncestorsList(ctx, r.GetClientsPool(ctx).GetTreeClient(), node); e != nil {
						log.Logger(ctx).Debug("Cannot list ancestors list for", node.Zap(), zap.Error(e))
						return node, false
					} else {
						ancestorsLoaded = true
					}
				}
				if !accessList.CanReadPath(ctx, resolver, ancestors...) {
					continue
				}
			}
			newNode := node.Clone()
			r.WrapCallback(func(inputFilter nodes.FilterFunc, outputFilter nodes.FilterFunc) error {
				branchInfo := nodes.BranchInfo{}
				branchInfo.Workspace = workspace
				branchInfo.Root = parent
				ctx = nodes.WithBranchInfo(ctx, "in", branchInfo)
				_, newNode, _ = outputFilter(ctx, newNode, "in")
				return nil
			})
			log.Logger(ctx).Debug("clientImpl Filtered node", zap.String("rootPath", parent.Path), zap.String("workspace", workspace.Label), zap.String("from", node.Path), zap.String("to", newNode.Path))
			return newNode, true
		}
	}
	return nil, false
}

// NodeIsChildOfRoot compares pathes between possible parent and child
func (r *Reverse) NodeIsChildOfRoot(ctx context.Context, node *tree.Node, rootId string) (*tree.Node, bool) {

	vManager := abstract.GetVirtualNodesManager(r.runtimeCtx)
	if virtualNode, exists := vManager.ByUuid(rootId); exists {
		if resolved, e := vManager.ResolveInContext(ctx, virtualNode, false); e == nil {
			//log.Logger(ctx).Info("NodeIsChildOfRoot, Comparing Pathes on resolved", zap.String("node", node.Path), zap.String("root", resolved.Path))
			return resolved, node.Path == resolved.Path || strings.HasPrefix(node.Path, strings.TrimRight(resolved.Path, "/")+"/")
		}
	}
	if root := r.getRoot(ctx, rootId); root != nil {
		//log.Logger(ctx).Info("NodeIsChildOfRoot, Comparing Pathes", zap.String("node", node.Path), zap.String("root", root.Path))
		return root, node.Path == root.Path || strings.HasPrefix(node.Path, strings.TrimRight(root.Path, "/")+"/")
	}
	return nil, false

}

// getRoot provides a loaded root node from the cache or from the treeClient
func (r *Reverse) getRoot(ctx context.Context, rootId string) *tree.Node {
	var node *tree.Node
	ca := cache_helper.MustResolveCache(ctx, "short", revCacheConfig)
	if ca.Get(rootId, &node) {
		return node
	}
	resp, e := r.GetClientsPool(ctx).GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: rootId}})
	if e == nil && resp.Node != nil {
		resp.Node.Path = strings.Trim(resp.Node.Path, "/")
		_ = ca.Set(rootId, resp.Node.Clone())
		return resp.Node
	}
	return nil

}
