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

package nodes

import (
	"context"
	"encoding/binary"
	"io"
	"sync/atomic"

	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/tree"
)

// NodeWrappingStreamer wraps an existing N Streamer.
type NodeWrappingStreamer struct {
	*wrappingStreamer
}

func NewWrappingStreamer(c context.Context) *NodeWrappingStreamer {
	return &NodeWrappingStreamer{newWrappingStreamer(c)}
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

func NewChangesWrappingStreamer(c context.Context) *ChangesWrappingStreamer {
	return &ChangesWrappingStreamer{newWrappingStreamer(c)}
}

func (l *ChangesWrappingStreamer) Recv() (*tree.NodeChangeEvent, error) {
	msg, err := l.wrappingStreamer.Recv()
	if err != nil {
		return nil, err
	}

	return msg.GetNodeChangeEvent(), nil
}

type wrappingStreamer struct {
	parent context.Context
	w      *io.PipeWriter
	r      *io.PipeReader
	closed atomic.Bool
}

func newWrappingStreamer(c context.Context) *wrappingStreamer {
	r, w := io.Pipe()

	return &wrappingStreamer{
		w:      w,
		r:      r,
		closed: atomic.Bool{},
		parent: c,
	}
}

func (l *wrappingStreamer) Context() context.Context {
	return l.parent
}

func (l *wrappingStreamer) Header() (metadata.MD, error) {
	return metadata.MD{}, nil
}

func (l *wrappingStreamer) Trailer() metadata.MD {
	return metadata.MD{}
}

func (l *wrappingStreamer) Send(in interface{}) error {
	msg := new(tree.WrappingStreamerResponse)
	switch v := in.(type) {
	case *tree.ListNodesResponse:
		msg.Data = &tree.WrappingStreamerResponse_ListNodesResponse{
			ListNodesResponse: v,
		}
	case *tree.NodeChangeEvent:
		msg.Data = &tree.WrappingStreamerResponse_NodeChangeEvent{
			NodeChangeEvent: v,
		}
	case error:
		msg.Error = v.Error()
	default:
		return errors.New("unknown format")
	}

	if out, err := proto.Marshal(msg); err != nil {
		return err
	} else {
		// First sending the message size 2 bytes
		b := make([]byte, 4)
		binary.BigEndian.PutUint32(b, uint32(len(out)))
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
	if l.closed.Load() {
		return nil, io.EOF
	}

	// Getting the Next message size
	size := make([]byte, 4)
	if _, err := l.r.Read(size); err != nil {
		return nil, err
	}

	in := make([]byte, binary.BigEndian.Uint32(size))

	if _, err := l.r.Read(in); err != nil {
		return nil, err
	}

	resp := new(tree.WrappingStreamerResponse)

	if err := proto.Unmarshal(in, resp); err != nil {
		return nil, err
	}

	if resp.Error != "" {
		return nil, errors.New(resp.Error)
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

func (l *wrappingStreamer) CloseSend() error {
	l.closed.Store(true)
	l.w.Close()
	return nil
}
