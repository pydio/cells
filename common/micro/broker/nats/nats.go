package nats

import (
	"github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/server"
	"github.com/micro/go-plugins/broker/nats"
	"github.com/pydio/cells/common/micro"
)

var b = nats.NewBroker()

func Enable() {
	defaults.InitServer(
		server.Broker(b),
	)

	defaults.InitClient(
		client.Broker(b),
	)

	broker.DefaultBroker = b

	// Establishing connectin
	broker.Connect()
}
