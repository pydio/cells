package nats

import (
	"context"
	"time"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/selector"
	"github.com/micro/go-micro/server"
	"github.com/micro/go-plugins/registry/nats"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/micro/selector/cache"
	"github.com/spf13/viper"
)

func Enable() {
	addr := viper.GetString("registry_address")
	r := nats.NewRegistry(
		registry.Addrs(addr),
	)
	q := 1
	if defaults.RuntimeIsCluster() {
		q = 0
	}
	defaults.DefaultStartupRegistry = nats.NewRegistry(
		registry.Addrs(addr),
		registry.Timeout(4*time.Second),
		nats.Quorum(q),
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
