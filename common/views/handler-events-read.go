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
	"io"

	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
)

type HandlerEventRead struct {
	AbstractHandler
}

func (h *HandlerEventRead) feedNodeUuid(ctx context.Context, node *tree.Node) error {
	response, e := h.next.ReadNode(ctx, &tree.ReadNodeRequest{Node: node})
	if e != nil {
		return e
	}
	node.Uuid = response.Node.Uuid
	node.Type = response.Node.Type
	return nil
}

func (h *HandlerEventRead) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...client.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	c, e := h.next.ListNodes(ctx, in, opts...)
	if branchInfo, ok := GetBranchInfo(ctx, "in"); ok && branchInfo.Binary {
		return c, e
	}
	if e == nil && in.Node != nil {
		node := in.Node.Clone()
		if node.Uuid == "" {
			if e := h.feedNodeUuid(ctx, node); e != nil {
				log.Logger(ctx).Error("HandlerEventRead did not find Uuid!", zap.Error(e))
			}
		}
		if node.Uuid != "" {
			go func() {
				client.Publish(ctx, client.NewPublication(common.TOPIC_TREE_CHANGES, &tree.NodeChangeEvent{
					Type:   tree.NodeChangeEvent_READ,
					Target: node,
				}))
			}()
		}
	}
	return c, e
}

func (h *HandlerEventRead) GetObject(ctx context.Context, node *tree.Node, requestData *GetRequestData) (io.ReadCloser, error) {
	reader, e := h.next.GetObject(ctx, node, requestData)
	if branchInfo, ok := GetBranchInfo(ctx, "in"); ok && branchInfo.Binary {
		return reader, e
	}
	if e == nil {
		eventNode := node.Clone()
		if eventNode.Uuid == "" {
			if e := h.feedNodeUuid(ctx, eventNode); e != nil {
				log.Logger(ctx).Error("HandlerEventRead did not find Uuid!", zap.Error(e))
			}
		}
		if eventNode.Uuid != "" {
			go func() {
				client.Publish(ctx, client.NewPublication(common.TOPIC_TREE_CHANGES, &tree.NodeChangeEvent{
					Type:   tree.NodeChangeEvent_READ,
					Target: eventNode,
				}))
			}()
		}
	}
	return reader, e

}
