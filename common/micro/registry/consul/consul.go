package consul

import (
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/registry/consul"
	"github.com/micro/go-micro/selector"
	"github.com/micro/go-micro/selector/cache"
	"github.com/micro/go-micro/server"
	"github.com/pydio/cells/common/micro"
	"github.com/spf13/viper"
)

func Enable() {
	addr := viper.GetString("registry_address")
	r := consul.NewRegistry(registry.Addrs(addr))
	s := cache.NewSelector(selector.Registry(r))

	defaults.InitServer(func() server.Option {
		return server.Registry(r)
	})

	defaults.InitClient(func() client.Option {
		return client.Selector(s)
	}, func() client.Option {
		return client.Registry(r)
	})

	registry.DefaultRegistry = r
}
