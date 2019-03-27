package nats

import (
	"fmt"

	microbroker "github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/server"
	"github.com/micro/go-plugins/broker/nats"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/micro/broker"
	"github.com/pydio/cells/common/registry"
	"github.com/spf13/viper"
)

// Enable the nats broker
func Enable() {
	addr := viper.GetString("broker_address")
	b := broker.NewBroker(
		nats.NewBroker(microbroker.Addrs(addr)),
		broker.BeforeDisconnect(func() error {
			s, err := registry.ListRunningServices()
			if err != nil {
				return err
			}
			if len(s) > 0 {
				return fmt.Errorf("services are still running")
			}

			return nil
		}),
	)

	defaults.InitServer(func() server.Option {
		return server.Broker(b)
	})

	defaults.InitClient(func() client.Option {
		return client.Broker(b)
	})

	microbroker.DefaultBroker = b

	// Establishing connectin
	microbroker.Connect()
}
