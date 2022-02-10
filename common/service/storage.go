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

type storageOptions struct {
	serviceOptions *ServiceOptions
	prefix         interface{}
	dbConfigKey    interface{}
	defaultDriver  func() (string, string)
}

func (o *storageOptions) read(getter interface{}) string {
	val := ""
	switch v := getter.(type) {
	case func(*ServiceOptions) string:
		val = v(o.serviceOptions)
	case func(*storageOptions) string:
		val = v(o)
	case string:
		val = v
	}
	return val
}

type StorageOption func(options *storageOptions)

// WithStoragePrefix sets a prefix to be used differently depending on driver name
func WithStoragePrefix(i interface{}) StorageOption {
	return func(options *storageOptions) {
		options.prefix = i
	}
}

// WithStorageConfigKey provides a configuration key different from ServiceName for services requiring multiple DAOs
func WithStorageConfigKey(i interface{}) StorageOption {
	return func(options *storageOptions) {
		options.dbConfigKey = i
	}
}

// WithStorageDefaultDriver provides a default driver/dsn couple if not set in the configuration
func WithStorageDefaultDriver(d func() (string, string)) StorageOption {
	return func(options *storageOptions) {
		options.defaultDriver = d
	}
}

func daoFromOptions(o *ServiceOptions, fd func(dao.DAO) dao.DAO, indexer bool, opts *storageOptions) (dao.DAO, error) {
	var d dao.DAO
	dbConfigKey := opts.read(opts.dbConfigKey)
	prefix := opts.read(opts.prefix)

	driver, dsn, defined := config.GetStorageDriver(dbConfigKey)
	if !defined && opts.defaultDriver != nil {
		driver, dsn = opts.defaultDriver()
	}

	var c dao.DAO
	var e error

	switch driver {
	case dao.MysqlDriver, dao.SqliteDriver:
		c, e = sql.NewDAO(driver, dsn, prefix)
	case dao.BoltDriver:
		o.Unique = true
		c, e = boltdb.NewDAO(driver, dsn, prefix)
	case dao.BleveDriver:
		o.Unique = true
		c, e = bleve.NewDAO(driver, dsn, prefix)
	case dao.MongoDriver:
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
		case dao.BleveDriver:
			indexDAO, e = bleve.NewIndexer(c.(bleve.DAO))
		case dao.MongoDriver:
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
func WithStorage(fd func(dao.DAO) dao.DAO, opts ...StorageOption) ServiceOption {
	return func(o *ServiceOptions) {
		o.BeforeStart = append(o.BeforeStart, func(ctx context.Context) error {
			sOpts := &storageOptions{
				serviceOptions: o,
				dbConfigKey:    o.Name,
			}
			for _, op := range opts {
				op(sOpts)
			}
			d, err := daoFromOptions(o, fd, false, sOpts)
			if err != nil {
				return err
			}
			ctx = servicecontext.WithDAO(ctx, d)
			o.Context = ctx
			return nil
		})
	}
}

// WithIndexer adds an indexer handler to the current service
func WithIndexer(fd func(dao.DAO) dao.DAO, opts ...StorageOption) ServiceOption {
	return func(o *ServiceOptions) {
		o.BeforeStart = append(o.BeforeStart, func(ctx context.Context) error {
			sOpts := &storageOptions{
				serviceOptions: o,
				dbConfigKey:    o.Name,
			}
			for _, op := range opts {
				op(sOpts)
			}
			d, err := daoFromOptions(o, fd, true, sOpts)
			if err != nil {
				return err
			}
			ctx = servicecontext.WithIndexer(ctx, d)
			o.Context = ctx
			return nil
		})
	}
}
