package config

import (
	"context"
	"reflect"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/controller"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage"
	"github.com/pydio/cells/v5/common/utils/openurl"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

func init() {
	runtime.Register("system", func(ctx context.Context) {
		var mgr manager.Manager
		if !propagator.Get(ctx, manager.ContextKey, &mgr) {
			return
		}

		for _, scheme := range config.DefaultURLMux().Schemes() {
			mgr.RegisterStorage(scheme, controller.WithCustomOpener(OpenPool))
		}
	})
}

type pool struct {
	*openurl.Pool[config.Store]
}

func OpenPool(ctx context.Context, uu string) (storage.Storage, error) {
	p, err := openurl.OpenPool(context.Background(), []string{uu}, func(ctx context.Context, dsn string) (config.Store, error) {
		// Not found, opening
		db, err := config.OpenStore(ctx, dsn)
		if err != nil {
			return nil, err
		}

		return db, nil
	})

	return &pool{p}, err
}

func (p *pool) ReturnType() reflect.Type {
	return reflect.TypeOf(&pool{})
}

func (p *pool) Get(ctx context.Context, data ...map[string]interface{}) (any, error) {
	return p.Pool.Get(ctx, data...)
}

func (p *pool) Close(ctx context.Context, iterate ...func(key string, res storage.Storage) error) error {
	return p.Pool.Close(ctx)
}
