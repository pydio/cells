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

package views

import (
	"context"
	"strings"
	"time"

	"github.com/patrickmn/go-cache"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/permissions"
)

// RouterEventFilter is an extended Router used mainly to filter events sent from inside to outside the application
type RouterEventFilter struct {
	Router
	RootNodesCache *cache.Cache
}

// NewRouterEventFilter creates a new EventFilter properly initialized
func NewRouterEventFilter(options RouterOptions) *RouterEventFilter {

	handlers := []Handler{
		NewAccessListHandler(options.AdminView),
		NewPathWorkspaceHandler(),
		NewPathMultipleRootsHandler(),
	}
	if !options.AdminView {
		handlers = append(handlers, NewVirtualNodesHandler())
	}
	handlers = append(handlers,
		NewWorkspaceRootResolver(),
		NewPathDataSourceHandler(),
		NewArchiveHandler(),  // Catch "GET" request on folder.zip and create archive on-demand
		&PutHandler{},        // Handler adding a node precreation on PUT file request
		&EncryptionHandler{}, // Handler retrieve encryption materials from encryption service
		&VersionHandler{},
		&Executor{},
	)
	pool := NewClientsPool(options.WatchRegistry)
	r := &RouterEventFilter{}
	r.Router.handlers = handlers
	r.Router.pool = pool
	r.RootNodesCache = cache.New(120*time.Second, 10*time.Minute)
	r.initHandlers()
	return r

}

// WorkspaceCanSeeNode will check workspaces roots to see if a node in below one of them
func (r *RouterEventFilter) WorkspaceCanSeeNode(ctx context.Context, accessList *permissions.AccessList, workspace *idm.Workspace, node *tree.Node) (*tree.Node, bool) {
	if node == nil {
		return node, false
	}
	if tree.IgnoreNodeForOutput(ctx, node) {
		return node, false
	}
	roots := workspace.RootUUIDs
	var ancestors []*tree.Node
	var ancestorsLoaded bool
	resolver := GetVirtualNodesManager().GetResolver(r.pool, false)
	for _, root := range roots {
		if parent, ok := r.NodeIsChildOfRoot(ctx, node, root); ok {
			if accessList != nil {
				if !ancestorsLoaded {
					var e error
					if ancestors, e = BuildAncestorsList(ctx, r.GetClientsPool().GetTreeClient(), node); e != nil {
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
			r.WrapCallback(func(inputFilter NodeFilter, outputFilter NodeFilter) error {
				branchInfo := BranchInfo{}
				branchInfo.Workspace = *workspace
				branchInfo.Root = parent
				ctx = WithBranchInfo(ctx, "in", branchInfo)
				_, newNode, _ = outputFilter(ctx, newNode, "in")
				return nil
			})
			log.Logger(ctx).Debug("Router Filtered node", zap.String("rootPath", parent.Path), zap.String("workspace", workspace.Label), zap.String("from", node.Path), zap.String("to", newNode.Path))
			return newNode, true
		}
	}
	return nil, false
}

// NodeIsChildOfRoot compares pathes between possible parent and child
func (r *RouterEventFilter) NodeIsChildOfRoot(ctx context.Context, node *tree.Node, rootId string) (*tree.Node, bool) {

	vManager := GetVirtualNodesManager()
	if virtualNode, exists := vManager.ByUuid(rootId); exists {
		if resolved, e := vManager.ResolveInContext(ctx, virtualNode, r.GetClientsPool(), false); e == nil {
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
func (r *RouterEventFilter) getRoot(ctx context.Context, rootId string) *tree.Node {

	if node, ok := r.RootNodesCache.Get(rootId); ok {
		return node.(*tree.Node)
	}
	resp, e := r.pool.GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: rootId}})
	if e == nil && resp.Node != nil {
		resp.Node.Path = strings.Trim(resp.Node.Path, "/")
		r.RootNodesCache.Set(rootId, resp.Node.Clone(), cache.DefaultExpiration)
		return resp.Node
	}
	return nil

}
