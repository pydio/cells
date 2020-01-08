package grpc

import (
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/server"
	"github.com/micro/go-plugins/transport/grpc"
	defaults "github.com/pydio/cells/common/micro"
)

var t = grpc.NewTransport()

func Enable() {
	// tls := config.GetTLSClientConfig("proxy")

	defaults.InitServer(func() server.Option {
		return server.Transport(t)
	})

	defaults.InitClient(func() client.Option {
		return client.Transport(t)
	})

	// transport.DefaultTransport = t
	//
	// // The default client is used by dex so no choice
	// http.DefaultClient.Transport = &http.Transport{
	// 	TLSClientConfig: tls,
	// }
}
