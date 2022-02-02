package grpc

import "net"

type Option func(*Options)

type Options struct {
	Listener net.Listener
}

func WithListener(lis net.Listener) Option {
	return func(o *Options) {
		o.Listener = lis
	}
}
