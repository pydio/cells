package http

import (
	"github.com/micro/go-micro/codec"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/server"

	"golang.org/x/net/context"
)

func newOptions(opt ...server.Option) server.Options {
	opts := server.Options{
		Codecs:   make(map[string]codec.NewCodec),
		Metadata: map[string]string{},
		Context:  context.Background(),
	}

	for _, o := range opt {
		o(&opts)
	}

	if opts.Registry == nil {
		opts.Registry = registry.DefaultRegistry
	}

	if len(opts.Address) == 0 {
		opts.Address = server.DefaultAddress
	}

	if len(opts.Name) == 0 {
		opts.Name = server.DefaultName
	}

	if len(opts.Id) == 0 {
		opts.Id = server.DefaultId
	}

	if len(opts.Version) == 0 {
		opts.Version = server.DefaultVersion
	}

	return opts
}
