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
	"encoding/binary"
	"fmt"
	"io"

	"github.com/golang/protobuf/proto"

	"github.com/pydio/cells/common/proto/tree"
)

// NodeWrappingStreamer wraps an existing Node Streamer.
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

func (l *wrappingStreamer) Send(in interface{}) error {
	msg := new(tree.WrappingStreamerResponse)
	switch v := in.(type) {
	case *tree.ListNodesResponse:
		msg.Data = &tree.WrappingStreamerResponse_ListNodesResponse{
			ListNodesResponse: v,
		}
		break
	case *tree.NodeChangeEvent:
		msg.Data = &tree.WrappingStreamerResponse_NodeChangeEvent{
			NodeChangeEvent: v,
		}
		break
	case error:
		msg.Error = v.Error()
	default:
		return fmt.Errorf("unknown format")
	}

	if out, err := proto.Marshal(msg); err != nil {
		return err
	} else {
		// First sending the message size 2 bytes
		b := make([]byte, 2)
		binary.BigEndian.PutUint16(b, uint16(len(out)))
		if _, err := l.w.Write(b); err != nil {
			return err
		}

		if _, err := l.w.Write(out); err != nil {
			return err
		}
	}

	return nil
}

func (l *wrappingStreamer) SendMsg(msg interface{}) error {
	return l.Send(msg)
}

func (l *wrappingStreamer) SendError(err error) error {
	return l.Send(err)
}

func (l *wrappingStreamer) Recv() (*tree.WrappingStreamerResponse, error) {
	if l.closed {
		return nil, io.EOF
	}

	// Getting the next message size
	size := make([]byte, 2)
	if _, err := l.r.Read(size); err != nil {
		return nil, err
	}

	in := make([]byte, binary.BigEndian.Uint16(size))

	if _, err := l.r.Read(in); err != nil {
		return nil, err
	}

	resp := new(tree.WrappingStreamerResponse)

	if err := proto.Unmarshal(in, resp); err != nil {
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
