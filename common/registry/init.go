package registry

import (
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
)

type registryKey struct{}

var ContextKey = registryKey{}

func init() {
	runtimecontext.RegisterGenericInjector[Registry](ContextKey)
}
