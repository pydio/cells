package sql

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/controller"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/storage/sql/dbresolver"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

var (
	Drivers = []string{MySQLDriver, PostgreDriver, SqliteDriver}
)

func init() {
	runtime.Register("system", func(ctx context.Context) {
		var mgr manager.Manager
		if !runtimecontext.Get(ctx, manager.ContextKey, &mgr) {
			return
		}

		for _, gormType := range Drivers {
			mgr.RegisterStorage(gormType, controller.WithCustomOpener(OpenPool))
		}
	})
}

type pool struct {
	*gorm.DB
	*openurl.Pool[*sql.DB]
}

func OpenPool(ctx context.Context, uu string) (storage.Storage, error) {
	p, err := openurl.OpenPool(context.Background(), []string{uu}, func(ctx context.Context, dsn string) (*sql.DB, error) {
		parts := strings.SplitN(dsn, "://", 2)
		if len(parts) < 2 {
			return nil, errors.New("wrong format dsn")
		}
		return sql.Open(parts[0], parts[1])
	})

	if err != nil {
		return nil, err
	}

	dr := dbresolver.New(p)

	db, err := gorm.Open(dr.Dialector(), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	db.Use(dr)

	return &pool{
		DB:   db,
		Pool: p,
	}, nil
}

func (p *pool) Get(ctx context.Context, data ...map[string]string) (any, error) {
	return p.DB.Session(&gorm.Session{Context: ctx}), nil
}

func (p *pool) Close(ctx context.Context, iterate ...func(key string, res storage.Storage) error) error {
	db, err := p.DB.Session(&gorm.Session{Context: ctx}).DB()
	if err != nil {
		return err
	}

	return db.Close()
}

type Dialector struct {
	gorm.Dialector
	Helper
}

func (d *Dialector) Translate(err error) error {
	t, ok := d.Dialector.(gorm.ErrorTranslator)
	if !ok {
		return err
	}

	return t.Translate(err)
}
