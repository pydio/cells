package sql

import (
	"context"
	"database/sql"
	"errors"
	"net/url"
	"strings"
	"time"

	"github.com/glebarez/sqlite"
	mysql2 "github.com/go-sql-driver/mysql"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
	opentracing "gorm.io/plugin/opentracing"

	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/controller"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/storage/sql/dbresolver"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

var (
	Drivers = []string{MySQLDriver, PostgreDriver, SqliteDriver}
)

func init() {
	runtime.Register("system", func(ctx context.Context) {
		var mgr manager.Manager
		if !propagator.Get(ctx, manager.ContextKey, &mgr) {
			return
		}

		for _, gormType := range Drivers {
			mgr.RegisterStorage(gormType, controller.WithCustomOpener(OpenPool))
		}
	})
	schema.RegisterSerializer("proto_enum", EnumSerial{})
}

type pool struct {
	*openurl.Pool[*gorm.DB]
}

func OpenPool(ctx context.Context, uu string) (storage.Storage, error) {
	p, err := openurl.OpenPool(ctx, []string{uu}, func(ctx context.Context, dsn string) (*gorm.DB, error) {
		parts := strings.SplitN(dsn, "://", 2)
		if len(parts) < 2 {
			return nil, errors.New("wrong format dsn")
		}

		conn, err := sql.Open(parts[0], parts[1])
		if err != nil {
			return nil, err
		}

		var dialect gorm.Dialector
		var prefix, policies, singular string
		if dbresolver.IsMysqlConn(conn.Driver()) {
			dialect = &Dialector{
				Dialector: mysql.New(mysql.Config{
					Conn: conn,
				}),
				Helper: &mysqlHelper{},
			}
			config, err := mysql2.ParseDSN(dsn)
			if err != nil {
				return nil, err
			}
			if p, ok := config.Params["prefix"]; ok {
				prefix = p
			}
			delete(config.Params, "prefix")
			if p, ok := config.Params["policies"]; ok {
				policies = p
			}
			delete(config.Params, "policies")
			if p, ok := config.Params["singular"]; ok {
				singular = p
			}
			delete(config.Params, "singular")

			dsn = config.FormatDSN()
		} else if dbresolver.IsPostGreConn(conn.Driver()) {
			dialect = &Dialector{
				Dialector: postgres.New(postgres.Config{
					Conn: conn,
				}),
				Helper: &postgresHelper{},
			}

			u, err := url.Parse(dsn)
			if err != nil {
				return nil, err
			}

			q := u.Query()
			if q.Has("prefix") {
				prefix = q.Get("prefix")
			}
			if q.Has("policies") {
				policies = q.Get("policies")
			}
			if q.Has("singular") {
				singular = q.Get("singular")
			}
		} else if dbresolver.IsSQLiteConn(conn.Driver()) {
			dialect = &Dialector{
				Dialector: &sqlite.Dialector{
					Conn: conn,
				},
				Helper: &sqliteHelper{},
			}

			u, err := url.Parse(dsn)
			if err != nil {
				return nil, err
			}

			q := u.Query()
			if q.Has("prefix") {
				prefix = q.Get("prefix")
			}
			if q.Has("policies") {
				policies = q.Get("policies")
			}
			if q.Has("singular") {
				singular = q.Get("singular")
			}
		}
		if policies == "<no value>" {
			policies = ""
		}

		customLogger := NewLogger(logger.Config{
			SlowThreshold:             time.Second, // Slow SQL threshold
			LogLevel:                  logger.Warn, // Log level
			IgnoreRecordNotFoundError: true,        // Ignore ErrRecordNotFound error for logger
			// ParameterizedQueries:      true,        // Don't include params in the SQL log
			// Colorful: false, // Disable color
		})

		db, err := gorm.Open(dialect, &gorm.Config{
			TranslateError: true,
			Logger: NewLogger(logger.Config{
				SlowThreshold:             time.Second,   // Slow SQL threshold
				LogLevel:                  logger.Silent, // Log level
				IgnoreRecordNotFoundError: true,          // Ignore ErrRecordNotFound error for logger
				// ParameterizedQueries:      true,        // Don't include params in the SQL log
				// Colorful: false, // Disable color
			}),
			NamingStrategy: &customNaming{
				NamingStrategy: &schema.NamingStrategy{
					TablePrefix:   prefix,
					SingularTable: singular == "true",
				},
				Policies: policies,
			},
		})

		if err != nil {
			return nil, err
		}
		// also replace Default
		logger.Default = customLogger
		_ = db.Use(opentracing.New())

		return db, nil
	})

	if err != nil {
		return nil, err
	}

	return &pool{
		Pool: p,
	}, nil
}

func (p *pool) Get(ctx context.Context, data ...map[string]string) (any, error) {
	return p.Pool.Get(ctx)
}

func (p *pool) Close(ctx context.Context, iterate ...func(key string, res storage.Storage) error) error {
	return p.Pool.Close(ctx)
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
