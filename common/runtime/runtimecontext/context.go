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

// RegisterGenericInjector creates a context injector that copies the type T from parent to child context
func RegisterGenericInjector[T any](key any) {
	contextInjectors = append(contextInjectors, func(ctx, parent context.Context) context.Context {
		var obj T
		if Get(parent, key, &obj) {
			return With(ctx, key, obj)
		}
		return ctx
	})
}

// ForkContext copies all necessary dependencies using the internal ContextInjector registry
func ForkContext(ctx, parent context.Context) context.Context {
	for _, i := range contextInjectors {
		ctx = i(ctx, parent)
	}
	return ctx
}

func ForkOneKey(key any, child, parent context.Context) context.Context {
	if v := parent.Value(key); v != nil {
		return context.WithValue(child, key, v)
	}
	return child
}

// With is a generic context-setter
func With[T any](ctx context.Context, key any, t T) context.Context {
	return context.WithValue(ctx, key, t)
}

// Get is a generic context-getter to an expected type
func Get[T any](ctx context.Context, key any, out *T) bool {
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
