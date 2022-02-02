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
	"github.com/pydio/cells/v4/common/proto/tree"
)

// CreateNodeStream implementation for the TreeServer.
func (s *TreeServer) CreateNodeStream(stream tree.NodeReceiverStream_CreateNodeStreamServer) error {
	var (
		err error
		req *tree.CreateNodeRequest
	)
	for {
		req, err = stream.Recv()
		if err != nil {
			break
		}

		rsp, err := s.CreateNode(stream.Context(), req)
		if err != nil {
			break
		}

		err = stream.Send(rsp)
		if err != nil {
			break
		}
	}

	return err
}

// UpdateNodeStream implements the streaming version of UpdateNode for the TreeServer
func (s *TreeServer) UpdateNodeStream(stream tree.NodeReceiverStream_UpdateNodeStreamServer) error {
	var (
		err error
		req *tree.UpdateNodeRequest
	)
	for {
		req, err = stream.Recv()
		if err != nil {
			break
		}

		rsp, err := s.UpdateNode(stream.Context(), req)
		if err != nil {
			break
		}

		err = stream.Send(rsp)
		if err != nil {
			break
		}
	}

	return err
}

// DeleteNodeStream implements the streaming version of DeleteNode for the TreeServer
func (s *TreeServer) DeleteNodeStream(stream tree.NodeReceiverStream_DeleteNodeStreamServer) error {
	var (
		err error
		req *tree.DeleteNodeRequest
	)
	for {
		req, err = stream.Recv()
		if err != nil {
			break
		}

		rsp, err := s.DeleteNode(stream.Context(), req)
		if err != nil {
			break
		}

		err = stream.Send(rsp)
		if err != nil {
			break
		}
	}

	return err
}

// ReadNodeStream implements the streaming version of ReadNode for the TreeServer
func (s *TreeServer) ReadNodeStream(stream tree.NodeProviderStreamer_ReadNodeStreamServer) error {

	var (
		err error
		req *tree.ReadNodeRequest
	)
	for {
		req, err = stream.Recv()
		if err != nil {
			break
		}

		rsp, err := s.ReadNode(stream.Context(), req)
		if err != nil {
			err = stream.SendMsg(err)
		} else {
			err = stream.Send(rsp)
		}
		if err != nil {
			break
		}
	}

	return err
}
