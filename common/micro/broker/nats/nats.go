package nats

import (
	"github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/server"
	"github.com/micro/go-plugins/broker/nats"
	"github.com/pydio/cells/common/micro"
)

func Enable() {
	defaults.InitServer(func() server.Option {
		return server.Broker(nats.NewBroker())
	})

	defaults.InitClient(func() client.Option {
		return client.Broker(nats.NewBroker())
	})

	broker.DefaultBroker = nats.NewBroker()

	// Establishing connectin
	broker.Connect()
}
