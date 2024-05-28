package tenant

import (
	"github.com/pydio/cells/v4/common/utils/propagator"
)

type tenantKey struct{}

var ContextKey = tenantKey{}

func init() {
	propagator.RegisterKeyInjector[Tenant](ContextKey)
}
