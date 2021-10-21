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

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/tree"
)

// MultipleRootsHandler handle special case of multiple-roots workspaces.
type MultipleRootsHandler struct {
	AbstractBranchFilter
}

func NewPathMultipleRootsHandler() *MultipleRootsHandler {
	m := &MultipleRootsHandler{}
	m.outputMethod = m.updateOutputBranch
	m.inputMethod = m.updateInputBranch
	return m
}

func (m *MultipleRootsHandler) setWorkspaceRootFlag(ws *idm.Workspace, node *tree.Node) *tree.Node {
	if strings.Trim(node.Path, "/") == "" {
		out := node.Clone()
		out.SetMeta(common.MetaFlagWorkspaceRoot, "true")
		if attributes := ws.LoadAttributes(); attributes.SkipRecycle {
			out.SetMeta("ws_skip_recycle", "true")
		}
		return out
	} else {
		return node
	}
}

func (m *MultipleRootsHandler) updateInputBranch(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {

	branch, set := GetBranchInfo(ctx, identifier)
	//log.Logger(ctx).Info("updateInput", zap.Any("branch", branch), zap.Bool("set", set), node.Zap())
	if !set || branch.UUID == "ROOT" || branch.Client != nil {
		return ctx, node, nil
	}
	if len(branch.RootUUIDs) == 1 {
		rootNode, err := m.getRoot(branch.RootUUIDs[0])
		if err != nil {
			return ctx, node, err
		}
		if !rootNode.IsLeaf() {
			branch.Root = rootNode
			return WithBranchInfo(ctx, identifier, branch), m.setWorkspaceRootFlag(&branch.Workspace, node), nil
		}
	}

	// There are multiple root nodes: detect /node-uuid/ segment in the path
	out := node.Clone()
	parts := strings.Split(strings.Trim(node.Path, "/"), "/")
	if len(parts) > 0 {
		rootId := parts[0]
		rootKeys, e := m.rootKeysMap(branch.RootUUIDs)
		if e != nil {
			return ctx, out, e
		}
		for key, rNode := range rootKeys {
			if key == rootId || rootId == rNode.GetUuid() {
				branch.Root = rNode
				out.Path = strings.Join(parts[1:], "/") // Replace path parts
				ctx = WithBranchInfo(ctx, identifier, branch)
				break
			}
		}
	}
	if branch.Root == nil {
		return ctx, node, errors.NotFound(VIEWS_LIBRARY_NAME, "Could not find root node")
	}
	return ctx, m.setWorkspaceRootFlag(&branch.Workspace, out), nil
}

func (m *MultipleRootsHandler) updateOutputBranch(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {

	branch, set := GetBranchInfo(ctx, identifier)
	out := node.Clone()
	if set && branch.UUID != "ROOT" {
		if branch.EncryptionMode != object.EncryptionMode_CLEAR {
			out.SetMeta(common.MetaFlagEncrypted, "true")
		}
		if branch.VersioningPolicyName != "" {
			out.SetMeta(common.MetaFlagVersioning, "true")
		}
	}
	if !set || branch.UUID == "ROOT" || len(branch.RootUUIDs) < 2 {
		return ctx, m.setWorkspaceRootFlag(&branch.Workspace, out), nil
	}
	if len(branch.RootUUIDs) == 1 {
		root, _ := m.getRoot(branch.RootUUIDs[0])
		if !root.IsLeaf() {
			return ctx, m.setWorkspaceRootFlag(&branch.Workspace, out), nil
		}
	}
	if branch.Root == nil {
		return ctx, node, errors.InternalServerError(VIEWS_LIBRARY_NAME, "No Root defined, this is not normal")
	}
	// Prepend root node Uuid
	out = m.setWorkspaceRootFlag(&branch.Workspace, out)
	out.Path = m.makeRootKey(branch.Root) + "/" + strings.TrimLeft(node.Path, "/")
	return ctx, out, nil
}

func (m *MultipleRootsHandler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...client.CallOption) (tree.NodeProvider_ListNodesClient, error) {

	// First try, without modifying ctx & node
	_, out, err := m.updateInputBranch(ctx, in.Node, "in")
	if err != nil && errors.Parse(err.Error()).Status == "Not Found" {

		branch, _ := GetBranchInfo(ctx, "in")
		streamer := NewWrappingStreamer()
		nodes, e := m.rootKeysMap(branch.RootUUIDs)
		if e != nil {
			return streamer, e
		}
		go func() {
			defer streamer.Close()
			for rKey, rNode := range nodes {
				node := rNode.Clone()
				node.Path = rKey
				// Re-read node to make sure it goes through other layers - Duplicate context
				localCtx := WithBranchInfo(ctx, "in", branch)
				t, e := m.ReadNode(localCtx, &tree.ReadNodeRequest{Node: node})
				if e != nil {
					log.Logger(ctx).Error("[Handler Multiple Root] Cannot read root node", zap.Error(e))
					continue
				}
				node = t.Node
				node.Path = rKey
				if strings.HasPrefix(node.GetUuid(), "DATASOURCE:") {
					node.SetMeta(common.MetaNamespaceNodeName, strings.TrimPrefix(node.GetUuid(), "DATASOURCE:"))
				}
				node.SetMeta(common.MetaFlagWorkspaceRoot, "true")
				log.Logger(ctx).Debug("[Multiple Root] Sending back node", node.Zap())
				streamer.Send(&tree.ListNodesResponse{Node: node})
			}
		}()
		return streamer, nil
	}
	in.Node = out
	return m.AbstractBranchFilter.ListNodes(ctx, in, opts...)

}

func (m *MultipleRootsHandler) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...client.CallOption) (*tree.ReadNodeResponse, error) {

	// First try, without modifying ctx & node
	_, out, err := m.updateInputBranch(ctx, in.Node, "in")
	if err != nil && errors.Parse(err.Error()).Status == "Not Found" && (in.Node.Path == "/" || in.Node.Path == "") {

		// Load root nodes and
		// return a fake root node
		branch, _ := GetBranchInfo(ctx, "in")
		nodes, e := m.rootKeysMap(branch.RootUUIDs)
		if e != nil {
			return &tree.ReadNodeResponse{Success: true, Node: &tree.Node{Path: ""}}, nil
		}
		fakeNode := &tree.Node{
			Path:  "",
			Type:  tree.NodeType_COLLECTION,
			Size:  0,
			MTime: 0,
		}
		for _, node := range nodes {
			fakeNode.Size += node.Size
			if node.MTime > fakeNode.MTime {
				fakeNode.MTime = node.MTime
			}
		}
		fakeNode.SetMeta(common.MetaNamespaceNodeName, branch.Workspace.Label)
		fakeNode.SetMeta(common.MetaFlagVirtualRoot, "true")
		if branch.Workspace.Scope != idm.WorkspaceScope_LINK {
			fakeNode.SetMeta(common.MetaFlagLevelReadonly, "true")
		}
		return &tree.ReadNodeResponse{Success: true, Node: fakeNode}, nil
	}
	in.Node = out
	return m.AbstractBranchFilter.ReadNode(ctx, in, opts...)

}
