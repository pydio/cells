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
	"strings"

	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils"
)

type UuidNodeHandler struct {
	AbstractBranchFilter
}

func NewUuidNodeHandler() *UuidNodeHandler {
	u := &UuidNodeHandler{}
	u.inputMethod = u.updateInputBranch
	u.outputMethod = u.updateOutputBranch
	return u
}

func (h *UuidNodeHandler) updateInputBranch(ctx context.Context, identifier string, node *tree.Node) (context.Context, error) {

	if info, alreadySet := GetBranchInfo(ctx, identifier); alreadySet && info.Client != nil {
		return ctx, nil
	}

	if accessList, ok := ctx.Value(ctxUserAccessListKey{}).(*utils.AccessList); ok {

		// Update Access List with resolved virtual nodes
		virtualManager := GetVirtualNodesManager()
		cPool := h.clientsPool
		for _, vNode := range virtualManager.ListNodes() {
			if aclNodeMask, has := accessList.GetNodesBitmasks()[vNode.Uuid]; has {
				if resolvedRoot, err := virtualManager.ResolveInContext(ctx, vNode, cPool, false); err == nil {
					log.Logger(ctx).Debug("Updating Access List with resolved node Uuid", zap.Any("virtual", vNode), zap.Any("resolved", resolvedRoot))
					accessList.GetNodesBitmasks()[resolvedRoot.Uuid] = aclNodeMask
					for _, roots := range accessList.GetWorkspacesNodes() {
						for rootId, _ := range roots {
							if rootId == vNode.Uuid {
								delete(roots, vNode.Uuid)
								roots[resolvedRoot.Uuid] = aclNodeMask
							}
						}
					}
				}
			}
		}

		parents, err := utils.BuildAncestorsList(ctx, h.clientsPool.GetTreeClient(), node)
		if err != nil {
			return ctx, err
		}
		workspaces, _ := accessList.BelongsToWorkspaces(ctx, parents...)
		if len(workspaces) == 0 {
			log.Logger(ctx).Debug("Node des not belong to any accessible workspace!", accessList.Zap(), zap.Any("parents", parents))
			return ctx, errors.Forbidden(VIEWS_LIBRARY_NAME, "Node does not belong to any accessible workspace!")
		}
		// Use first workspace by default
		branchInfo := BranchInfo{}
		branchInfo.Workspace = *workspaces[0]
		branchInfo.AncestorsList = parents
		return WithBranchInfo(ctx, identifier, branchInfo), nil

	} else {
		return ctx, errors.InternalServerError(VIEWS_LIBRARY_NAME, "Cannot load access list")
	}

	return ctx, nil

}

func (h *UuidNodeHandler) updateOutputBranch(ctx context.Context, identifier string, node *tree.Node) (context.Context, error) {

	var branchInfo BranchInfo
	var accessList *utils.AccessList
	var ok bool
	if branchInfo, ok = GetBranchInfo(ctx, identifier); !ok {
		return ctx, nil
	}
	if accessList, ok = ctx.Value(ctxUserAccessListKey{}).(*utils.AccessList); !ok {
		return ctx, nil
	}
	if branchInfo.AncestorsList != nil {
		workspaces, wsRoots := accessList.BelongsToWorkspaces(ctx, branchInfo.AncestorsList...)
		log.Logger(ctx).Debug("Belongs to workspaces", zap.Any("ws", workspaces), zap.Any("wsRoots", wsRoots))
		for _, ws := range workspaces {
			if relativePath, e := h.relativePathToWsRoot(ctx, node.Path, wsRoots[ws.UUID]); e == nil {
				node.AppearsIn = append(node.AppearsIn, &tree.WorkspaceRelativePath{
					WsUuid:  ws.UUID,
					WsLabel: ws.Label,
					Path:    relativePath,
				})
			} else {
				log.Logger(ctx).Error("Error while computing relative path to root", zap.Error(e))
			}
		}
	}

	return ctx, nil

}

func (h *UuidNodeHandler) relativePathToWsRoot(ctx context.Context, nodeFullPath string, rootNodeId string) (string, error) {

	if resp, e := h.next.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: rootNodeId}}); e == nil {
		rootPath := resp.Node.Path
		if strings.HasPrefix(nodeFullPath, rootPath) {
			return strings.TrimPrefix(nodeFullPath, rootPath), nil
		} else {
			return "", errors.NotFound("RouterUuid", "Cannot subtract paths "+nodeFullPath+" - "+rootPath)
		}
	} else {
		return "", e
	}

	return nodeFullPath, nil

}
