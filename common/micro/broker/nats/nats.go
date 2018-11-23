package nats

import (
	"github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/server"
	"github.com/micro/go-plugins/broker/nats"
	"github.com/pydio/cells/common/micro"
	"github.com/spf13/viper"
)

func Enable() {

	addr := viper.GetString("broker_address")
	defaults.InitServer(func() server.Option {
		return server.Broker(nats.NewBroker(broker.Addrs(addr)))
	})

	defaults.InitClient(func() client.Option {
		return client.Broker(nats.NewBroker(broker.Addrs(addr)))
	})

	broker.DefaultBroker = nats.NewBroker(broker.Addrs(addr))

	// Establishing connectin
	broker.Connect()
}
