package controller

import (
	"context"

	"github.com/pydio/cells/v4/common/utils/openurl"
)

type Convertible interface {
	As(out any) bool
}

type Controller[T openurl.ResourceClosable] interface {
	Register(scheme string, opener ...openurl.PoolOption[T])
	Open(ctx context.Context, url string) (Resolver[T], error)
}

type Opener[T any] func(ctx context.Context, url string) (T, error)

type Resolver[T any] interface {
	Get(ctx context.Context, data ...map[string]interface{}) (T, error)
}

type ControllerOption func(*controllerOptions)

type controller[T openurl.ResourceClosable] struct {
	ctx    context.Context
	cancel context.CancelFunc

	schemes openurl.SchemeMap
}

type resolver[T any] struct {
	template openurl.Template
	opener   Opener[T]

	Components []*Component[T]
}

type Component[T any] struct {
	path      string
	component T
}

type controllerOptions struct{}

func NewController[T openurl.ResourceClosable]() Controller[T] {
	return &controller[T]{}
}

// Register registers the opener with the given scheme. If an opener
// already exists for the scheme, Register panics.
func (c *controller[T]) Register(scheme string, opener ...openurl.PoolOption[T]) {
	c.schemes.Register("component", "Component", scheme, opener)
}

// Register registers the opener with the given scheme. If an opener
// already exists for the scheme, Register panics.
func (c *controller[T]) Open(ctx context.Context, urlstr string) (Resolver[T], error) {
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

	opts, err := c.schemes.FromStringNoParse("Component", urlstr)
	if err != nil {
		return nil, err
	}

	r, err := openurl.OpenPool(ctx, []string{urlstr}, nil, opts.([]openurl.PoolOption[T])...)
	return r, nil
}

func (c *resolver[T]) Get(ctx context.Context, out interface{}) (bool, error) {
	path, err := c.template.Resolve(ctx)
	if err != nil {
		return false, err
	}

	for _, component := range c.Components {
		if path == component.path {
			if v, ok := out.(Convertible); ok {
				return v.As(out), nil
			} else {
				return false, nil
			}
			return true, nil
		}
	}

	// Not found, opening
	//r, err := c.opener.Open(ctx, path)
	//if err != nil {
	//	return false, err
	//}

	if v, ok := out.(Convertible); ok {
		return v.As(out), nil
	} else {
		return false, nil
	}

	c.Components = append(c.Components, &Component[T]{
		//	component: r,
		path: path,
	})

	return true, nil
}

func (c *resolver[T]) As(out interface{}) bool {
	//if v, ok := out.(*T); ok {
	//	*v = c.opener.(T)
	//	return true
	//}

	if v, ok := out.(Convertible); ok {
		return v.As(out)
	}

	return false
}
