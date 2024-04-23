package controller

import (
	"context"

	"github.com/pydio/cells/v4/common/utils/openurl"
)

type Controller[T any] interface {
	Get(ctx context.Context, out *T, opts ...ControllerOption) bool
}

type Opener[T any] func(ctx context.Context, path string) (T, error)

type ControllerOption func(*controllerOptions)

type controller[T any] struct {
	ctx    context.Context
	cancel context.CancelFunc

	template openurl.Template
	opener   Opener[T]

	Components []*Component[T]
}

type Component[T any] struct {
	path      string
	component T
}

type controllerOptions struct{}

func NewController[T any](ctx context.Context, urlstr string, opener Opener[T]) (Controller[T], error) {
	t, err := openurl.URLTemplate(urlstr)
	if err != nil {
		return nil, err
	}

	return &controller[T]{
		template: t,
		opener:   opener,
	}, nil
}

func (c *controller[T]) Get(ctx context.Context, out *T, opts ...ControllerOption) bool {
	u, err := c.template.ResolveURL(ctx)
	if err != nil {
		return false
	}
	path := u.String()

	for _, component := range c.Components {
		if path == component.path {
			*out = component.component
			return true
		}
	}

	// Not found, opening
	component, err := c.opener(ctx, path)
	if err != nil {
		return false
	}

	*out = component

	c.Components = append(c.Components, &Component[T]{
		component: component,
		path:      path,
	})

	return true
}
