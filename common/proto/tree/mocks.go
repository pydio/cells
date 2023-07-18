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

package tree

import (
	"context"
	"io"
	"reflect"
	"sort"

	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/service/errors"
)

type ErrorThrower func(string, string, ...interface{}) error

var errorThrower ErrorThrower = func(string, string, ...interface{}) error {
	return nil
}

func PredefineError(f ErrorThrower) {
	errorThrower = f
}

func ShouldError(obj interface{}, fn string, params ...interface{}) error {
	return errorThrower(reflect.TypeOf(obj).String(), fn, params...)
}

type StreamerMock struct {
	c  context.Context
	ch chan Node
}

func (m *StreamerMock) Header() (metadata.MD, error) {
	return metadata.MD{}, nil
}

func (m *StreamerMock) Trailer() metadata.MD {
	return metadata.MD{}
}

func (m *StreamerMock) CloseSend() error {
	return nil
}

func (m *StreamerMock) SendMsg(msg interface{}) error {
	return nil
}

func (m *StreamerMock) RecvMsg(msg interface{}) error {
	return m.Recv(msg)
}

func NewStreamerMock(ctx context.Context, nodes map[string]Node) grpc.ClientStream {
	ch := make(chan Node)

	go func() {
		defer close(ch)

		var sorted []string

		for k := range nodes {
			sorted = append(sorted, k)
		}

		sort.Strings(sorted)

		for _, k := range sorted {
			ch <- nodes[k]
		}
	}()

	return &StreamerMock{
		c:  ctx,
		ch: ch,
	}
}

func (m *StreamerMock) Context() context.Context {
	return m.c
}
func (m *StreamerMock) Send(v interface{}) error {
	return nil
}
func (m *StreamerMock) Recv(v interface{}) error {

	node, ok := <-m.ch

	if err := ShouldError(m, "Recv", &node); err != nil {
		return err
	}

	if !ok {
		return io.EOF
	}

	r, _ := v.(*ListNodesResponse)
	r.Node = &node

	return nil
}
func (m *StreamerMock) Error() error {
	return nil
}
func (m *StreamerMock) Close() error {
	return nil
}

type NodeProviderMock struct {
	Nodes map[string]Node
}

func NewNodeProviderMock(n map[string]Node) *NodeProviderMock {
	return &NodeProviderMock{
		Nodes: n,
	}
}

func (m *NodeProviderMock) ReadNode(ctx context.Context, in *ReadNodeRequest, opts ...grpc.CallOption) (*ReadNodeResponse, error) {
	if in.Node.Path != "" {
		if v, ok := m.Nodes[in.Node.Path]; ok {
			resp := &ReadNodeResponse{
				Node: &v,
			}
			return resp, nil
		}
	} else if in.Node.Uuid != "" {
		// Search by Uuid
		for _, v := range m.Nodes {
			if v.Uuid == in.Node.Uuid {
				return &ReadNodeResponse{
					Node: &v,
				}, nil
			}
		}
	}
	return nil, errors.NotFound(common.ServiceDataIndex_, "N not found")
}

func (m *NodeProviderMock) ListNodes(ctx context.Context, in *ListNodesRequest, opts ...grpc.CallOption) (NodeProvider_ListNodesClient, error) {
	// Create fake stream
	return &nodeProviderListNodesClient{ClientStream: NewStreamerMock(ctx, m.Nodes)}, nil

}

type NodeReceiverMock struct {
	Nodes map[string]Node
}

func (m *NodeReceiverMock) CreateNode(ctx context.Context, in *CreateNodeRequest, opts ...grpc.CallOption) (*CreateNodeResponse, error) {
	if m.Nodes == nil {
		m.Nodes = make(map[string]Node)
	}
	m.Nodes[in.GetNode().GetPath()] = *in.GetNode()

	return &CreateNodeResponse{Node: in.Node}, nil
}

func (m *NodeReceiverMock) UpdateNode(ctx context.Context, in *UpdateNodeRequest, opts ...grpc.CallOption) (*UpdateNodeResponse, error) {
	return &UpdateNodeResponse{Success: true}, nil
}

func (m *NodeReceiverMock) DeleteNode(ctx context.Context, in *DeleteNodeRequest, opts ...grpc.CallOption) (*DeleteNodeResponse, error) {
	return &DeleteNodeResponse{Success: true}, nil
}

type SessionIndexerMock struct {
}

func (s *SessionIndexerMock) OpenSession(ctx context.Context, in *OpenSessionRequest, opts ...grpc.CallOption) (*OpenSessionResponse, error) {
	return &OpenSessionResponse{Session: in.GetSession()}, nil
}

func (s *SessionIndexerMock) FlushSession(ctx context.Context, in *FlushSessionRequest, opts ...grpc.CallOption) (*FlushSessionResponse, error) {
	return &FlushSessionResponse{}, nil
}

func (s *SessionIndexerMock) CloseSession(ctx context.Context, in *CloseSessionRequest, opts ...grpc.CallOption) (*CloseSessionResponse, error) {
	return &CloseSessionResponse{}, nil
}
