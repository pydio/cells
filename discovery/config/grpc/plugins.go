package grpc

import (
	"context"

	"github.com/pydio/cells/v4/common"
	pb "github.com/pydio/cells/v4/common/proto/config"
	"github.com/pydio/cells/v4/common/service"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common/runtime"
)

func init() {
	runtime.Register("discovery", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceConfig),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("Grpc service for serving configurations to forks"),
			// service.WithStorage(config.NewDAO),
			service.WithGRPC(func(c context.Context, srv *grpc.Server) error {
				// Register handler
				pb.RegisterConfigServer(srv, &Handler{serviceName: common.ServiceGrpcNamespace_ + common.ServiceConfig})

				return nil
			}),
			//service.WithGRPCStop(func(c context.Context, srv *grpc.Server) error {
			//	pb.DeregisterConfigEnhancedServer(srv, common.ServiceGrpcNamespace_+common.ServiceConfig)
			//
			//	return nil
			//}),
		)
	})
}
