package runtime

import (
	"context"

	"github.com/pydio/cells/v4/common/utils/propagator"
)

type mCtxKey struct{}

type coreCtxKey struct{}

var (
	MultiContextKey                      = mCtxKey{}
	mcManager       MultiContextProvider = &basicMulti{}
)

func init() {
	propagator.RegisterKeyInjector[string](MultiContextKey)
}

func TODOKnownEmpty(ctx context.Context) context.Context {
	return mcManager.RootContext(ctx)
}

func AsCoreContext(ctx context.Context) context.Context {
	return propagator.With(ctx, MultiContextKey, &coreCtxKey{})
}

func IsCoreContext(ctx context.Context) bool {
	var core *coreCtxKey
	return propagator.Get(ctx, MultiContextKey, &core)
}

func CoreBackground() context.Context {
	return AsCoreContext(context.Background())
}

func RegisterMultiContextManager(m MultiContextProvider) {
	mcManager = m
}

func MultiContextManager() MultiContextProvider {
	return mcManager
}

// MultiMatches compares two contexts
func MultiMatches(ctx1, ctx2 context.Context) bool {
	return mcManager.Current(ctx1) == mcManager.Current(ctx2)
}

type ContextProvider interface {
	ID() string
	Context(ctx context.Context) context.Context
}

type MultiContextProvider interface {
	Current(ctx context.Context) string
	RootContext(ctx context.Context) context.Context
	Iterate(ctx context.Context, add func(context.Context, string) error) error
	Watch(ctx context.Context, add func(context.Context, string) error, remove func(context.Context, string) error, iterate bool) error
}

type basicMulti struct{}

func (b *basicMulti) Current(ctx context.Context) string {
	return "default"
}

func (b *basicMulti) RootContext(ctx context.Context) context.Context {
	return propagator.With(ctx, MultiContextKey, "default")
}

func (b *basicMulti) Iterate(ctx context.Context, add func(context.Context, string) error) error {
	ctx = propagator.With(ctx, MultiContextKey, "default")
	return add(ctx, "default")
}

func (b *basicMulti) Watch(ctx context.Context, add func(context.Context, string) error, remove func(context.Context, string) error, iterate bool) error {
	if iterate {
		if er := b.Iterate(ctx, add); er != nil {
			return er
		}
	}
	return nil
}
