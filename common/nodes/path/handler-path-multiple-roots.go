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

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/errors"
)

func WithMultipleRoots() nodes.Option {
	return func(options *nodes.RouterOptions) {
		options.Wrappers = append(options.Wrappers, NewPathMultipleRootsHandler())
	}
}

// MultipleRootsHandler handle special case of multiple-roots workspaces.
type MultipleRootsHandler struct {
	abstract.BranchFilter
}

func (m *MultipleRootsHandler) Adapt(c nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	m.AdaptOptions(c, options)
	return m
}

func NewPathMultipleRootsHandler() *MultipleRootsHandler {
	m := &MultipleRootsHandler{}
	m.OutputMethod = m.updateOutputBranch
	m.InputMethod = m.updateInputBranch
	return m
}

func (m *MultipleRootsHandler) setWorkspaceRootFlag(ws *idm.Workspace, node *tree.Node) *tree.Node {
	if strings.Trim(node.Path, "/") == "" {
		out := node.Clone()
		out.MustSetMeta(common.MetaFlagWorkspaceRoot, "true")
		if attributes := ws.LoadAttributes(); attributes.SkipRecycle {
			out.MustSetMeta(common.MetaFlagWorkspaceSkipRecycle, "true")
		}
		return out
	} else {
		return node
	}
}

