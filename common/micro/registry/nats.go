package registry

import (
	"context"
	"github.com/google/uuid"
	natsstreaming "github.com/pydio/cells/discovery/nats-streaming"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/selector"
	"github.com/micro/go-micro/server"
	gonats "github.com/nats-io/nats.go"
	gostan "github.com/nats-io/stan.go"

	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/micro/registry/nats"
	"github.com/pydio/cells/common/micro/registry/stan"
	"github.com/pydio/cells/common/micro/selector/cache"
	"github.com/spf13/viper"
)

func EnableNats() {
	addr := viper.GetString("nats_address")
	r := nats.NewRegistry(
		registry.Addrs(addr),
	)

	s := cache.NewSelector(selector.Registry(r))

	defaults.InitServer(func() server.Option {
		return server.Registry(r)
	})

	defaults.InitClient(
		func() client.Option {
			return client.Selector(s)
		}, func() client.Option {
			return client.Registry(r)
		}, func() client.Option {
			return client.Retries(5)
		}, func() client.Option {
			return client.Retry(RetryOnError)
		},
	)

	registry.DefaultRegistry = r
}

func EnableStan() {
	addr := viper.GetString("nats_address")
	nc, _ := gonats.Connect(addr,
		gonats.Name(uuid.New().String()),
	)
	nc.SetDisconnectErrHandler(func(_ *gonats.Conn, _ error) {
		// Attempting to start a server if we've been kicked off
		natsstreaming.Init()
	})

	if nc == nil {
		natsstreaming.Init()

		nc, _ = gonats.Connect(addr,
			gonats.Name(uuid.New().String()),
		)
	}

	r := stan.NewRegistry(
		registry.Addrs(addr),
		stan.Options(
			gostan.NatsURL(viper.GetString("nats_address")),
			gostan.NatsConn(nc),
			),
	)

	s := cache.NewSelector(selector.Registry(r))

	defaults.InitServer(func() server.Option {
		return server.Registry(r)
	})

	defaults.InitClient(
		func() client.Option {
			return client.Selector(s)
		}, func() client.Option {
			return client.Registry(r)
		}, func() client.Option {
			return client.Retries(5)
		}, func() client.Option {
			return client.Retry(RetryOnError)
		},
	)

	registry.DefaultRegistry = r
}

// RetryOnError retries a request on a 500 or timeout error
func RetryOnError(ctx context.Context, req client.Request, retryCount int, err error) (bool, error) {
	if err == nil {
		return false, nil
	}

	e := errors.Parse(err.Error())
	if e == nil {
		return false, nil
	}

	switch e.Code {
	// retry on timeout or internal server error
	case 408, 500:
		return true, nil
	default:
		return false, nil
	}
}
