package handler

import (
	"github.com/micro/go-api/router"
	"github.com/micro/go-micro"
)

type Options struct {
	Namespace string
	Router    router.Router
	Service   micro.Service
}

type Option func(o *Options)

// NewOptions fills in the blanks
func NewOptions(opts ...Option) Options {
	var options Options
	for _, o := range opts {
		o(&options)
	}

	// create service if its blank
	if options.Service == nil {
		WithService(micro.NewService())(&options)
	}

	// set namespace if blank
	if len(options.Namespace) == 0 {
		WithNamespace("go.micro.api")(&options)
	}

	// set the router
	if options.Router == nil {
		r := router.NewRouter(router.WithNamespace("go.micro.api"))
		WithRouter(r)(&options)
	}

	return options
}

// WithNamespace specifies the namespace for the handler
func WithNamespace(s string) Option {
	return func(o *Options) {
		o.Namespace = s
	}
}

// WithRouter specifies a router to be used by the handler
func WithRouter(r router.Router) Option {
	return func(o *Options) {
		o.Router = r
	}
}

// WithService specifies a micro.Service
func WithService(s micro.Service) Option {
	return func(o *Options) {
		o.Service = s
	}
}
