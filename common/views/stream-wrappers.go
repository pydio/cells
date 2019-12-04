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
	"encoding/json"
	"fmt"
	"io"

	"github.com/pydio/cells/common/proto/tree"
)

type NodeWrappingStreamer struct {
	*wrappingStreamer
}

func NewWrappingStreamer() *NodeWrappingStreamer {
	return &NodeWrappingStreamer{newWrappingStreamer()}
}

func (n *NodeWrappingStreamer) Recv() (*tree.ListNodesResponse, error) {
	msg, err := n.wrappingStreamer.Recv()
	if err != nil {
		return nil, err
	}

	return msg.GetListNodesResponse(), nil
}

type ChangesWrappingStreamer struct {
	*wrappingStreamer
}

func NewChangesWrappingStreamer() *ChangesWrappingStreamer {
	return &ChangesWrappingStreamer{newWrappingStreamer()}
}

func (l *ChangesWrappingStreamer) Recv() (*tree.NodeChangeEvent, error) {
	msg, err := l.wrappingStreamer.Recv()
	if err != nil {
		return nil, err
	}

	return msg.GetNodeChangeEvent(), nil
}

// TODO Switch to Proto encoding instead of json?
type wrappingStreamer struct {
	w       *io.PipeWriter
	r       *io.PipeReader
	closed  bool
	recvErr error
}

func newWrappingStreamer() *wrappingStreamer {
	r, w := io.Pipe()

	return &wrappingStreamer{
		w:      w,
		r:      r,
		closed: false,
	}
}

func (l *wrappingStreamer) Send(msg interface{}) error {
	enc := json.NewEncoder(l.w)
	switch v := msg.(type) {
	case *tree.ListNodesResponse:
		return enc.Encode(&tree.WrappingStreamerResponse{Data: &tree.WrappingStreamerResponse_ListNodesResponse{v}})
	case *tree.NodeChangeEvent:
		return enc.Encode(&tree.WrappingStreamerResponse{Data: &tree.WrappingStreamerResponse_NodeChangeEvent{v}})
	}
	return fmt.Errorf("unknown format")
}

func (l *wrappingStreamer) SendMsg(msg interface{}) error {
	return l.Send(msg)
}

func (l *wrappingStreamer) SendError(err error) error {
	enc := json.NewEncoder(l.w)
	return enc.Encode(&tree.WrappingStreamerResponse{Error: err.Error()})
}

func (l *wrappingStreamer) Recv() (*tree.WrappingStreamerResponse, error) {
	if l.closed {
		return nil, io.EOF
	}

	resp := &tree.WrappingStreamerResponse{}

	if err := json.NewDecoder(l.r).Decode(resp); err != nil {
		return nil, err
	}

	if resp.Error != "" {
		return nil, fmt.Errorf(resp.Error)
	}

	return resp, nil
}

func (l *wrappingStreamer) RecvMsg(m interface{}) error {
	resp, err := l.Recv()
	if err != nil {
		return err
	}

	m = resp

	return nil
}

func (l *wrappingStreamer) Close() error {
	l.closed = true
	l.w.Close()
	return nil
}
