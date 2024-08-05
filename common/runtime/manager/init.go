package manager

import (
	"context"

	"github.com/pydio/cells/v4/common/errors"
	cache_helper "github.com/pydio/cells/v4/common/utils/cache/helper"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

func init() {
	cache_helper.SetCacheRegistryResolver(func(ctx context.Context) (cache_helper.CacheRegistry, error) {
		var mgr Manager
		if propagator.Get(ctx, ContextKey, &mgr) {
			return mgr, nil
		}
		return nil, errors.New("cannot find manager in context")
	})
}
