package manager

import (
	"context"

	"github.com/pydio/cells/v5/common/middleware"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

var defaultContextProvider = &basicContextProvider{id: "default"}

func init() {
	runtime.RegisterMultiContextManager(&basicMulti{defaultContextProvider})

	middleware.RegisterModifier(propagator.IncomingContextModifier(func(ctx context.Context) (context.Context, bool, error) {
		return runtime.MultiContextManager().CurrentContextProvider(ctx).Context(ctx), true, nil
	}))
}

type basicContextProvider struct {
	id  string
	ctx context.Context
}

func (b *basicContextProvider) ID() string {
	return b.id
}

func (b *basicContextProvider) SetRootContext(ctx context.Context) {
	b.ctx = ctx
}

func (b *basicContextProvider) Context(ctx context.Context) context.Context {
	return propagator.ForkContext(ctx, b.ctx)
}

type basicMulti struct {
	runtime.ContextProvider
}

func (b *basicMulti) Current(ctx context.Context) string {
	return b.ContextProvider.ID()
}

func (b *basicMulti) CurrentContextProvider(ctx context.Context) runtime.ContextProvider {
	return b.ContextProvider
}

func (b *basicMulti) RootContext(ctx context.Context) context.Context {
	return propagator.With(b.ContextProvider.Context(ctx), runtime.MultiContextKey, "default")
}

func (b *basicMulti) Iterate(ctx context.Context, add func(context.Context, string) error) error {
	return add(b.RootContext(ctx), b.ContextProvider.ID())
}

func (b *basicMulti) Watch(ctx context.Context, add func(context.Context, string) error, remove func(context.Context, string) error, iterate bool) error {
	if iterate {
		if er := b.Iterate(ctx, add); er != nil {
			return er
		}
	}
	return nil
}
