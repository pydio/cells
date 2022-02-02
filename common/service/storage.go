package service

import (
	"context"
	"fmt"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/boltdb"
	"github.com/pydio/cells/v4/common/dao/mongodb"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/sql"
)

// WithStorage adds a storage handler to the current service
func WithStorage(fd func(dao.DAO) dao.DAO, prefix ...interface{}) ServiceOption {
	return func(o *ServiceOptions) {
		o.DAO = fd
		if len(prefix) == 1 {
			o.Prefix = prefix[0]
		}

		o.BeforeStart = append(o.BeforeStart, func(ctx context.Context) error {
			// log.Logger(ctx).Debug("BeforeStart - Database connection")

			var d dao.DAO
			driver, dsn := config.GetDatabase(o.Name)

			var prefix string
			switch v := o.Prefix.(type) {
			case func(*ServiceOptions) string:
				prefix = v(o)
			case string:
				prefix = v
			default:
				prefix = ""
			}

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
				}
			case "mongodb":
				if c := mongodb.NewDAO(driver, dsn, prefix); c != nil {
					d = fd(c)
				}
			default:
				return fmt.Errorf("unsupported driver type %s for service %s", driver, o.Name)
			}

			if d == nil {
				return fmt.Errorf("storage %s is not available", driver)
			}

			ctx = servicecontext.WithDAO(ctx, d)

			cfg := config.Get("services", o.Name)

			if err := d.Init(cfg); err != nil {
				// log.Logger(ctx).Error("Failed to init DB provider", zap.Error(err))
				return err
			}

			o.Context = ctx

			// log.Logger(ctx).Debug("BeforeStart - Connected to a database")

			return nil
		})
	}
}
