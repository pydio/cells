package controller

import (
	"context"
	"errors"

	"github.com/pydio/cells/v4/common/utils/openurl"
)

type Convertible interface {
	As(out any) bool
}

type Controller[T any] interface {
	Register(scheme string, options ...Option[T])
	Open(ctx context.Context, url string) (T, error)
}

type Option[T any] func(*Options[T])

type Options[T any] struct {
	CustomOpener Opener[T]
	PoolOptions  []openurl.PoolOptions[T]
}

func WithCustomOpener[T any](opener Opener[T]) Option[T] {
	return func(o *Options[T]) {
		o.CustomOpener = opener
	}
}

type Opener[T any] func(ctx context.Context, url string) (T, error)

type Resolver[T any] interface {
	Get(ctx context.Context, data ...map[string]interface{}) (T, error)
}

type controller[T any] struct {
	ctx    context.Context
	cancel context.CancelFunc

	schemes openurl.SchemeMap
}

type Component[T any] struct {
	path      string
	component T
}

type controllerOptions struct{}

func NewController[T any]() Controller[T] {
	return &controller[T]{}
}

// Register registers the opener with the given scheme. If an opener
// already exists for the scheme, Register panics.
func (c *controller[T]) Register(scheme string, options ...Option[T]) {
	opts := Options[T]{}
	for _, o := range options {
		o(&opts)
	}
	c.schemes.Register("component", "Component", scheme, opts)
}

// Register registers the opener with the given scheme. If an opener
// already exists for the scheme, Register panics.
func (c *controller[T]) Open(ctx context.Context, urlstr string) (T, error) {
	//opts := Options{}
	//for _, o := range opt {
	//	o(&opts)
	//}
	//
	//for _, contextualizedKey := range opts.contextualizedKeys {
	//	if v := ctx.Value(contextualizedKey); v != nil {
	//		if vv, ok := v.(string); ok {
	//			opts.meta[contextualizedKey] = vv
	//		}
	//	}
	//}

	var t T

	v, err := c.schemes.FromStringNoParse("Component", urlstr)
	if err != nil {
		return t, err
	}

	opts, ok := v.(Options[T])
	if !ok {
		return t, errors.New("wrong url")
	}

	//if opts.CustomPoolOpener != nil {
	//	p, err := opts.CustomPoolOpener(ctx, urlstr)
	//	if err != nil {
	//		return nil, err
	//	}
	//
	//	return p, nil
	//}

	return openurl.Opener[T](opts.CustomOpener)(ctx, urlstr)
}
