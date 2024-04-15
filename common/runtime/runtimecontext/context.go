package runtimecontext

import (
	"context"

	"github.com/pydio/cells/v4/common/utils/configx"
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

func WithConfig(ctx context.Context, c configx.Values) context.Context {
	return context.WithValue(ctx, configKey, c)
}

func GetConfig(ctx context.Context) configx.Values {
	if ctx == nil {
		return nil
	}

	i := ctx.Value(configKey)
	if i == nil {
		return nil
	}

	c, ok := i.(configx.Values)
	if !ok {
		return nil
	}

	return c
}

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
