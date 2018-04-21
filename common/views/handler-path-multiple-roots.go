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

	"github.com/golang/protobuf/proto"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
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

func (m *MultipleRootsHandler) updateInputBranch(ctx context.Context, identifier string, node *tree.Node) (context.Context, error) {

	branch, set := GetBranchInfo(ctx, identifier)
	//log.Logger(ctx).Debug("updateInput", zap.Any("branch", branch), zap.Bool("set", set))
	if !set || branch.UUID == "ROOT" || branch.Client != nil {
		return ctx, nil
	}
	if len(branch.RootNodes) == 1 {
		rootNode, err := m.getRoot(branch.RootNodes[0])
		if err != nil {
			return ctx, err
		}
		if !rootNode.IsLeaf() {
			branch.Root = rootNode
			ctx = WithBranchInfo(ctx, identifier, branch)
			return ctx, nil
		}
	}

	// There are multiple root nodes: detect /node-uuid/ segment in the path
	parts := strings.Split(strings.Trim(node.Path, "/"), "/")
	if len(parts) > 0 {
		rootId := parts[0]
		log.Logger(ctx).Debug("Searching", zap.String("root", rootId), zap.Any("rootNodes", branch.RootNodes))
		rootKeys, e := m.rootKeysMap(branch.RootNodes)
		if e != nil {
			return ctx, e
		}
		for key, rNode := range rootKeys {
			if key == rootId || rootId == rNode.GetUuid() {
				branch.Root = rNode
				node.Path = strings.Join(parts[1:], "/") // Replace path parts
				ctx = WithBranchInfo(ctx, identifier, branch)
				break
			}
		}
	}
	if branch.Root == nil {
		return ctx, errors.NotFound(VIEWS_LIBRARY_NAME, "Could not find root node")
	}
	return ctx, nil
}

func (m *MultipleRootsHandler) updateOutputBranch(ctx context.Context, identifier string, node *tree.Node) (context.Context, error) {

	branch, set := GetBranchInfo(ctx, identifier)
	if !set || branch.UUID == "ROOT" || len(branch.RootNodes) < 2 {
		return ctx, nil
	}
	if len(branch.RootNodes) == 1 {
		root, _ := m.getRoot(branch.RootNodes[0])
		if !root.IsLeaf() {
			return ctx, nil
		}
	}
	if branch.Root == nil {
		return ctx, errors.InternalServerError(VIEWS_LIBRARY_NAME, "No Root defined, this is not normal")
	}
	// Prepend root node Uuid
	node.Path = m.makeRootKey(branch.Root) + "/" + strings.TrimLeft(node.Path, "/")

	return ctx, nil
}

func (m *MultipleRootsHandler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...client.CallOption) (tree.NodeProvider_ListNodesClient, error) {

	// First try, without modifying ctx & node
	_, err := m.updateInputBranch(ctx, "in", &tree.Node{Path: in.Node.Path})
	if err != nil && errors.Parse(err.Error()).Status == "Not Found" {

		branch, _ := GetBranchInfo(ctx, "in")
		streamer := NewWrappingStreamer()
		nodes, e := m.rootKeysMap(branch.RootNodes)
		if e != nil {
			return streamer, e
		}
		go func() {
			defer streamer.Close()
			for rKey, rNode := range nodes {
				node := proto.Clone(rNode).(*tree.Node)
				node.Path = rKey
				streamer.Send(&tree.ListNodesResponse{Node: node})
			}
		}()
		return streamer, nil
	}
	return m.AbstractBranchFilter.ListNodes(ctx, in, opts...)

}

func (m *MultipleRootsHandler) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...client.CallOption) (*tree.ReadNodeResponse, error) {

	// First try, without modifying ctx & node
	_, err := m.updateInputBranch(ctx, "in", &tree.Node{Path: in.Node.Path})
	if err != nil && errors.Parse(err.Error()).Status == "Not Found" {

		// Load root nodes and
		// return a fake root node
		branch, _ := GetBranchInfo(ctx, "in")
		nodes, e := m.rootKeysMap(branch.RootNodes)
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
		fakeNode.SetMeta("name", branch.Workspace.Label)
		return &tree.ReadNodeResponse{Success: true, Node: fakeNode}, nil
	}
	return m.AbstractBranchFilter.ReadNode(ctx, in, opts...)

}
