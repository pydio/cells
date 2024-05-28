package sc

import (
	"context"

	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

var (
	_ storage.Storage = (*provider)(nil)
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		var mgr manager.Manager
		if propagator.Get(ctx, manager.ContextKey, &mgr) {
			return
		}

		mgr.RegisterStorage("securecookie", &provider{})
	})
}

type Conn struct{}

type provider struct{}

func (s *provider) OpenURL(ctx context.Context, dsn string) (storage.Storage, error) {
	return s, nil
}

func (s *provider) Get(ctx context.Context, out interface{}) (provides bool, er error) {
	switch v := out.(type) {
	case **Conn:
		*v = &Conn{}
		return true, nil
	}
	return false, nil
}

func (s *provider) CloseConns(ctx context.Context, clean ...bool) (er error) {
	return nil
}
