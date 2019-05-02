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

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"

	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/permissions"
)

type PathWorkspaceHandler struct {
	AbstractBranchFilter
}

func NewPathWorkspaceHandler() *PathWorkspaceHandler {
	u := &PathWorkspaceHandler{}
	u.inputMethod = u.updateBranchInfo
	u.outputMethod = u.updateOutputBranch
	return u
}

func (a *PathWorkspaceHandler) extractWs(ctx context.Context, node *tree.Node) (*idm.Workspace, bool, error) {

	// Admin context, fake workspace with root ROOT
	if admin, a := ctx.Value(ctxAdminContextKey{}).(bool); admin && a {
		ws := &idm.Workspace{}
		ws.UUID = "ROOT"
		ws.RootUUIDs = []string{"ROOT"}
		ws.Slug = "ROOT"
		return ws, true, nil
	}

	// User context, folder path must start with /wsId/ or we are listing the root.
	if accessList, ok := ctx.Value(CtxUserAccessListKey{}).(*permissions.AccessList); ok {
		parts := strings.Split(strings.Trim(node.Path, "/"), "/")
		if len(parts) > 0 && len(parts[0]) > 0 {
			// Find by slug
			for _, ws := range accessList.Workspaces {
				if ws.Slug == parts[0] {
					node.Path = strings.Join(parts[1:], "/")
					return ws, true, nil
				}
			}
			// There is a workspace but it is not in the ACL !"
			return nil, false, errors.Forbidden("workspace.not.accessible", "Workspace %s is not accessible", parts[0])
		} else {
			// Root without workspace part
			return nil, false, nil
		}
	}

	return nil, false, nil
}

func (a *PathWorkspaceHandler) updateBranchInfo(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {
	if info, alreadySet := GetBranchInfo(ctx, identifier); alreadySet && info.Client != nil {
		return ctx, node, nil
	}
	branchInfo := BranchInfo{}
	out := node.Clone()
	ws, ok, err := a.extractWs(ctx, out)
	if err != nil {
		return ctx, node, err
	} else if ok {
		branchInfo.Workspace = *ws
		return WithBranchInfo(ctx, identifier, branchInfo), out, nil
	}
	return ctx, node, errors.NotFound(VIEWS_LIBRARY_NAME, "Workspace not found in Path")
}

func (a *PathWorkspaceHandler) updateOutputBranch(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {
	// Prepend Slug to path
	if info, set := GetBranchInfo(ctx, identifier); set && info.UUID != "ROOT" {
		out := node.Clone()
		out.Path = info.Slug + "/" + node.Path
		return ctx, out, nil
	}
	return ctx, node, nil
}

func (a *PathWorkspaceHandler) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...client.CallOption) (*tree.ReadNodeResponse, error) {
	_, _, err := a.updateBranchInfo(ctx, &tree.Node{Path: in.Node.Path}, "in")
	if err != nil {
		if errors.Parse(err.Error()).Status == "Not Found" {
			// Return a fake root node
			return &tree.ReadNodeResponse{Success: true, Node: &tree.Node{Path: ""}}, nil
		} else {
			return nil, err
		}
	}
	return a.AbstractBranchFilter.ReadNode(ctx, in, opts...)

}

func (a *PathWorkspaceHandler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...client.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	_, _, wsFound := a.updateBranchInfo(ctx, &tree.Node{Path: in.Node.Path}, "in")
	if wsFound != nil && errors.Parse(wsFound.Error()).Status == "Not Found" {
		// List user workspaces here
		accessList, ok := ctx.Value(CtxUserAccessListKey{}).(*permissions.AccessList)
		if !ok {
			return nil, errors.InternalServerError(VIEWS_LIBRARY_NAME, "Cannot find user workspaces")
		}
		streamer := NewWrappingStreamer()
		go func() {
			defer streamer.Close()
			for _, ws := range accessList.Workspaces {
				if len(ws.RootUUIDs) > 0 {
					node := &tree.Node{
						Type: tree.NodeType_COLLECTION,
						Uuid: ws.RootUUIDs[0],
						Path: ws.Slug,
					}
					streamer.Send(&tree.ListNodesResponse{Node: node})
				}
			}
		}()
		return streamer, nil
	}
	return a.AbstractBranchFilter.ListNodes(ctx, in, opts...)
}
