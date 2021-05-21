package service

import (
	"context"

	"github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/client"
)

type clientKey struct{}

// WithClient sets the RPC client
func WithClient(c client.Client) broker.Option {
	return func(o *broker.Options) {
		if o.Context == nil {
			o.Context = context.Background()
		}

		o.Context = context.WithValue(o.Context, clientKey{}, c)
	}
}
