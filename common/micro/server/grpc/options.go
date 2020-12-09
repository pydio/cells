package grpc

import (
	"context"
	"crypto/tls"

	"github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/codec"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/server"
	"github.com/micro/go-micro/server/debug"
	"github.com/micro/go-micro/transport"
	"google.golang.org/grpc"
	grpcTransport "google.golang.org/grpc/transport"
)

type codecsKey struct{}
type tlsAuth struct{}
type transportConfig struct{}

// gRPC Codec to be used to encode/decode requests for a given content type
func Codec(contentType string, c grpc.Codec) server.Option {
	return func(o *server.Options) {
		codecs := make(map[string]grpc.Codec)
		if o.Context == nil {
			o.Context = context.Background()
		}
		if v := o.Context.Value(codecsKey{}); v != nil {
			codecs = v.(map[string]grpc.Codec)
		}
		codecs[contentType] = c
		o.Context = context.WithValue(o.Context, codecsKey{}, codecs)
	}
}

// AuthTLS should be used to setup a secure authentication using TLS
func AuthTLS(t *tls.Config) server.Option {
	return func(o *server.Options) {
		if o.Context == nil {
			o.Context = context.Background()
		}
		o.Context = context.WithValue(o.Context, tlsAuth{}, t)
	}
}

// TransportConfig should be used to setup a gRPC transport (http2 server) config
func TransportConfig(sc *grpcTransport.ServerConfig) server.Option {
	return func(o *server.Options) {
		if o.Context == nil {
			o.Context = context.Background()
		}
		o.Context = context.WithValue(o.Context, transportConfig{}, sc)
	}
}

func newOptions(opt ...server.Option) server.Options {
	opts := server.Options{
		Codecs:   make(map[string]codec.NewCodec),
		Metadata: map[string]string{},
	}

	for _, o := range opt {
		o(&opts)
	}

	if opts.Broker == nil {
		opts.Broker = broker.DefaultBroker
	}

	if opts.Registry == nil {
		opts.Registry = registry.DefaultRegistry
	}

	if opts.Transport == nil {
		opts.Transport = transport.DefaultTransport
	}

	if opts.DebugHandler == nil {
		opts.DebugHandler = debug.DefaultDebugHandler
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
