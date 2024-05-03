package registry

import (
	"context"

	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
)

func init() {
	runtimecontext.RegisterContextInjector(func(ctx, parent context.Context) context.Context {
		var reg Registry
		if runtimecontext.Get(parent, runtimecontext.RegistryKey, &reg) {
			return runtimecontext.With(ctx, runtimecontext.RegistryKey, reg)
		}
		return ctx
	})
}
