/*
 *
 * Copyright 2014, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
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
