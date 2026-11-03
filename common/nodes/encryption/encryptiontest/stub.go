/*
 * Copyright (c) 2025 Abstrium SAS <team (at) pydio.com>
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

// Package encryptiontest provides gRPC stubs shared by the encryption package's
// own tests and by other packages exercising the NodeKeyManager service in-process.
package encryptiontest

import (
	"context"
	"io"

	ggrpc "google.golang.org/grpc"

	"github.com/pydio/cells/v5/common/proto/encryption"
)

// SetNodeInfoErrStub forwards the error returned by the SetNodeInfo handler to the client, as real gRPC does.
// shortcut: the generated stub (cmd/protoc-gen-go-client-stub) drops it and the client blocks, fix the generator to drop this.
type SetNodeInfoErrStub struct {
	encryption.NodeKeyManagerStub
}

func (s *SetNodeInfoErrStub) NewStream(ctx context.Context, desc *ggrpc.StreamDesc, method string, opts ...ggrpc.CallOption) (ggrpc.ClientStream, error) {
	if method != "/encryption.NodeKeyManager/SetNodeInfo" {
		return s.NodeKeyManagerStub.NewStream(ctx, desc, method, opts...)
	}
	st := &SetNodeInfoErrStreamer{}
	st.Init(ctx)
	go func() {
		if e := s.NodeKeyManagerServer.SetNodeInfo(st); e != nil {
			st.err = e
			close(st.RespChan)
		}
	}()
	return st, nil
}

type SetNodeInfoErrStreamer struct {
	encryption.NodeKeyManagerStub_SetNodeInfoStreamer
	err error
}

func (s *SetNodeInfoErrStreamer) RecvMsg(m interface{}) error {
	e := s.NodeKeyManagerStub_SetNodeInfoStreamer.RecvMsg(m)
	if e == io.EOF && s.err != nil {
		return s.err
	}
	return e
}
