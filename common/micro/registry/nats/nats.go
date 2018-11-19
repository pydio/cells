package nats

import (
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/selector"
	"github.com/micro/go-micro/selector/cache"
	"github.com/micro/go-micro/server"
	"github.com/micro/go-plugins/registry/nats"
	"github.com/pydio/cells/common/micro"
)

var r = nats.NewRegistry()

func Enable() {
	s := cache.NewSelector(selector.Registry(r))

	defaults.InitServer(
		server.Registry(r),
	)

	defaults.InitClient(
		client.Selector(s),
		client.Registry(r),
	)

	registry.DefaultRegistry = r
}
