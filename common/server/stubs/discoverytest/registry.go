package discoverytest

import (
	pb "github.com/pydio/cells/v4/common/proto/registry"
	cr "github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/discovery/registry"
	"google.golang.org/grpc"

	_ "github.com/pydio/cells/v4/common/registry/config"
)

func NewRegistryService(reg cr.Registry) grpc.ClientConnInterface {
	serv := &pb.RegistryStub{
		RegistryServer: registry.NewHandler(reg),
	}

	return serv
}
