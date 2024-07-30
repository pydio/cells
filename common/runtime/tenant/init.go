package tenant

import (
	"context"
	"fmt"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

type tenantKey struct{}

var ContextKey = tenantKey{}

func init() {
	propagator.RegisterKeyInjector[Tenant](ContextKey)
	openurl.RegisterContextInjector(func(ctx context.Context, m map[string]interface{}) error {
		if t := ctx.Value(common.CtxTargetTenantName); t != nil {
			m["Tenant"] = t.(string)
		} else if ten := ctx.Value(ContextKey); ten != nil {
			m["Tenant"] = ten.(Tenant).ID()
		} else {
			fmt.Println("ContextInjector - tenant not found in context")
		}
		return nil
	})
}
