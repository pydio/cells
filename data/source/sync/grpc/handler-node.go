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

package grpc

import (
	"context"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

// CreateNode Forwards to Index
func (s *Handler) CreateNode(ctx context.Context, req *tree.CreateNodeRequest, resp *tree.CreateNodeResponse) error {

	e := s.s3client.(model.PathSyncTarget).CreateNode(ctx, req.Node, req.UpdateIfExists)
	if e != nil {
		return e
	}
	resp.Node = req.Node
	return nil
}

// UpdateNode Forwards to S3
func (s *Handler) UpdateNode(ctx context.Context, req *tree.UpdateNodeRequest, resp *tree.UpdateNodeResponse) error {

	e := s.s3client.(model.PathSyncTarget).MoveNode(ctx, req.From.Path, req.To.Path)
	if e != nil {
		resp.Success = false
		return e
	}
	resp.Success = true
	return nil
}

// DeleteNode Forwards to S3
func (s *Handler) DeleteNode(ctx context.Context, req *tree.DeleteNodeRequest, resp *tree.DeleteNodeResponse) error {

	e := s.s3client.(model.PathSyncTarget).DeleteNode(ctx, req.Node.Path)
	if e != nil {
		resp.Success = false
		return e
	}
	resp.Success = true
	return nil
}

// ReadNode Forwards to Index
func (s *Handler) ReadNode(ctx context.Context, req *tree.ReadNodeRequest, resp *tree.ReadNodeResponse) error {

	r, e := s.indexClientRead.ReadNode(ctx, req)
	if e != nil {
		return e
	}
	resp.Success = true
	resp.Node = r.Node
	return nil

}

// ListNodes Forward to index
func (s *Handler) ListNodes(ctx context.Context, req *tree.ListNodesRequest, resp tree.NodeProvider_ListNodesStream) error {

	client, e := s.indexClientRead.ListNodes(ctx, req)
	if e != nil {
		return e
	}
	defer client.Close()
	for {
		nodeResp, re := client.Recv()
		if nodeResp == nil {
			break
		}
		if re != nil {
			return e
		}
		se := resp.Send(nodeResp)
		if se != nil {
			return e
		}
	}

	return nil
}
