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
	"path"
	"strings"
	"time"

	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
)

// SyncFolderTasksHandler is a handler implementing synchronous operations for moving or deleting folders
type SyncFolderTasksHandler struct {
	AbstractHandler
}

// DeleteNode synchronously and recursively delete a node
func (h *SyncFolderTasksHandler) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...client.CallOption) (*tree.DeleteNodeResponse, error) {

	bi, _ := GetBranchInfo(ctx, "in")
	isFlat := bi.FlatStorage
	node := in.Node
	var err error
	if node.IsLeaf() {
		_, err = h.next.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: node.Clone()})
	} else {
		pFile := path.Join(node.Path, common.PydioSyncHiddenFile)
		// Now list all children and delete them all
		stream, er := h.next.ListNodes(ctx, &tree.ListNodesRequest{Node: node, Recursive: true})
		if er != nil {
			return nil, er
		}
		defer stream.Close()
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
			if _, err := h.next.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: resp.Node}); err != nil {
				log.Logger(ctx).Error("Error while deleting node child " + err.Error())
				return nil, err
			}
		}
		if !isFlat {
			fakeChild := node.Clone()
			fakeChild.Path = pFile
			initMetaPath := fakeChild.GetStringMeta(common.MetaNamespaceDatasourcePath)
			fakeChild.SetMeta(common.MetaNamespaceDatasourcePath, path.Join(initMetaPath, common.PydioSyncHiddenFile))
			_, err = h.next.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: fakeChild})
		} else {
			_, err = h.next.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: node.Clone()})
		}
	}
	if err != nil {
		return nil, err
	} else {
		return &tree.DeleteNodeResponse{Success: true}, nil
	}

}

// UpdateNode synchronously and recursively performs a Move operation of a node
func (h *SyncFolderTasksHandler) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...client.CallOption) (*tree.UpdateNodeResponse, error) {

	source := in.From
	target := in.To
	status := make(chan string)
	progress := make(chan float32)
	done := make(chan bool)
	// Transform identifier from => in
	if f, ok := GetBranchInfo(ctx, "from"); ok {
		ctx = WithBranchInfo(ctx, "in", f)
		// Make sure DATASOURCE_NAME is set
		if source.GetStringMeta(common.MetaNamespaceDatasourceName) == "" {
			log.Logger(ctx).Info("[SyncFolderTasksHandler] Updating DS name in Source")
			source.SetMeta(common.MetaNamespaceDatasourceName, f.Name)
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

	// TODO CHECK ACLs TO MAKE SURE THE WHOLE TREE IS MOVABLE
	log.Logger(ctx).Info("Should Copy/Move", source.Zap("from"), target.Zap("target"))

	err := CopyMoveNodes(ctx, h.next, source, target, true, false, status, progress)
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
