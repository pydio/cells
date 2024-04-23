package runtimecontext

import (
	"context"
)

type ContextInjector func(ctx, parent context.Context) context.Context

var (
	contextInjectors []ContextInjector
)

// RegisterContextInjector appends a ContextInjector to the internal registry
func RegisterContextInjector(injector ContextInjector) {
	contextInjectors = append(contextInjectors, injector)
}

// ForkContext copies all necessary dependencies using the internal ContextInjector registry
func ForkContext(ctx, parent context.Context) context.Context {
	for _, i := range contextInjectors {
		ctx = i(ctx, parent)
	}
	return ctx
}

type contextType int

const (
	configKey contextType = iota
	managerKey
)

func With[T any](ctx context.Context, key string, t T) context.Context {
	return context.WithValue(ctx, key, t)
}

func Get[T any](ctx context.Context, key string, out *T) bool {
	if ctx == nil {
		return false
	}

	i := ctx.Value(key)
	if i == nil {
		return false
	}

	c, ok := i.(T)
	if !ok {
		return false
	}

	*out = c

	return true
}
