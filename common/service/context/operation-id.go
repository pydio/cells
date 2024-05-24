package servicecontext

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/service/context/metadata"
)

const (
	OperationMetadataId = "X-Pydio-Operation-Id"
)

func ctxWithOpIdFromMeta(ctx context.Context) context.Context {
	if md, ok := metadata.FromContextRead(ctx); ok {
		if opId, o := md[OperationMetadataId]; o {
			ctx = runtimecontext.WithOperationID(ctx, opId)
		}
	}
	return ctx
}

// OperationIdUnaryClientInterceptor inserts specific meta in context (will be later to OutgoingContext meta)
func OperationIdUnaryClientInterceptor() grpc.UnaryClientInterceptor {
	return func(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
		if opID, _ := runtimecontext.GetOperationID(ctx); opID != "" {
			ctx = metadata.WithAdditionalMetadata(ctx, map[string]string{OperationMetadataId: opID})
		}
		return invoker(ctx, method, req, reply, cc, opts...)
	}
}

// OperationIdStreamClientInterceptor inserts specific meta in context (will be later to OutgoingContext meta)
func OperationIdStreamClientInterceptor() grpc.StreamClientInterceptor {
	return func(ctx context.Context, desc *grpc.StreamDesc, cc *grpc.ClientConn, method string, streamer grpc.Streamer, opts ...grpc.CallOption) (grpc.ClientStream, error) {
		if opID, _ := runtimecontext.GetOperationID(ctx); opID != "" {
			ctx = metadata.WithAdditionalMetadata(ctx, map[string]string{OperationMetadataId: opID})
		}
		return streamer(ctx, desc, cc, method, opts...)
	}
}

// OperationIdIncomingContext updates Spans Ids in context
func OperationIdIncomingContext(ctx context.Context) (context.Context, bool, error) {
	return ctxWithOpIdFromMeta(ctx), true, nil
}
