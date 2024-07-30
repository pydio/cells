package bleve

import (
	"context"
	"fmt"
	"net/url"
	"strconv"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/controller"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/propagator"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

func init() {
	runtime.Register("system", func(ctx context.Context) {
		var mgr manager.Manager
		if !propagator.Get(ctx, manager.ContextKey, &mgr) {
			return
		}

		mgr.RegisterStorage("bleve", controller.WithCustomOpener(OpenPool))
	})
}

type pool struct {
	*openurl.Pool[*Indexer]
}

func OpenPool(ctx context.Context, uu string) (storage.Storage, error) {
	p, err := openurl.OpenPool(context.Background(), []string{uu}, func(ctx context.Context, dsn string) (*Indexer, error) {
		u, err := url.Parse(dsn)

		q := u.Query()

		rotationSize := DefaultRotationSize
		if q.Has("rotationSize") {
			if size, err := strconv.ParseInt(q.Get("rotationSize"), 10, 0); err != nil {
				return nil, fmt.Errorf("cannot parse rotationSize %v", err)
			} else {
				rotationSize = size
			}
		}

		batchSize := DefaultBatchSize
		if q.Has("batchSize") {
			if size, err := strconv.ParseInt(q.Get("batchSize"), 10, 0); err != nil {
				return nil, fmt.Errorf("cannot parse batchSize %v", err)
			} else {
				batchSize = size
			}
		}

		mappingName := DefaultMappingName
		if q.Has("mapping") {
			if mn := q.Get("mapping"); mn != "" {
				mappingName = mn
			}
		}

		index, err := newBleveIndexer(&BleveConfig{
			BlevePath:    u.Path,
			RotationSize: rotationSize,
			BatchSize:    batchSize,
			MappingName:  mappingName,
		})
		if err != nil {
			return nil, err
		}

		var cfg config.Store
		propagator.Get(ctx, config.ContextKey, &cfg)
		index.serviceConfigs = cfg

		return index, nil
	})

	if err != nil {
		return nil, err
	}

	return &pool{
		Pool: p,
	}, nil
}

func (p *pool) Get(ctx context.Context, data ...map[string]interface{}) (any, error) {
	return p.Pool.Get(ctx, data...)
}

func (p *pool) Close(ctx context.Context, iterate ...func(key string, res storage.Storage) error) error {
	return p.Pool.Close(ctx)
}

type bleveItem Indexer

func (i *bleveItem) Name() string {
	return "bleve"
}

func (i *bleveItem) ID() string {
	return uuid.New()
}

func (i *bleveItem) Metadata() map[string]string {
	return map[string]string{}
}

func (i *bleveItem) As(i2 interface{}) bool {
	if v, ok := i2.(**Indexer); ok {
		*v = (*Indexer)(i)
		return true
	}
	return false
}

func (i *bleveItem) Driver() string {
	return "bleve"
}

func (i *bleveItem) DSN() string {
	return (*Indexer)(i).MustBleveConfig(context.TODO()).BlevePath
}
