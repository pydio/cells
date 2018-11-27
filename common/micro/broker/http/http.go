package http

import (
	"github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/broker/http"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/server"
	"github.com/pydio/cells/common/micro"
	"github.com/spf13/viper"
)

func Enable() {

	addr := viper.GetString("broker_address")
	b := http.NewBroker(broker.Addrs(addr))

	defaults.InitServer(func() server.Option {
		return server.Broker(b)
	})

	defaults.InitClient(func() client.Option {
		return client.Broker(b)
	})

	broker.DefaultBroker = b

	// Establishing connectin
	broker.Connect()
}
