package controller

import "context"

type Controller[T any] interface {
	Get(ctx context.Context, opts ...ControllerOption) T
}

type ControllerOption func(*controllerOptions)

type controller[T any] struct {
	ctx        context.Context
	cancel     context.CancelFunc
	Components map[string]T
}

type controllerOptions struct{}

func NewController[T any](ctx context.Context) Controller[T] {
	return &controller[T]{}
}

func (c *controller[T]) Get(ctx context.Context, opts ...ControllerOption) T {
	return c.Components["default"]
}
