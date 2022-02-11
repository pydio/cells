package service

import (
	"context"
	"fmt"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/bleve"
	"github.com/pydio/cells/v4/common/dao/boltdb"
	"github.com/pydio/cells/v4/common/dao/mongodb"
	sql2 "github.com/pydio/cells/v4/common/dao/sql"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/sql"
)

type StorageOptions struct {
	StorageKey       string
	SupportedDrivers []string
	DefaultDriver    dao.DriverProviderFunc
	Migrator         dao.MigratorFunc
	prefix           interface{}
}

func (o *StorageOptions) Prefix(options *ServiceOptions) string {
	val := ""
	if o.prefix == nil {
		return val
	}
	switch v := o.prefix.(type) {
	case func(*ServiceOptions) string:
		val = v(options)
	case func(*StorageOptions) string:
		val = v(o)
	case string:
		val = v
	}
	return val
}

type StorageOption func(options *StorageOptions)

// WithStoragePrefix sets a prefix to be used differently depending on driver name
func WithStoragePrefix(i interface{}) StorageOption {
	return func(options *StorageOptions) {
		options.prefix = i
	}
}

// WithStorageSupport declares wich drivers can be supported by this service
func WithStorageSupport(dd ...string) StorageOption {
	return func(options *StorageOptions) {
		options.SupportedDrivers = append(options.SupportedDrivers, dd...)
	}
}

// WithStorageDefaultDriver provides a default driver/dsn couple if not set in the configuration
func WithStorageDefaultDriver(d func() (string, string)) StorageOption {
	return func(options *StorageOptions) {
		options.DefaultDriver = d
	}
}

// WithStorageMigrator provides a Migrate function from one DAO to another
func WithStorageMigrator(d dao.MigratorFunc) StorageOption {
	return func(options *StorageOptions) {
		options.Migrator = d
	}
}

func daoFromOptions(o *ServiceOptions, fd func(dao.DAO) dao.DAO, indexer bool, opts *StorageOptions) (dao.DAO, error) {
	var d dao.DAO
	prefix := opts.Prefix(o)

	cfgKey := "storage"
	if indexer {
		cfgKey = "indexer"
	}
	driver, dsn, defined := config.GetStorageDriver(cfgKey, o.Name)
	if !defined && opts.DefaultDriver != nil {
		driver, dsn = opts.DefaultDriver()
	}

	var c dao.DAO
	var e error

	switch driver {
	case sql2.MysqlDriver, sql2.SqliteDriver:
		c, e = sql.NewDAO(driver, dsn, prefix)
	case boltdb.Driver:
		o.Unique = true
		c, e = boltdb.NewDAO(driver, dsn, prefix)
	case bleve.Driver:
		o.Unique = true
		c, e = bleve.NewDAO(driver, dsn, prefix)
	case mongodb.Driver:
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
		case bleve.Driver:
			indexDAO, e = bleve.NewIndexer(c)
		case mongodb.Driver:
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

	cfg := config.Get("services", o.Name)

	if err := d.Init(cfg); err != nil {
		return nil, err
	}

	return d, nil

}

// WithStorage adds a storage handler to the current service
func WithStorage(fd func(dao.DAO) dao.DAO, opts ...StorageOption) ServiceOption {
	return makeStorageServiceOption(false, fd, opts...)
}

// WithIndexer adds an indexer handler to the current service
func WithIndexer(fd func(dao.DAO) dao.DAO, opts ...StorageOption) ServiceOption {
	return makeStorageServiceOption(true, fd, opts...)
}

func makeStorageServiceOption(indexer bool, fd func(dao.DAO) dao.DAO, opts ...StorageOption) ServiceOption {
	return func(o *ServiceOptions) {
		storageKey := "storage"
		if indexer {
			storageKey = "indexer"
		}
		sOpts := &StorageOptions{
			StorageKey: storageKey,
		}
		for _, op := range opts {
			op(sOpts)
		}
		o.Storages = append(o.Storages, sOpts)
		/*
			if sOpts.Migrator != nil {
				dao.RegisterStorageMigrator(o.Name+" ("+storageKey+")", sOpts.Prefix(o), sOpts.Migrator)
			}
			if sOpts.DefaultDriver != nil {
				dao.RegisterDefaultDriver(sOpts.DefaultDriver)
			}
		*/
		o.BeforeStart = append(o.BeforeStart, func(ctx context.Context) error {
			d, err := daoFromOptions(o, fd, indexer, sOpts)
			if err != nil {
				return err
			}
			if indexer {
				ctx = servicecontext.WithIndexer(ctx, d)
			} else {
				ctx = servicecontext.WithDAO(ctx, d)
			}
			o.Context = ctx
			return nil
		})

	}
}
