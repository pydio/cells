package broker

import (
	"fmt"
	"time"

	"github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/broker/http"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/server"
	"github.com/micro/go-plugins/broker/nats"
	"github.com/spf13/viper"

	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/micro/broker/memory"
	"github.com/pydio/cells/common/micro/broker/service"
	"github.com/pydio/cells/common/micro/broker/stan"
	"github.com/pydio/cells/common/micro/client/grpc"
	bs "github.com/pydio/cells/common/micro/selector/broker"
	"github.com/pydio/cells/common/micro/transport/codec/proto"
	"github.com/pydio/cells/common/registry"
)

// EnableNATS enables the nats broker
func EnableNATS() {
	addr := viper.GetString("nats_address")
	b := NewBroker(
		nats.NewBroker(
			broker.Addrs(addr),
			broker.Codec(proto.NewCodec()),
		),
		BeforeDisconnect(func() error {
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

	broker.DefaultBroker = b

	// Establishing connectin
	broker.Connect()
}

// EnableSTAN enables the stan broker
func EnableSTAN() {
	addr := viper.GetString("nats_address")
	b := NewBroker(
		stan.NewBroker(
			stan.ClusterID(viper.GetString("nats_streaming_cluster_id")),
			broker.Addrs(addr),
			broker.Codec(proto.NewCodec()),
		),
		BeforeDisconnect(func() error {
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

	broker.DefaultBroker = b

	// Establishing connectin
	broker.Connect()
}

// EnableSTAN enables the http broker
func EnableHTTP() {

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

func EnableMemory() {
	b := NewBroker(
		memory.NewBroker(),
		BeforeDisconnect(func() error {
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

	broker.DefaultBroker = b

	// Establishing connectin
	broker.Connect()
}

func EnableService(hostname, port string) {
	b := service.NewBroker(
		service.WithClient(
			grpc.NewClient(
				client.RequestTimeout(1*time.Hour),
				client.Selector(bs.NewSelector(hostname, port)),
			),
		),
	)

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
