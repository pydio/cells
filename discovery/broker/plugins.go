package broker

import (
	"context"

	"github.com/pydio/cells/v4/common/broker"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/plugins"
	pb "github.com/pydio/cells/v4/common/proto/broker"
	"github.com/pydio/cells/v4/common/service"
	"google.golang.org/grpc"
)

func init() {
	plugins.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceBroker),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("Registry"),
			service.WithGRPC(func(ctx context.Context, srv *grpc.Server) error {
				pb.RegisterBrokerEnhancedServer(srv, NewHandler(broker.Default()))

				return nil
			}),
		)
	})
}
