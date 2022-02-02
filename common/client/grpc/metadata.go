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