func (m *MultipleRootsHandler) updateInputBranch(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {

	branch, set := nodes.GetBranchInfo(ctx, identifier)
	//log.Logger(ctx).Info("updateInput", zap.Any("branch", branch), zap.Bool("set", set), node.Zap())
	if !set || (branch.Workspace != nil && branch.UUID == "ROOT") || branch.Client != nil {
		return ctx, node, nil
	}
	if len(branch.RootUUIDs) == 1 {
		rootNode, err := m.LookupRoot(branch.RootUUIDs[0])
		if err != nil {
			return ctx, node, err
		}
		if !rootNode.IsLeaf() {
			branch.Root = rootNode
			return nodes.WithBranchInfo(ctx, identifier, branch), m.setWorkspaceRootFlag(branch.Workspace, node), nil
		}
	}

	// There are multiple root nodes: detect /node-uuid/ segment in the path
	out := node.Clone()
	parts := strings.Split(strings.Trim(node.Path, "/"), "/")
	if len(parts) > 0 {
		rootId := parts[0]
		rootKeys, e := m.GetRootKeys(branch.RootUUIDs)
		if e != nil {
			return ctx, out, e
		}
		for key, rNode := range rootKeys {
			if key == rootId || rootId == rNode.GetUuid() {
				branch.Root = rNode
				out.Path = strings.Join(parts[1:], "/") // Replace path parts
				ctx = nodes.WithBranchInfo(ctx, identifier, branch)
				break
			}
		}
	}
	if branch.Root == nil {
		return ctx, node, errors.NotFound("node.not.found", "Cannot find root node")
	}
	return ctx, m.setWorkspaceRootFlag(branch.Workspace, out), nil
}

func (m *MultipleRootsHandler) updateOutputBranch(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {

	branch, set := nodes.GetBranchInfo(ctx, identifier)
	out := node.Clone()
	if set && branch.DataSource != nil && branch.Workspace != nil && branch.UUID != "ROOT" {
		if branch.EncryptionMode != object.EncryptionMode_CLEAR {
			out.MustSetMeta(common.MetaFlagEncrypted, "true")
		}
		if branch.VersioningPolicyName != "" {
			out.MustSetMeta(common.MetaFlagVersioning, "true")
		}
		if h, o := branch.ConfigurationByKey(object.StorageKeyHashingVersion); o {
			out.MustSetMeta(common.MetaFlagHashingVersion, h)
		}
	}
	if !set || branch.Workspace == nil || branch.UUID == "ROOT" || len(branch.RootUUIDs) < 2 {
		return ctx, m.setWorkspaceRootFlag(branch.Workspace, out), nil
	}
	if len(branch.RootUUIDs) == 1 {
		root, _ := m.LookupRoot(branch.RootUUIDs[0])
		if !root.IsLeaf() {
			return ctx, m.setWorkspaceRootFlag(branch.Workspace, out), nil
		}
	}
	if branch.Root == nil {
		return ctx, node, nodes.ErrBranchInfoRootMissing(identifier)
	}
	// Prepend root node Uuid
	out = m.setWorkspaceRootFlag(branch.Workspace, out)
	out.Path = m.MakeRootKey(branch.Root) + "/" + strings.TrimLeft(node.Path, "/")
	return ctx, out, nil
}

func (m *MultipleRootsHandler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...grpc.CallOption) (tree.NodeProvider_ListNodesClient, error) {

	// First try, without modifying ctx & node
	_, out, err := m.updateInputBranch(ctx, in.Node, "in")
	if err != nil && errors.FromError(err).Status == "Not Found" {

		branch, _ := nodes.GetBranchInfo(ctx, "in")
		streamer := nodes.NewWrappingStreamer(ctx)
		nn, e := m.GetRootKeys(branch.RootUUIDs)
		if e != nil {
			return streamer, e
		}
		go func() {
			defer streamer.CloseSend()
			for rKey, rNode := range nn {
				node := rNode.Clone()
				node.Path = rKey
				// Re-read node to make sure it goes through other layers - Duplicate context
				localCtx := nodes.WithBranchInfo(ctx, "in", branch)
				t, e := m.ReadNode(localCtx, &tree.ReadNodeRequest{Node: node})
				if e != nil {
					log.Logger(ctx).Error("[Handler Multiple Root] Cannot read root node", zap.Error(e))
					continue
				}
				node = t.Node
				node.Path = rKey
				if strings.HasPrefix(node.GetUuid(), "DATASOURCE:") {
					node.MustSetMeta(common.MetaNamespaceNodeName, strings.TrimPrefix(node.GetUuid(), "DATASOURCE:"))
				}
				node.MustSetMeta(common.MetaFlagWorkspaceRoot, "true")
				log.Logger(ctx).Debug("[Multiple Root] Sending back node", node.Zap())
				streamer.Send(&tree.ListNodesResponse{Node: node})
			}
		}()
		return streamer, nil
	}
	in.Node = out
	return m.BranchFilter.ListNodes(ctx, in, opts...)

}

func (m *MultipleRootsHandler) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...grpc.CallOption) (*tree.ReadNodeResponse, error) {

	// First try, without modifying ctx & node
	_, out, err := m.updateInputBranch(ctx, in.Node, "in")
	if err != nil && errors.FromError(err).Status == "Not Found" && (in.Node.Path == "/" || in.Node.Path == "") {

		// Load multiple root nodes and build a fake parent node
		branch, _ := nodes.GetBranchInfo(ctx, "in")
		nn, e := m.GetRootKeys(branch.RootUUIDs)
		if e != nil {
			return &tree.ReadNodeResponse{Success: true, Node: &tree.Node{Path: ""}}, nil
		}
		fakeNode := &tree.Node{
			Path:  "",
			Type:  tree.NodeType_COLLECTION,
			Size:  0,
			MTime: 0,
		}
		hashingVersion := ""
		for _, node := range nn {
			fakeNode.Size += node.Size
			if node.MTime > fakeNode.MTime {
				fakeNode.MTime = node.MTime
			}
			if dsName := node.GetStringMeta(common.MetaNamespaceDatasourceName); dsName != "" {
				if ls, er := m.ClientsPool.GetDataSourceInfo(dsName); er == nil {
					h, _ := ls.ConfigurationByKey(object.StorageKeyHashingVersion)
					if hashingVersion != "" && h != hashingVersion {
						hashingVersion = "mixed"
					} else {
						hashingVersion = h
					}
				}
			}
		}
		if hashingVersion != "" {
			fakeNode.MustSetMeta(common.MetaFlagHashingVersion, hashingVersion)
		}
		fakeNode.MustSetMeta(common.MetaNamespaceNodeName, branch.Workspace.Label)
		fakeNode.MustSetMeta(common.MetaFlagVirtualRoot, "true")
		if branch.Workspace.Scope != idm.WorkspaceScope_LINK {
			fakeNode.MustSetMeta(common.MetaFlagLevelReadonly, "true")
		}
		return &tree.ReadNodeResponse{Success: true, Node: fakeNode}, nil
	}
	in.Node = out
	return m.BranchFilter.ReadNode(ctx, in, opts...)

}
