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

	var c dao.DAO
	var e error

	switch driver {
	case "mysql", "sqlite3":
		c, e = sql.NewDAO(driver, dsn, prefix)
	case "boltdb":
		o.Unique = true
		c, e = boltdb.NewDAO(driver, dsn, prefix)
	case "bleve":
		o.Unique = true
		c, e = bleve.NewDAO(driver, dsn, prefix)
	case "mongodb":
		c, e = mongodb.NewDAO(driver, dsn, prefix)
	default:
		return nil, fmt.Errorf("unsupported driver type %s for service %s", driver, o.Name)
	}
	if e != nil {
		return nil, e
	}

	if indexer {
		// Wrap DAO into IndexDAO
		var indexDAO dao.IndexDAO
		switch driver {
		case "bleve":
			indexDAO, e = bleve.NewIndexer(c.(bleve.DAO))
		case "mongodb":
			indexDAO, e = mongodb.NewIndexer(c.(mongodb.DAO))
		default:
			return nil, fmt.Errorf("unsupported indexer type %s for service %s", driver, o.Name)
		}
		if e != nil {
			return nil, e
		}
		c = indexDAO
	}

	// Now apply callback to DAO
	d = fd(c)
	if d == nil {
		return nil, fmt.Errorf("driver %s is not supported by %s", driver, o.Name)
	}

	cfg := config.Get("services", dbConfigKey)

	if err := d.Init(cfg); err != nil {
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
