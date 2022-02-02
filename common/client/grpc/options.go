package grpc

import (
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/balancer/base"

	"github.com/pydio/cells/v4/common/registry"
)

type Option func(*Options)
type subConnInfoFilter func(info base.SubConnInfo) bool

type Options struct {
	ClientConn      grpc.ClientConnInterface
	Registry        registry.Registry
	CallTimeout     time.Duration
	DialOptions     []grpc.DialOption
	SubConnSelector subConnInfoFilter
}

func WithPeerSelector(host string) Option {
	return func(o *Options) {
		o.SubConnSelector = func(info base.SubConnInfo) bool {
			return info.Address.Addr == host
		}
	}
}

func WithClientConn(c grpc.ClientConnInterface) Option {
	return func(o *Options) {
		o.ClientConn = c
	}
}

func WithRegistry(r registry.Registry) Option {
	return func(o *Options) {
		o.Registry = r
	}
}

func WithCallTimeout(c time.Duration) Option {
	return func(o *Options) {
		o.CallTimeout = c
	}
}

func WithDialOptions(opts ...grpc.DialOption) Option {
	return func(o *Options) {
		o.DialOptions = append(o.DialOptions, opts...)
	}
}
