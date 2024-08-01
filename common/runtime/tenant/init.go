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
	openurl.RegisterTemplateInjector(func(ctx context.Context, m map[string]interface{}) error {
		if t := ctx.Value(common.CtxTargetTenantName); t != nil {
			m["Tenant"] = t.(string)
		} else if ten := ctx.Value(ContextKey); ten != nil {
			m["Tenant"] = ten.(Tenant).ID()
		} else {
			fmt.Println("TemplateInjector - tenant not found in context")
		}
		return nil
	})
	openurl.RegisterTplFunc("tenantPathWithBlank", PathWithBlank)
	openurl.RegisterTplFunc("tenantSepWithBlank", ValueOrBlank)
}

// PathWithBlank returns the /tenant value, unless the tenant equals the blank value and it returns empty
func PathWithBlank(tenant, blankValue string) string {
	if tenant == blankValue {
		return ""
	} else {
		return "/" + tenant
	}
}

func ValueOrBlank(tenant, separator, blankValue string) string {
	if tenant == blankValue {
		return ""
	} else {
		return tenant + separator
	}
}
