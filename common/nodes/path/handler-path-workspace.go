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

package path

import (
	"context"
	"strings"

	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/middleware/keys"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/abstract"
	"github.com/pydio/cells/v5/common/nodes/acl"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

func WithWorkspace() nodes.Option {
	return func(options *nodes.RouterOptions) {
		options.Wrappers = append(options.Wrappers, newWorkspaceHandler())
	}
}

// WorkspaceHandler is an BranchFilter extracting workspace and managing path inside the workspace.
type WorkspaceHandler struct {
	abstract.BranchFilter
}

func (a *WorkspaceHandler) Adapt(c nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	a.AdaptOptions(c, options)
	return a
}

type noWorkspaceInPath struct{}

func (noWorkspaceInPath) Error() string {
	return "no.workspace.in.path"
}

func newWorkspaceHandler() *WorkspaceHandler {
	u := &WorkspaceHandler{}
	u.InputMethod = u.updateBranchInfo
	u.OutputMethod = u.updateOutputBranch
	return u
}

func (a *WorkspaceHandler) extractWs(ctx context.Context, node *tree.Node) (*idm.Workspace, bool, error) {

	// Admin context, fake workspace with root ROOT
	if acl.HasAdminKey(ctx) {
		ws := &idm.Workspace{}
		ws.UUID = "ROOT"
		ws.RootUUIDs = []string{"ROOT"}
		ws.Slug = "ROOT"
		return ws, true, nil
	}

	// User context, folder path must start with /wsId/ or we are listing the root.
	if accessList, ok := acl.FromContext(ctx); ok {
		parts := strings.Split(strings.Trim(node.Path, "/"), "/")
		if len(parts) > 0 && len(parts[0]) > 0 {
			// Find by slug
			for _, ws := range accessList.GetWorkspaces() {
				if ws.Slug == parts[0] {
					node.Path = strings.Join(parts[1:], "/")
					return ws, true, nil
				}
			}
			// There is a workspace in path, but it is not in the ACL!
			return nil, false, errors.WithMessagef(errors.WorkspaceNotFound, "Workspace %s is not found in accessList", parts[0])
		} else {
			// Root without workspace part
			return nil, false, nil
		}
	}

	return nil, false, nil
}

func (a *WorkspaceHandler) updateBranchInfo(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {
	if info, er := nodes.GetBranchInfo(ctx, identifier); er == nil && info.Client != nil {
		return ctx, node, nil
	}
	branchInfo := nodes.BranchInfo{}
	out := node.Clone()
	ws, ok, err := a.extractWs(ctx, out)
	if err != nil {
		return ctx, node, err
	} else if ok {
		branchInfo.Workspace = proto.Clone(ws).(*idm.Workspace)
		if _, ok := propagator.CanonicalMeta(ctx, keys.CtxWorkspaceUuid); !ok { // do not override if already set
			ctx = propagator.WithAdditionalMetadata(ctx, map[string]string{
				keys.CtxWorkspaceUuid: ws.UUID,
			})
		}
		return nodes.WithBranchInfo(ctx, identifier, branchInfo), out, nil
	}
	return ctx, node, noWorkspaceInPath{}
}

func (a *WorkspaceHandler) updateOutputBranch(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {
	// Prepend Slug to path
	if info, er := nodes.GetBranchInfo(ctx, identifier); er == nil && info.UUID != "ROOT" {
		out := node.Clone()
		out.Path = info.Slug + "/" + node.Path
		return ctx, out, nil
	}
	return ctx, node, nil
}

func (a *WorkspaceHandler) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...grpc.CallOption) (*tree.ReadNodeResponse, error) {
	_, _, err := a.updateBranchInfo(ctx, &tree.Node{Path: in.Node.Path}, "in")
	if err != nil {
		if err.Error() == (noWorkspaceInPath{}).Error() {
			// Return a fake root node
			return &tree.ReadNodeResponse{Success: true, Node: &tree.Node{Path: ""}}, nil
		} else {
			return nil, err
		}
	}
	return a.BranchFilter.ReadNode(ctx, in, opts...)

}

func (a *WorkspaceHandler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...grpc.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	_, _, err := a.updateBranchInfo(ctx, &tree.Node{Path: in.Node.Path}, "in")
	if err != nil {
		// Real error
		if err.Error() != (noWorkspaceInPath{}).Error() {
			return nil, err
		}
		// List user workspaces here
		accessList, ok := acl.FromContext(ctx)
		if !ok {
			return nil, errors.WithStack(errors.BranchInfoACLMissing)
		}
		streamer := nodes.NewWrappingStreamer(ctx)
		go func() {
			defer streamer.CloseSend()
			wss := accessList.GetWorkspaces()
			for wsId, wsPermissions := range accessList.DetectedWsRights(ctx) {
				ws, o := wss[wsId]
				if !o {
					// This is the case if wsId is "settings" or "homepage" => ignore!
					continue
				}
				if len(ws.RootUUIDs) > 0 {
					node := &tree.Node{
						Type: tree.NodeType_COLLECTION,
						Uuid: ws.RootUUIDs[0],
						Path: ws.Slug,
					}
					// Pass workspace data along in node MetaStore
					node.MustSetMeta(common.MetaFlagWorkspaceScope, ws.Scope.String())
					node.MustSetMeta(common.MetaFlagWorkspacePermissions, wsPermissions.String())
					node.MustSetMeta(common.MetaFlagWorkspaceLabel, ws.Label)
					node.MustSetMeta(common.MetaFlagWorkspaceDescription, ws.Description)
					node.MustSetMeta(common.MetaFlagWorkspaceSlug, ws.Slug)
					node.MustSetMeta(common.MetaFlagWorkspaceUuid, ws.UUID)
					attributes := ws.LoadAttributes()
					if common.PackageType == "PydioHome" && ws.Scope == idm.WorkspaceScope_ADMIN {
						node.MustSetMeta(common.MetaFlagWorkspaceSyncable, true)
					} else if attributes.AllowSync {
						// Trigger a read to make sure that sync is not disabled by policy
						if readCtx, readNode, er := a.updateBranchInfo(ctx, node.Clone(), "in"); er == nil {
							readNode.MustSetMeta(nodes.MetaAclCheckSyncable, true)
							if r, e := a.Next.ReadNode(readCtx, &tree.ReadNodeRequest{Node: readNode}); e == nil {
								var v bool
								if r.GetNode().HasMetaKey(common.MetaFlagWorkspaceSyncable) {
									r.GetNode().GetMeta(common.MetaFlagWorkspaceSyncable, &v)
								} else {
									v = true
								}
								node.MustSetMeta(common.MetaFlagWorkspaceSyncable, v)
							} else {
								log.Logger(ctx).Error("Cannot read workspace node during list nodes for workspaces", zap.Error(e))
							}
						} else {
							log.Logger(ctx).Error("Cannot update branch info on workspace node", zap.Error(er))
						}
					}
					streamer.Send(&tree.ListNodesResponse{Node: node})
				}
			}
		}()
		return streamer, nil
	}
	return a.BranchFilter.ListNodes(ctx, in, opts...)
}
