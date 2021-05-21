package registry

import (
	"context"
	"time"

	"github.com/pydio/cells/common/micro/registry/cluster"
	"github.com/pydio/cells/common/micro/registry/service"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/selector"
	"github.com/micro/go-micro/server"
	"github.com/micro/go-plugins/registry/memory"
	"github.com/pydio/cells/common/micro/client/grpc"

	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/micro/selector/cache"
	rs "github.com/pydio/cells/common/micro/selector/registry"
	"github.com/spf13/viper"
)

func EnableService() {
	// addr := "127.0.0.1:8000"

	r := service.NewRegistry(
		service.WithClient(
			grpc.NewClient(
				client.RequestTimeout(10*time.Minute),
				client.Selector(rs.NewSelector()),
				client.Retries(20),
			),
		),
	)

	r = NewRegistryWithExpiry(r, 20*time.Minute)
	r = NewRegistryWithUnique(r)

	s := cache.NewSelector(selector.Registry(r))

	defaults.InitServer(func() server.Option {
		return server.Registry(r)
	})

	defaults.InitClient(
		func() client.Option {
			return client.Selector(s)
		},
		func() client.Option {
			return client.Registry(r)
		}, func() client.Option {
			return client.Retries(5)
		}, func() client.Option {
			return client.Retry(RetryOnError)
		},
	)

	registry.DefaultRegistry = r
}

func EnableMemory() {
	// addr := "127.0.0.1:8000"

	r := memory.NewRegistry()

	r = NewRegistryWithExpiry(r, 20*time.Minute)
	r = NewRegistryWithUnique(r)
	r = cluster.NewRegistry(r,
		registry.Addrs(viper.GetString("nats_address")),
		cluster.ClusterID(viper.GetString("nats_streaming_cluster_id")),
	)

	defaults.InitServer(func() server.Option {
		return server.Registry(r)
	})

	defaults.InitClient(
		func() client.Option {
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
