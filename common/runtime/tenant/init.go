package tenant

import (
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
)

type tenantKey struct{}

var ContextKey = tenantKey{}

func init() {
	runtimecontext.RegisterGenericInjector[Tenant](ContextKey)
}
