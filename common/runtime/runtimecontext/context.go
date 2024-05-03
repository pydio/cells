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

type serviceKey struct{}

type managerKey struct{}

type configKey struct{}

type registryKey struct{}

type tenantKey struct{}

var (
	ServiceKey  = serviceKey{}
	ManagerKey  = managerKey{}
	RegistryKey = registryKey{}
	ConfigKey   = configKey{}
	TenantKey   = tenantKey{}
)

func With[T any](ctx context.Context, key any, t T) context.Context {
	return context.WithValue(ctx, key, t)
}

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
