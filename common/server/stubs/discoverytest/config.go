package discoverytest

import (
	"github.com/pydio/cells/v4/common"
	pb "github.com/pydio/cells/v4/common/proto/config"
	config "github.com/pydio/cells/v4/discovery/config/grpc"
	"google.golang.org/grpc"
)

func NewConfigService() grpc.ClientConnInterface {
	serv := &pb.ConfigStub{
		ConfigServer: config.NewHandler(common.ServiceConfig),
	}

	return serv
}
