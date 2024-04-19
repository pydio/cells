package runtime

import (
	"context"
)

type Resolver[T any] func(ctx context.Context) (T, error)

type Options struct {
	Resolver any
}

type Option func(*Options)

func WithResolver(r any) Option {
	return func(o *Options) {
		o.Resolver = r
	}
}
