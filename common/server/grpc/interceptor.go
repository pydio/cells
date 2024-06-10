package grpc

import (
	"context"

	"google.golang.org/grpc"
)

func HandlerUnaryInterceptor(interceptors *[]grpc.UnaryServerInterceptor) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
		if len(*interceptors) == 0 {
			return handler(ctx, req)
		}
		return (*interceptors)[len(*interceptors)-1](ctx, req, info, getChainUnaryHandler(*interceptors, len(*interceptors)-1, info, handler))
	}
}

func getChainUnaryHandler(interceptors []grpc.UnaryServerInterceptor, curr int, info *grpc.UnaryServerInfo, finalHandler grpc.UnaryHandler) grpc.UnaryHandler {
	if curr == 0 {
		return finalHandler
	}
	return func(ctx context.Context, req interface{}) (interface{}, error) {
		return interceptors[curr-1](ctx, req, info, getChainUnaryHandler(interceptors, curr-1, info, finalHandler))
	}
}

func HandlerStreamInterceptor(interceptors *[]grpc.StreamServerInterceptor) grpc.StreamServerInterceptor {
	return func(req interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
		if len(*interceptors) == 0 {
			return handler(req, ss)
		}
		return (*interceptors)[len(*interceptors)-1](req, ss, info, getChainStreamHandler(*interceptors, len(*interceptors)-1, info, handler))
	}
}

func getChainStreamHandler(interceptors []grpc.StreamServerInterceptor, curr int, info *grpc.StreamServerInfo, finalHandler grpc.StreamHandler) grpc.StreamHandler {
	if curr == 0 {
		return finalHandler
	}
	return func(srv interface{}, stream grpc.ServerStream) error {
		return interceptors[curr-1](srv, stream, info, getChainStreamHandler(interceptors, curr-1, info, finalHandler))
	}
}
