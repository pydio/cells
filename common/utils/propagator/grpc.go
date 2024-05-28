/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package propagator

import (
	"context"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	"google.golang.org/grpc"
)

// IncomingContextModifier modifies context and returns a new context, true if context was modified, or an error
type IncomingContextModifier func(ctx context.Context) (context.Context, bool, error)

// OutgoingContextModifier can be used to modify context during a grpc client request
type OutgoingContextModifier func(ctx context.Context) context.Context

// ContextUnaryServerInterceptor wraps an IncomingContextModifier to create a grpc.UnaryServerInterceptor.
func ContextUnaryServerInterceptor(modifier IncomingContextModifier) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
		ct, _, err := modifier(ctx)
		if err != nil {
			return nil, err
		}
		return handler(ct, req)
	}
}

// ContextStreamServerInterceptor wraps an IncomingContextModifier to create a grpc.StreamServerInterceptor.
func ContextStreamServerInterceptor(modifier IncomingContextModifier) grpc.StreamServerInterceptor {
	return func(srv interface{}, stream grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
		ct, ok, err := modifier(stream.Context())
		if err != nil {
			return err
		}
		if ok {
			wrapped := grpc_middleware.WrapServerStream(stream)
			wrapped.WrappedContext = ct
			return handler(srv, wrapped)
		}
		return handler(srv, stream)
	}
}

// ContextUnaryClientInterceptor is a grpc client middleware to modify context
func ContextUnaryClientInterceptor(modifier OutgoingContextModifier) grpc.UnaryClientInterceptor {
	return func(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
		return invoker(modifier(ctx), method, req, reply, cc, opts...)
	}
}

// ContextStreamClientInterceptor is a grpc client middleware to modify context
func ContextStreamClientInterceptor(modifier OutgoingContextModifier) grpc.StreamClientInterceptor {
	return func(ctx context.Context, desc *grpc.StreamDesc, cc *grpc.ClientConn, method string, streamer grpc.Streamer, opts ...grpc.CallOption) (grpc.ClientStream, error) {
		return streamer(modifier(ctx), desc, cc, method, opts...)
	}
}
