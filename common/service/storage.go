package service

import (
	"context"
	"fmt"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/bleve"
	"github.com/pydio/cells/v4/common/dao/boltdb"
	"github.com/pydio/cells/v4/common/dao/mongodb"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/sql"
)

func daoOpt(o *ServiceOptions, getter interface{}) string {
	val := ""
	switch v := getter.(type) {
	case func(*ServiceOptions) string:
		val = v(o)
	case string:
		val = v
	}
	return val
}

func daoFromOptions(o *ServiceOptions, fd func(dao.DAO) dao.DAO, indexer bool, opts ...interface{}) (dao.DAO, error) {
	var d dao.DAO
	var dbConfigKey, prefix string
	if len(opts) > 0 {
		prefix = daoOpt(o, opts[0])
	}
	dbConfigKey = o.Name
	if len(opts) > 1 {
		dbConfigKey = daoOpt(o, opts[1])
	}
	driver, dsn := config.GetDatabase(dbConfigKey)

	switch driver {
	case "mysql":
		if c := sql.NewDAO(driver, dsn, prefix); c != nil {
			d = fd(c)
		}
	case "sqlite3":
		if c := sql.NewDAO(driver, dsn, prefix); c != nil {
			d = fd(c)
		}
	case "boltdb":
		if c := boltdb.NewDAO(driver, dsn, prefix); c != nil {
			d = fd(c)
			o.Unique = true
		}
	case "bleve":
		if c := bleve.NewDAO(driver, dsn, prefix); c != nil {
			if indexer {
				if id, er := bleve.NewIndexer(c, config.Get("services", dbConfigKey)); er == nil {
					d = fd(id)
				}
			} else {
				d = fd(c)
			}
			o.Unique = true
		}
	case "mongodb":
		if c := mongodb.NewDAO(driver, dsn, prefix); c != nil {
			if indexer {
				if id, er := mongodb.NewIndexer(c); er == nil {
					d = fd(id)
				}
			} else {
				d = fd(c)
			}
		}
	default:
		return nil, fmt.Errorf("unsupported driver type %s for service %s", driver, o.Name)
	}

	if d == nil {
		return nil, fmt.Errorf("storage %s is not available", driver)
	}

	cfg := config.Get("services", o.Name)
	if err := d.Init(cfg); err != nil {
		// log.Logger(ctx).Error("Failed to init DB provider", zap.Error(err))
		return nil, err
	}

	return d, nil

}

// WithStorage adds a storage handler to the current service
func WithStorage(fd func(dao.DAO) dao.DAO, opts ...interface{}) ServiceOption {
	return func(o *ServiceOptions) {
		o.BeforeStart = append(o.BeforeStart, func(ctx context.Context) error {
			d, err := daoFromOptions(o, fd, false, opts...)
			if err != nil {
				return err
			}
			ctx = servicecontext.WithDAO(ctx, d)
			o.Context = ctx
			return nil
		})
	}
}

// WithIndexer adds a storage handler to the current service
func WithIndexer(fd func(dao.DAO) dao.DAO, opts ...interface{}) ServiceOption {
	return func(o *ServiceOptions) {
		o.BeforeStart = append(o.BeforeStart, func(ctx context.Context) error {
			d, err := daoFromOptions(o, fd, true, opts...)
			if err != nil {
				return err
			}
			ctx = servicecontext.WithIndexer(ctx, d)
			o.Context = ctx
			return nil
		})
	}
}
