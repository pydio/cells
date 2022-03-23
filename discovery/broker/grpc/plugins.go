package grpc

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/broker/grpcpubsub/handler"
	pb "github.com/pydio/cells/v4/common/proto/broker"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
)

func init() {
	runtime.Register("discovery", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceBroker),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("Registry"),
			service.WithGRPC(func(ctx context.Context, srv *grpc.Server) error {
				pb.RegisterBrokerServer(srv, handler.NewHandler(broker.Default()))
				return nil
			}),
		)
	})
}
