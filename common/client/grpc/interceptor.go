package grpc

import (
	"context"
	"github.com/pydio/cells/v4/common/service/errors"
	"google.golang.org/grpc"
	"strings"
	"time"
)

func ErrorNoMatchedRouteRetryUnaryClientInterceptor() grpc.UnaryClientInterceptor {
	return func(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
		for {
			err := invoker(ctx, method, req, reply, cc, opts...)
			if err != nil && (strings.Contains(err.Error(), "no matched route was found") || strings.Contains(err.Error(), "unknown cluster")) {
				<-time.After(100 * time.Millisecond)
				continue
			}

			return err
		}

		return nil
	}
}

func ErrorNoMatchedRouteRetryStreamClientInterceptor() grpc.StreamClientInterceptor {
	return func(ctx context.Context, desc *grpc.StreamDesc, cc *grpc.ClientConn, method string, streamer grpc.Streamer, opts ...grpc.CallOption) (grpc.ClientStream, error) {
		for {
			str, err := streamer(ctx, desc, cc, method, opts...)
			if err != nil && (strings.Contains(err.Error(), "no matched route was found") || strings.Contains(err.Error(), "unknown cluster")) {
				<-time.After(100 * time.Millisecond)
				continue
			}

			return str, err
		}
	}
}

func ErrorFormatUnaryClientInterceptor() grpc.UnaryClientInterceptor {
	return func(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
		err := invoker(ctx, method, req, reply, cc, opts...)
		if err != nil {
			return errors.FromGRPC(err)
		}

		return nil
	}
}

func ErrorFormatStreamClientInterceptor() grpc.StreamClientInterceptor {
	return func(ctx context.Context, desc *grpc.StreamDesc, cc *grpc.ClientConn, method string, streamer grpc.Streamer, opts ...grpc.CallOption) (grpc.ClientStream, error) {
		str, err := streamer(ctx, desc, cc, method, opts...)
		return &errorFormatStreamClientInterceptor{str}, err
	}
}

type errorFormatStreamClientInterceptor struct {
	grpc.ClientStream
}

func (e *errorFormatStreamClientInterceptor) RecvMsg(m interface{}) error {
	err := e.ClientStream.RecvMsg(m)
	if err != nil {
		return errors.FromGRPC(err)
	}

	return nil
}
