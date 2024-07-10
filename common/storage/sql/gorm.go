package sql

import (
	"context"
	"database/sql"
	"net/url"
	"strings"
	"time"

	"github.com/glebarez/sqlite"
	mysql2 "github.com/go-sql-driver/mysql"
	pgx "github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/stdlib"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
	otel "gorm.io/plugin/opentelemetry/tracing"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/controller"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/propagator"

	_ "github.com/jackc/pgx/v5"
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
	schema.RegisterSerializer("bool_int", BoolInt{})
}

type pool struct {
	*openurl.Pool[*gorm.DB]
}

func cleanDSN(dsn string, vars map[string]string, parserType string) (string, error) {
	switch parserType {
	case "mysql":
		conf, err := mysql2.ParseDSN(dsn)
		if err != nil {
			return "", err
		}
		for k := range vars {
			if v, ok := conf.Params[k]; ok {
				if v != "<no value>" {
					vars[k] = v
				}
				delete(conf.Params, k)
			}
		}
		return conf.FormatDSN(), nil
	default:
		u, er := url.Parse(dsn)
		if er != nil {
			return dsn, er
		}
		query := u.Query()
		for k := range vars {
			if query.Has(k) {
				if query.Get(k) != "<no value>" {
					vars[k] = query.Get(k)
				}
				query.Del(k)
			}
		}
		u.RawQuery = query.Encode()
		return u.String(), nil
	}
}

func OpenPool(ctx context.Context, uu string) (storage.Storage, error) {
	p, err := openurl.OpenPool(ctx, []string{uu}, func(ctx context.Context, dsn string) (*gorm.DB, error) {
		parts := strings.SplitN(dsn, "://", 2)
		if len(parts) < 2 {
			return nil, errors.WithMessage(errors.SqlDAO, "wrong format dsn")
		}
		scheme := parts[0]
		expectedVars := map[string]string{
			"prefix":   "",
			"policies": "",
			"singular": "",
		}
		var clean string
		var er error
		var conn *sql.DB
		switch scheme {
		case MySQLDriver:
			clean, er = cleanDSN(dsn, expectedVars, "mysql")
			clean = strings.TrimPrefix(clean, scheme+"://")
		case SqliteDriver:
			clean, er = cleanDSN(dsn, expectedVars, "url")
			clean = strings.TrimPrefix(clean, scheme+"://")
		case PostgreDriver:
			clean, er = cleanDSN(dsn, expectedVars, "url")
		default:
			return nil, errors.WithMessage(errors.SqlDAO, "unsupported scheme")
		}
		if er != nil {
			return nil, er
		}

		// Open sql connection pool - special case to force PG to use PGX driver, not PQ
		switch scheme {
		case PostgreDriver:
			pgxConfig, err := pgx.ParseConfig(clean)
			if err != nil {
				return nil, err
			}
			conn = stdlib.OpenDB(*pgxConfig)
		default:
			conn, er = sql.Open(scheme, clean)
		}
		if er != nil {
			return nil, er
		}

		var dialect gorm.Dialector
		switch scheme {
		case MySQLDriver:
			dialect = &Dialector{
				Dialector: mysql.New(mysql.Config{
					Conn: conn,
				}),
				Helper: &mysqlHelper{},
			}
		case PostgreDriver:
			dialect = &Dialector{
				Dialector: postgres.New(postgres.Config{
					Conn: conn,
				}),
				Helper: &postgresHelper{},
			}
		case SqliteDriver:
			dialect = &Dialector{
				Dialector: &sqlite.Dialector{
					Conn: conn,
				},
				Helper: &sqliteHelper{},
			}
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
				SlowThreshold:             time.Second,  // Slow SQL threshold
				LogLevel:                  logger.Error, // Log level
				IgnoreRecordNotFoundError: true,         // Ignore ErrRecordNotFound error for logger
				// ParameterizedQueries:      true,        // Don't include params in the SQL log
				// Colorful: false, // Disable color
			}),
			NamingStrategy: &customNaming{
				NamingStrategy: &schema.NamingStrategy{
					TablePrefix:   expectedVars["prefix"],
					SingularTable: expectedVars["singular"] == "true",
				},
				Policies: expectedVars["policies"],
			},
		})

		if err != nil {
			return nil, err
		}
		// also replace Default
		logger.Default = customLogger
		// This enables tracing and metrics on DB
		_ = db.Use(otel.NewPlugin())

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
