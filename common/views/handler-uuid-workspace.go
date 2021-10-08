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

package views

import (
	"context"
	"path"
	"strings"

	servicecontext "github.com/pydio/cells/common/service/context"
	context2 "github.com/pydio/cells/common/utils/context"

	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/permissions"
)

// UuidNodeHandler is an AbstractBranchFilter extracting workspace info based on node UUID.
type UuidNodeHandler struct {
	AbstractBranchFilter
}

func NewUuidNodeHandler() *UuidNodeHandler {
	u := &UuidNodeHandler{}
	u.inputMethod = u.updateInputBranch
	u.outputMethod = u.updateOutputBranch
	return u
}

func (h *UuidNodeHandler) updateInputBranch(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {

	if info, alreadySet := GetBranchInfo(ctx, identifier); alreadySet && info.Client != nil {
		return ctx, node, nil
	}

	if isAdmin := ctx.Value(ctxAdminContextKey{}); isAdmin != nil {
		ws := &idm.Workspace{UUID: "ROOT", RootUUIDs: []string{"ROOT"}, Slug: "ROOT"}
		branchInfo := BranchInfo{}
		branchInfo.Workspace = *ws
		ctx = WithBranchInfo(ctx, identifier, branchInfo)
		return ctx, node, nil
	}

	accessList, ok := ctx.Value(CtxUserAccessListKey{}).(*permissions.AccessList)
	if !ok {
		return ctx, node, errors.InternalServerError(VIEWS_LIBRARY_NAME, "Cannot load access list")
	}

	// Update Access List with resolved virtual nodes
	virtualManager := GetVirtualNodesManager()
	cPool := h.clientsPool
	for _, vNode := range virtualManager.ListNodes() {
		if aclNodeMask, has := accessList.GetNodesBitmasks()[vNode.Uuid]; has {
			if resolvedRoot, err := virtualManager.ResolveInContext(ctx, vNode, cPool, false); err == nil {
				log.Logger(ctx).Debug("Updating Access List with resolved node Uuid", zap.Any("virtual", vNode), zap.Any("resolved", resolvedRoot))
				accessList.ReplicateBitmask(vNode.Uuid, resolvedRoot.Uuid)
				for _, roots := range accessList.GetWorkspacesNodes() {
					for rootId := range roots {
						if rootId == vNode.Uuid {
							delete(roots, vNode.Uuid)
							roots[resolvedRoot.Uuid] = aclNodeMask
						}
					}
				}
			}
		}
	}

	parents, err := BuildAncestorsList(ctx, h.clientsPool.GetTreeClient(), node)
	if err != nil {
		return ctx, node, err
	}
	workspaces, _ := accessList.BelongsToWorkspaces(ctx, parents...)
	if len(workspaces) == 0 {
		log.Logger(ctx).Debug("Node des not belong to any accessible workspace!", accessList.Zap())
		return ctx, node, errors.Forbidden(VIEWS_LIBRARY_NAME, "Node does not belong to any accessible workspace!")
	}
	// Use first workspace by default
	branchInfo := BranchInfo{
		AncestorsList: make(map[string][]*tree.Node, 1),
		Workspace:     *workspaces[0],
	}
	branchInfo.AncestorsList[node.Path] = parents
	ctx = context2.WithAdditionalMetadata(ctx, map[string]string{
		servicecontext.CtxWorkspaceUuid: branchInfo.Workspace.UUID,
	})
	return WithBranchInfo(ctx, identifier, branchInfo), node, nil
}

func (h *UuidNodeHandler) updateOutputBranch(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {

	var accessList *permissions.AccessList
	var ok bool
	if accessList, ok = ctx.Value(CtxUserAccessListKey{}).(*permissions.AccessList); !ok {
		return ctx, node, nil
	}
	if _, ancestors, e := AncestorsListFromContext(ctx, node, identifier, h.clientsPool, false); e == nil {
		out := node.Clone()
		workspaces, wsRoots := accessList.BelongsToWorkspaces(ctx, ancestors...)
		log.Logger(ctx).Debug("Belongs to workspaces", zap.Int("ws length", len(workspaces)), zap.Any("wsRoots", wsRoots))
		for _, ws := range workspaces {
			if relativePath, e := h.relativePathToWsRoot(ctx, ws, node.Path, wsRoots[ws.UUID]); e == nil {
				out.AppearsIn = append(out.AppearsIn, &tree.WorkspaceRelativePath{
					WsUuid:  ws.UUID,
					WsLabel: ws.Label,
					WsSlug:  ws.Slug,
					WsScope: ws.Scope.String(),
					Path:    relativePath,
				})
			} else {
				log.Logger(ctx).Error("Error while computing relative path to root", zap.Error(e))
			}
		}
		return ctx, out, nil
	}

	return ctx, node, nil

}

func (h *UuidNodeHandler) relativePathToWsRoot(ctx context.Context, ws *idm.Workspace, nodeFullPath string, rootNodeId string) (string, error) {

	if resp, e := h.next.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: rootNodeId}}); e == nil {
		rootPath := resp.Node.Path
		if strings.HasPrefix(nodeFullPath, rootPath) {
			relPath := strings.TrimPrefix(nodeFullPath, rootPath)
			if len(ws.RootUUIDs) > 1 {
				// This workspace has multiple root, prepend the fake root key
				rootKey := h.makeRootKey(resp.Node)
				relPath = path.Join(rootKey, relPath)
			}
			return relPath, nil
		} else {
			return "", errors.NotFound("RouterUuid", "Cannot subtract paths "+nodeFullPath+" - "+rootPath)
		}
	} else {
		return "", e
	}

}
