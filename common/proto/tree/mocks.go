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

package tree

import (
	"context"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/pydio/cells/common"
)

type StreamerMock struct{}

func (*StreamerMock) Context() context.Context {
	return nil
}
func (*StreamerMock) Request() client.Request {
	return nil
}
func (*StreamerMock) Send(interface{}) error {
	return nil
}
func (*StreamerMock) Recv(interface{}) error {
	return nil
}
func (*StreamerMock) Error() error {
	return nil
}
func (*StreamerMock) Close() error {
	return nil
}

type NodeProviderMock struct {
	Nodes map[string]string
}

func (m *NodeProviderMock) ReadNode(ctx context.Context, in *ReadNodeRequest, opts ...client.CallOption) (*ReadNodeResponse, error) {

	if in.Node.Path != "" {
		if v, ok := m.Nodes[in.Node.Path]; ok {
			resp := &ReadNodeResponse{
				Node: &Node{Path: in.Node.Path, Uuid: v},
			}
			return resp, nil
		}
	} else if in.Node.Uuid != "" {
		// Search by Uuid
		for k, v := range m.Nodes {
			if v == in.Node.Uuid {
				return &ReadNodeResponse{
					Node: &Node{Path: k, Uuid: v},
				}, nil
			}
		}
	}
	return nil, errors.NotFound(common.SERVICE_DATA_INDEX_, "Node not found")

}

func (m *NodeProviderMock) ListNodes(ctx context.Context, in *ListNodesRequest, opts ...client.CallOption) (NodeProvider_ListNodesClient, error) {

	// Create fake stream
	return &nodeProviderListNodesClient{stream: &StreamerMock{}}, nil

}

type NodeReceiverMock struct {
	Nodes map[string]string
}

func (m *NodeReceiverMock) CreateNode(ctx context.Context, in *CreateNodeRequest, opts ...client.CallOption) (*CreateNodeResponse, error) {
	return &CreateNodeResponse{Node: in.Node}, nil
}

func (m *NodeReceiverMock) UpdateNode(ctx context.Context, in *UpdateNodeRequest, opts ...client.CallOption) (*UpdateNodeResponse, error) {
	return &UpdateNodeResponse{Success: true}, nil
}

func (m *NodeReceiverMock) DeleteNode(ctx context.Context, in *DeleteNodeRequest, opts ...client.CallOption) (*DeleteNodeResponse, error) {
	return &DeleteNodeResponse{Success: true}, nil
}
