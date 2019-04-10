package router

import (
	"github.com/micro/go-api"
	microrouter "github.com/micro/go-api/router"
	"github.com/micro/go-micro/cmd"
	"github.com/micro/go-micro/registry"
)

func newOptions(opts ...microrouter.Option) microrouter.Options {
	options := microrouter.Options{
		Namespace: "go.micro.api",
		Handler:   api.Default,
		Registry:  *cmd.DefaultOptions().Registry,
	}

	for _, o := range opts {
		o(&options)
	}

	return options
}

func WithHandler(h api.Handler) microrouter.Option {
	return func(o *microrouter.Options) {
		o.Handler = h
	}
}

func WithNamespace(ns string) microrouter.Option {
	return func(o *microrouter.Options) {
		o.Namespace = ns
	}
}

func WithRegistry(r registry.Registry) microrouter.Option {
	return func(o *microrouter.Options) {
		o.Registry = r
	}
}
