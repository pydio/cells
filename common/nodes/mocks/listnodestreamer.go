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

// Package mocks should provide utils used by tests to mock various layers.
//
// It currently implements a ListNodeStreamer used in many places for faking responses to tree.ListNodes requests.
package mocks

import (
	"context"
	"io"

	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v4/common/proto/tree"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

type ListNodeStreamer struct {
	w *io.PipeWriter
	r *io.PipeReader
}

func (l *ListNodeStreamer) Context() context.Context {
	return context.Background()
}

func NewListNodeStreamer() *ListNodeStreamer {
	r, w := io.Pipe()

	return &ListNodeStreamer{
		w: w,
		r: r,
	}
}

func (l *ListNodeStreamer) Send(resp *tree.ListNodesResponse) error {

	enc := json.NewEncoder(l.w)
	enc.Encode(resp)
	return nil
}

func (l *ListNodeStreamer) SendMsg(interface{}) error {
	return nil
}

func (l *ListNodeStreamer) Recv() (*tree.ListNodesResponse, error) {
	resp := &tree.ListNodesResponse{}
	dec := json.NewDecoder(l.r)

	err := dec.Decode(resp)
	return resp, err
}

func (l *ListNodeStreamer) RecvMsg(interface{}) error {
	return nil
}

func (l *ListNodeStreamer) Close() error {
	l.w.Close()
	return nil
}

func (l *ListNodeStreamer) ReceiveAllNodes() (nodes []*tree.Node) {

	for {
		response, err := l.Recv()

		if err != nil || response == nil {
			break
		}
		nodes = append(nodes, response.Node)
	}

	return nodes
}

func (l *ListNodeStreamer) SetHeader(md metadata.MD) error {
	panic("implement me")
}

func (l *ListNodeStreamer) SendHeader(md metadata.MD) error {
	panic("implement me")
}

func (l *ListNodeStreamer) SetTrailer(md metadata.MD) {
	panic("implement me")
}
