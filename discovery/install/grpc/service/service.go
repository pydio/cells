package service

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common"
	service2 "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
	gh "github.com/pydio/cells/v5/discovery/install/grpc"
)

var Name = common.ServiceGrpcNamespace_ + common.ServiceInstall

func init() {

	runtime.Register("main", func(ctx context.Context) {

		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("Services Migration"),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {
				handler := new(gh.Handler)
				service2.RegisterMigrateServiceServer(server, handler)
				return nil
			}),
		)
	})
}
