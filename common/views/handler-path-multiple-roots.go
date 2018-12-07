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
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/tree"
)

type MultipleRootsHandler struct {
	AbstractBranchFilter
}

func NewPathMultipleRootsHandler() *MultipleRootsHandler {
	m := &MultipleRootsHandler{}
	m.outputMethod = m.updateOutputBranch
	m.inputMethod = m.updateInputBranch
	return m
}

func (m *MultipleRootsHandler) updateInputBranch(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {

	branch, set := GetBranchInfo(ctx, identifier)
	//log.Logger(ctx).Debug("updateInput", zap.Any("branch", branch), zap.Bool("set", set))
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
			ctx = WithBranchInfo(ctx, identifier, branch)
			return ctx, node, nil
		}
	}

	// There are multiple root nodes: detect /node-uuid/ segment in the path
	out := node.Clone()
	parts := strings.Split(strings.Trim(node.Path, "/"), "/")
	if len(parts) > 0 {
		rootId := parts[0]
		log.Logger(ctx).Debug("Searching", zap.String("root", rootId), zap.Any("rootNodes", branch.RootUUIDs))
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
	return ctx, out, nil
}

func (m *MultipleRootsHandler) updateOutputBranch(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {

	branch, set := GetBranchInfo(ctx, identifier)
	if set && branch.UUID != "ROOT" {
		if branch.EncryptionMode != object.EncryptionMode_CLEAR {
			node.SetMeta(common.META_FLAG_ENCRYPTED, "true")
		}
		if branch.VersioningPolicyName != "" {
			node.SetMeta(common.META_FLAG_VERSIONING, "true")
		}
	}
	if !set || branch.UUID == "ROOT" || len(branch.RootUUIDs) < 2 {
		return ctx, node, nil
	}
	if len(branch.RootUUIDs) == 1 {
		root, _ := m.getRoot(branch.RootUUIDs[0])
		if !root.IsLeaf() {
			return ctx, node, nil
		}
	}
	if branch.Root == nil {
		return ctx, node, errors.InternalServerError(VIEWS_LIBRARY_NAME, "No Root defined, this is not normal")
	}
	// Prepend root node Uuid
	// First Level
	out := node.Clone()
	firstLevel := false
	if strings.Trim(node.Path, "/") == "" {
		firstLevel = true
	}
	out.Path = m.makeRootKey(branch.Root) + "/" + strings.TrimLeft(node.Path, "/")
	if firstLevel {
		out.SetMeta(common.META_FLAG_WORKSPACE_ROOT, "true")
	}
	return ctx, out, nil
}

func (m *MultipleRootsHandler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...client.CallOption) (tree.NodeProvider_ListNodesClient, error) {

	// First try, without modifying ctx & node
	_, _, err := m.updateInputBranch(ctx, &tree.Node{Path: in.Node.Path}, "in")
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
				if strings.HasPrefix(node.GetUuid(), "DATASOURCE:") {
					node.SetMeta(common.META_NAMESPACE_NODENAME, strings.TrimPrefix(node.GetUuid(), "DATASOURCE:"))
				}
				node.SetMeta(common.META_FLAG_WORKSPACE_ROOT, "true")
				streamer.Send(&tree.ListNodesResponse{Node: node})
			}
		}()
		return streamer, nil
	}
	return m.AbstractBranchFilter.ListNodes(ctx, in, opts...)

}

func (m *MultipleRootsHandler) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...client.CallOption) (*tree.ReadNodeResponse, error) {

	// First try, without modifying ctx & node
	_, _, err := m.updateInputBranch(ctx, &tree.Node{Path: in.Node.Path}, "in")
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
		fakeNode.SetMeta(common.META_NAMESPACE_NODENAME, branch.Workspace.Label)
		fakeNode.SetMeta(common.META_FLAG_VIRTUAL_ROOT, "true")
		fakeNode.SetMeta(common.META_FLAG_LEVEL_READONLY, "true")
		return &tree.ReadNodeResponse{Success: true, Node: fakeNode}, nil
	}
	return m.AbstractBranchFilter.ReadNode(ctx, in, opts...)

}
