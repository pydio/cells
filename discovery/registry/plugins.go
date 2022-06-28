package registry

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	pbregistry "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
)

func init() {
	runtime.Register("discovery", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceRegistry),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("Grpc implementation of the registry"),
			service.WithGRPC(func(ctx context.Context, srv grpc.ServiceRegistrar) error {
				reg := servicecontext.GetRegistry(ctx)
				pbregistry.RegisterRegistryServer(srv, NewHandler(reg))

				return nil
			}),
		)
	})
}
