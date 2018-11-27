package grpc

import (
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/server"
	"github.com/micro/go-micro/transport"
	"github.com/micro/go-plugins/transport/grpc"
	"github.com/pydio/cells/common/micro"
)

var t = grpc.NewTransport()

func Enable() {
	defaults.InitServer(func() server.Option {
		return server.Transport(t)
	})

	defaults.InitClient(func() client.Option {
		return client.Transport(t)
	})

	transport.DefaultTransport = t
}
