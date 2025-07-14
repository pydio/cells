package grpc

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
)

func init() {

	runtime.Register("main", func(ctx context.Context) {

		service.NewService(
			service.Tag(common.ServiceTagGateway),
			service.Name(common.ServiceGatewayGrpc),
			service.Description("External gRPC Access (tls)"),
			service.Context(ctx),
			service.WithGRPC(func(runtimeCtx context.Context, srv grpc.ServiceRegistrar) error {
				h := &TreeHandler{
					name: common.ServiceGatewayGrpc,
				}
				// Do not use Enhanced here
				tree.RegisterNodeProviderServer(srv, h)
				tree.RegisterNodeReceiverServer(srv, h)
				tree.RegisterNodeChangesStreamerServer(srv, h)
				tree.RegisterNodeProviderStreamerServer(srv, h)
				tree.RegisterNodeReceiverStreamServer(srv, h)

				return nil
			}),
		)
	})

}
