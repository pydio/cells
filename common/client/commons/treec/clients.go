package treec

import (
	"context"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/proto/tree"
)

// NodeProviderClient resolves a tree.NodeProviderClient pointing to ServiceTree by default
func NodeProviderClient(ctx context.Context, opt ...grpc.Option) tree.NodeProviderClient {
	return tree.NewNodeProviderClient(grpc.ResolveConn(ctx, common.ServiceTree, opt...))
}

// ServiceNodeProviderClient resolves a tree.NodeProviderClient pointing to custom service
func ServiceNodeProviderClient(ctx context.Context, srvName string, opt ...grpc.Option) tree.NodeProviderClient {
	return tree.NewNodeProviderClient(grpc.ResolveConn(ctx, srvName, opt...))
}

// NodeProviderStreamerClient resolves a tree.NodeProviderStreamerClient pointing to ServiceTree by default
func NodeProviderStreamerClient(ctx context.Context, opt ...grpc.Option) tree.NodeProviderStreamerClient {
	return tree.NewNodeProviderStreamerClient(grpc.ResolveConn(ctx, common.ServiceTree, opt...))
}

// ServiceNodeProviderStreamerClient resolves a tree.NodeProviderStreamerClient pointing to custom service
func ServiceNodeProviderStreamerClient(ctx context.Context, srvName string, opt ...grpc.Option) tree.NodeProviderStreamerClient {
	return tree.NewNodeProviderStreamerClient(grpc.ResolveConn(ctx, srvName, opt...))
}

// NodeReceiverClient resolves a tree.NodeReceiverClient pointing to ServiceTree by default
func NodeReceiverClient(ctx context.Context, opt ...grpc.Option) tree.NodeReceiverClient {
	return tree.NewNodeReceiverClient(grpc.ResolveConn(ctx, common.ServiceTree, opt...))
}

// ServiceNodeReceiverClient resolves a tree.NodeReceiverClient pointing to custom service
func ServiceNodeReceiverClient(ctx context.Context, srvName string, opt ...grpc.Option) tree.NodeReceiverClient {
	return tree.NewNodeReceiverClient(grpc.ResolveConn(ctx, srvName, opt...))
}
