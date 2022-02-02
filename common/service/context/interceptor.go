package servicecontext

import (
	"context"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	"google.golang.org/grpc"
)

// IncomingContextModifier modifies context and returns a new context, true if context was modified, or an error
type IncomingContextModifier func(ctx context.Context) (context.Context, bool, error)

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
