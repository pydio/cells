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

package treec

import (
	"context"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/proto/tree"
)

// NodeProviderClient resolves a tree.NodeProviderClient pointing to ServiceTree by default
func NodeProviderClient(ctx context.Context, opt ...grpc.Option) tree.NodeProviderClient {
	return tree.NewNodeProviderClient(grpc.ResolveConn(ctx, common.ServiceTreeGRPC, opt...))
}

// ServiceNodeProviderClient resolves a tree.NodeProviderClient pointing to custom service
func ServiceNodeProviderClient(ctx context.Context, srvName string, opt ...grpc.Option) tree.NodeProviderClient {
	return tree.NewNodeProviderClient(grpc.ResolveConn(ctx, common.ServiceGrpcNamespace_+srvName, opt...))
}

// NodeProviderStreamerClient resolves a tree.NodeProviderStreamerClient pointing to ServiceTree by default
func NodeProviderStreamerClient(ctx context.Context, opt ...grpc.Option) tree.NodeProviderStreamerClient {
	return tree.NewNodeProviderStreamerClient(grpc.ResolveConn(ctx, common.ServiceTreeGRPC, opt...))
}

// ServiceNodeProviderStreamerClient resolves a tree.NodeProviderStreamerClient pointing to custom service
func ServiceNodeProviderStreamerClient(ctx context.Context, srvName string, opt ...grpc.Option) tree.NodeProviderStreamerClient {
	return tree.NewNodeProviderStreamerClient(grpc.ResolveConn(ctx, common.ServiceGrpcNamespace_+srvName, opt...))
}

// NodeReceiverClient resolves a tree.NodeReceiverClient pointing to ServiceTree by default
func NodeReceiverClient(ctx context.Context, opt ...grpc.Option) tree.NodeReceiverClient {
	return tree.NewNodeReceiverClient(grpc.ResolveConn(ctx, common.ServiceTreeGRPC, opt...))
}

// ServiceNodeReceiverClient resolves a tree.NodeReceiverClient pointing to custom service
func ServiceNodeReceiverClient(ctx context.Context, srvName string, opt ...grpc.Option) tree.NodeReceiverClient {
	return tree.NewNodeReceiverClient(grpc.ResolveConn(ctx, common.ServiceGrpcNamespace_+srvName, opt...))
}
