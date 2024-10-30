package manager

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"os"

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

	openurl.RegisterTplFunc("autoMkdir", func(dir string) string {
		if s, e := os.Stat(dir); e == nil {
			if !s.IsDir() {
				panic(fmt.Errorf("%s is not a directory", dir))
			}
			return dir
		} else if er := os.MkdirAll(dir, 0755); er == nil {
			return dir
		} else {
			panic(fmt.Errorf("cannot create directory %s: %v", dir, e))
		}
	})
	openurl.RegisterTplFunc("applicationDataDir", func() string {
		return runtime.ApplicationWorkingDir(runtime.ApplicationDirData)
	})
	openurl.RegisterTplFunc("serviceDataDir", func(dir string) string {
		return runtime.MustServiceDataDir(dir)
	})
}
