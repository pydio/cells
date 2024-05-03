package tenant

import (
	"context"

	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
)

func init() {
	runtimecontext.RegisterContextInjector(func(ctx, parent context.Context) context.Context {
		var ten Tenant
		if runtimecontext.Get(parent, runtimecontext.TenantKey, &ten) {
			return runtimecontext.With(ctx, runtimecontext.TenantKey, ten)
		}
		return ctx
	})

}
