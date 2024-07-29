package discoverytest

import (
	"google.golang.org/grpc"

	pb "github.com/pydio/cells/v4/common/proto/config"
)

func NewConfigService() grpc.ClientConnInterface {
	serv := &pb.ConfigStub{
		// TODO
		// ConfigServer: config.NewHandler(common.ServiceConfig),
	}

	return serv
}
