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
	"io"

	"github.com/pydio/cells/common/proto/tree"
)

type WrappingStreamer struct {
	w       *io.PipeWriter
	r       *io.PipeReader
	closed  bool
	recvErr error
}

func NewWrappingStreamer() *WrappingStreamer {
	r, w := io.Pipe()

	return &WrappingStreamer{
		w:      w,
		r:      r,
		closed: false,
	}
}

func (l *WrappingStreamer) Send(resp *tree.ListNodesResponse) error {
	enc := json.NewEncoder(l.w)
	enc.Encode(resp)
	return nil
}

func (l *WrappingStreamer) SendMsg(interface{}) error {
	return nil
}

func (l *WrappingStreamer) SendError(err error) error {
	l.recvErr = err
	return nil
}

func (l *WrappingStreamer) Recv() (*tree.ListNodesResponse, error) {
	if l.recvErr != nil {
		return nil, l.recvErr
	}
	if l.closed {
		return nil, io.EOF
	}
	resp := &tree.ListNodesResponse{}
	dec := json.NewDecoder(l.r)
	err := dec.Decode(resp)
	return resp, err
}

func (l *WrappingStreamer) RecvMsg(interface{}) error {
	return nil
}

func (l *WrappingStreamer) Close() error {
	l.closed = true
	l.w.Close()
	return nil
}
