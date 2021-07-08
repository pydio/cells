package broker

import (
	"context"

	micro "github.com/micro/go-micro"
	"github.com/spf13/viper"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/plugins"
	pb "github.com/pydio/cells/common/proto/broker"
	"github.com/pydio/cells/common/service"
)

func init() {
	plugins.Register(func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceBroker),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("Main service broker"),
			service.Port(viper.GetString("port_broker")),
			service.WithMicro(func(m micro.Service) error {
				// Register handler
				pb.RegisterBrokerHandler(m.Server(), new(Broker))

				return nil
			}),
		)
	})
}
