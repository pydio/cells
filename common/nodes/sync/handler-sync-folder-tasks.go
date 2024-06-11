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

package sync

import (
	"context"
	"path"
	"strings"
	"time"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
)

func WithFolderTasks() nodes.Option {
	return func(options *nodes.RouterOptions) {
		if options.SynchronousTasks {
			options.Wrappers = append(options.Wrappers, &FolderTasksHandler{})
		}
	}
}

// FolderTasksHandler is a handler implementing synchronous operations for moving or deleting folders
type FolderTasksHandler struct {
	abstract.Handler
}

func (h *FolderTasksHandler) Adapt(c nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	h.AdaptOptions(c, options)
	return h
}

// DeleteNode synchronously and recursively delete a node
func (h *FolderTasksHandler) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...grpc.CallOption) (*tree.DeleteNodeResponse, error) {

	bi, er := nodes.GetBranchInfo(ctx, "in")
	if er != nil {
		return nil, er
	}
	isFlat := bi.FlatStorage
	node := in.Node
	var err error
	if node.IsLeaf() {
		_, err = h.Next.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: node.Clone()})
	} else {
		pFile := path.Join(node.Path, common.PydioSyncHiddenFile)
		// Now list all children and delete them all
		stream, er := h.Next.ListNodes(ctx, &tree.ListNodesRequest{Node: node, Recursive: true})
		if er != nil {
			return nil, er
		}
		defer stream.CloseSend()
		for {
			resp, e := stream.Recv()
			if e != nil {
				break
			}
			if resp == nil {
				continue
			}
			if resp.Node.Path == pFile {
				continue
			}
			if !resp.Node.IsLeaf() {
				continue
			}
			if _, err := h.Next.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: resp.Node}); err != nil {
				log.Logger(ctx).Error("Error while deleting node child " + err.Error())
				return nil, err
			}
		}
		if !isFlat {
			fakeChild := node.Clone()
			fakeChild.Path = pFile
			initMetaPath := fakeChild.GetStringMeta(common.MetaNamespaceDatasourcePath)
			fakeChild.MustSetMeta(common.MetaNamespaceDatasourcePath, path.Join(initMetaPath, common.PydioSyncHiddenFile))
			_, err = h.Next.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: fakeChild})
		} else {
			_, err = h.Next.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: node.Clone()})
		}
	}
	if err != nil {
		return nil, err
	} else {
		return &tree.DeleteNodeResponse{Success: true}, nil
	}

}

// UpdateNode synchronously and recursively performs a Move operation of a node
func (h *FolderTasksHandler) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...grpc.CallOption) (*tree.UpdateNodeResponse, error) {

	source := in.From
	target := in.To
	status := make(chan string)
	progress := make(chan float32)
	done := make(chan bool)
	// Transform identifier from => in
	if f, er := nodes.GetBranchInfo(ctx, "from"); er == nil {
		ctx = nodes.WithBranchInfo(ctx, "in", f)
		// Make sure DATASOURCE_NAME is set
		if source.GetStringMeta(common.MetaNamespaceDatasourceName) == "" {
			log.Logger(ctx).Info("[FolderTasksHandler] Updating DS name in Source")
			source.MustSetMeta(common.MetaNamespaceDatasourceName, f.Name)
		}
	}
	go func() {
		for {
			select {
			case <-done:
				return
			case s := <-status:
				if !strings.HasPrefix(s, "Copying ") {
					log.Logger(ctx).Info(s)
				} else {
					log.Logger(ctx).Debug(s)
				}
			case pg := <-progress:
				log.Logger(ctx).Debug("progress", zap.Float32("pg", pg))
			}
		}
	}()

	log.Logger(ctx).Info("Should Copy/Move", source.Zap("from"), target.Zap("target"))

	err := nodes.CopyMoveNodes(ctx, h.Next, source, target, true, false, status, progress)
	close(done)
	close(status)
	close(progress)
	if err != nil {
		return nil, err
	}

	// Build a fake output node
	out := source.Clone()
	out.Path = target.Path
	out.MTime = time.Now().Unix()
	return &tree.UpdateNodeResponse{
		Node:    out,
		Success: true,
	}, nil

}
