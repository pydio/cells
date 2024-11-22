package discoverytest

import (
	"google.golang.org/grpc"

	pb "github.com/pydio/cells/v5/common/proto/config"
	config "github.com/pydio/cells/v5/discovery/config/grpc"
)

func NewConfigService() grpc.ClientConnInterface {
	serv := &pb.ConfigStub{
		ConfigServer: config.NewHandler(),
	}

	return serv
}
