package grpc

import (
	"context"
	"github.com/pydio/cells/v4/common/service/errors"
	"google.golang.org/grpc"
)

func ErrorFormatUnaryInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
	resp, err := handler(ctx, req)
	if err != nil {
		return resp, errors.ToGRPC(err)
	}

	return resp, nil
}

func ErrorFormatStreamInterceptor(srv interface{}, stream grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
	err := handler(srv, stream)
	if err != nil {
		return errors.ToGRPC(err)
	}

	return nil
}
