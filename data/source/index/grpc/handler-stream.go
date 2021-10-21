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
)

// UpdateNodeStream implements the streaming version of UpdateNode for the TreeServer
func (s *TreeServer) UpdateNodeStream(ctx context.Context, stream tree.NodeReceiverStream_UpdateNodeStreamStream) error {
	var (
		err error
		req *tree.UpdateNodeRequest
	)
	for {
		req, err = stream.Recv()
		if err != nil {
			break
		}

		rsp := &tree.UpdateNodeResponse{}
		err = s.UpdateNode(ctx, req, rsp)
		if err != nil {
			break
		}

		err = stream.Send(rsp)
		if err != nil {
			break
		}
	}

	stream.Close()
	return err
}

// DeleteNodeStream implements the streaming version of DeleteNode for the TreeServer
func (s *TreeServer) DeleteNodeStream(ctx context.Context, stream tree.NodeReceiverStream_DeleteNodeStreamStream) error {
	var (
		err error
		req *tree.DeleteNodeRequest
	)
	for {
		req, err = stream.Recv()
		if err != nil {
			break
		}

		rsp := &tree.DeleteNodeResponse{}
		err = s.DeleteNode(ctx, req, rsp)
		if err != nil {
			break
		}

		err = stream.Send(rsp)
		if err != nil {
			break
		}
	}

	stream.Close()
	return err
}

// ReadNodeStream implements the streaming version of ReadNode for the TreeServer
func (s *TreeServer) ReadNodeStream(ctx context.Context, stream tree.NodeProviderStreamer_ReadNodeStreamStream) error {

	var (
		err error
		req *tree.ReadNodeRequest
	)
	for {
		req, err = stream.Recv()
		if err != nil {
			break
		}

		rsp := &tree.ReadNodeResponse{}
		err = s.ReadNode(ctx, req, rsp)
		if err != nil {
			err = stream.SendMsg(err)
		} else {
			err = stream.Send(rsp)
		}
		if err != nil {
			break
		}
	}

	stream.Close()
	return err

}
