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
	"bytes"
	"context"
	"io"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/transport"

	"github.com/micro/go-micro/server"
)

// rpcStream implements a server side Stream.
type rpcStream struct {
	t          transport.ServerTransport
	s          *transport.Stream
	p          *parser
	codec      grpc.Codec
	cp         grpc.Compressor
	dc         grpc.Decompressor
	cbuf       *bytes.Buffer
	maxMsgSize int
	statusCode codes.Code
	statusDesc string

	// micro things
	request server.Request
}

func (r *rpcStream) Close() error {
	return nil
}

func (r *rpcStream) Error() error {
	return nil
}

func (r *rpcStream) Request() server.Request {
	return r.request
}

func (r *rpcStream) Context() context.Context {
	return r.s.Context()
}

func (r *rpcStream) Send(m interface{}) (err error) {
	hd, out, err := encode(r.codec, m, r.cp, r.cbuf, nil)
	defer func() {
		if r.cbuf != nil {
			r.cbuf.Reset()
		}
	}()
	if err != nil {
		err = Errorf(codes.Internal, "grpc: %v", err)
		return err
	}
	if err := r.t.Write(r.s, hd, out, &transport.Options{Last: false}); err != nil {
		return toRPCErr(err)
	}
	return nil
}

func (r *rpcStream) Recv(m interface{}) (err error) {
	if err := recv(r.p, r.codec, r.s, r.dc, m, r.maxMsgSize); err != nil {
		if err == io.EOF {
			return err
		}
		if err == io.ErrUnexpectedEOF {
			err = Errorf(codes.Internal, io.ErrUnexpectedEOF.Error())
		}
		return toRPCErr(err)
	}
	return nil
}
