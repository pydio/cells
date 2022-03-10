/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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
	"context"
	"strings"

	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v4/common/service/context/ckeys"
	metadata2 "github.com/pydio/cells/v4/common/service/context/metadata"
)

func getOrCreateOutgoingMeta(ctx context.Context) metadata.MD {
	if md, ok := metadata.FromOutgoingContext(ctx); ok {
		return md
	} else {
		return metadata.MD{}
	}
}

func cellsMetaToOutgoingMeta(ctx context.Context) context.Context {
	md := getOrCreateOutgoingMeta(ctx)
	if lmd, ok := metadata2.FromContext(ctx); ok {
		for k, v := range lmd {
			if strings.HasPrefix(k, ":") {
				continue
			}
			md.Set(ckeys.CellsMetaPrefix+k, v)
		}
	}
	return metadata.NewOutgoingContext(ctx, md)
}

func MetaUnaryClientInterceptor() grpc.UnaryClientInterceptor {
	return func(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
		ctx = cellsMetaToOutgoingMeta(ctx)
		return invoker(ctx, method, req, reply, cc, opts...)
	}
}

func MetaStreamClientInterceptor() grpc.StreamClientInterceptor {
	return func(ctx context.Context, desc *grpc.StreamDesc, cc *grpc.ClientConn, method string, streamer grpc.Streamer, opts ...grpc.CallOption) (grpc.ClientStream, error) {
		ctx = cellsMetaToOutgoingMeta(ctx)
		return streamer(ctx, desc, cc, method, opts...)
	}
}
