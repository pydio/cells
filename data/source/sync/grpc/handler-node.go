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

	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/sync/model"
)

// CreateNode Forwards to Index
func (s *Handler) CreateNode(ctx context.Context, req *tree.CreateNodeRequest) (*tree.CreateNodeResponse, error) {

	resp := &tree.CreateNodeResponse{}
	e := s.s3client.(model.PathSyncTarget).CreateNode(ctx, req.Node, req.UpdateIfExists)
	if e != nil {
		return nil, e
	}
	resp.Node = req.Node
	return resp, nil
}

// UpdateNode Forwards to S3
func (s *Handler) UpdateNode(ctx context.Context, req *tree.UpdateNodeRequest) (*tree.UpdateNodeResponse, error) {

	resp := &tree.UpdateNodeResponse{}
	e := s.s3client.(model.PathSyncTarget).MoveNode(ctx, req.From.Path, req.To.Path)
	if e != nil {
		resp.Success = false
		return resp, e
	}
	resp.Success = true
	return resp, nil
}

// DeleteNode Forwards to S3
func (s *Handler) DeleteNode(ctx context.Context, req *tree.DeleteNodeRequest) (*tree.DeleteNodeResponse, error) {

	resp := &tree.DeleteNodeResponse{}
	e := s.s3client.(model.PathSyncTarget).DeleteNode(ctx, req.Node.Path)
	if e != nil {
		resp.Success = false
		return resp, e
	}
	resp.Success = true
	return resp, nil
}

// ReadNode Forwards to Index
func (s *Handler) ReadNode(ctx context.Context, req *tree.ReadNodeRequest) (*tree.ReadNodeResponse, error) {

	resp := &tree.ReadNodeResponse{}
	r, e := s.indexClientRead.ReadNode(ctx, req)
	if e != nil {
		return nil, e
	}
	resp.Success = true
	resp.Node = r.Node
	return resp, nil

}

// ListNodes Forward to index
func (s *Handler) ListNodes(req *tree.ListNodesRequest, resp tree.NodeProvider_ListNodesServer) error {

	ctx := resp.Context()
	client, e := s.indexClientRead.ListNodes(ctx, req)
	if e != nil {
		return e
	}
	defer client.CloseSend()
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

// PostNodeChanges receives NodeChangesEvents, to be used with FallbackWatcher
func (s *Handler) PostNodeChanges(server tree.NodeChangesReceiverStreamer_PostNodeChangesServer) error {
	for {
		event, err := server.Recv()
		if err != nil {
			return err
		}
		if s.changeEventsFallback != nil {
			s.changeEventsFallback <- event
		}
	}

}
