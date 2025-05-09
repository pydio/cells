package sql

import (
	"context"
	"crypto/tls"
	"database/sql"
	"fmt"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/glebarez/sqlite"
	mysql2 "github.com/go-sql-driver/mysql"
	pgx "github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/stdlib"
	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
	otel "gorm.io/plugin/opentelemetry/tracing"

	"github.com/pydio/cells/v5/common/crypto"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/controller"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/openurl"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/uuid"

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
		mgr.RegisterStorage("gorm", controller.WithCustomOpener(OpenPool))
	})

	schema.RegisterSerializer("proto_enum", EnumSerial{})
	schema.RegisterSerializer("bool_int", BoolInt{})

	// Custom logger silences ErrInvalidConn as there is a retry mechanism
	_ = mysql2.SetLogger(&mysqlLogger{})
}

type pool struct {
	*openurl.Pool[*gorm.DB]
}

type mysqlLogger struct{}

func (*mysqlLogger) Print(v ...any) {
	if len(v) > 0 && v[0] == mysql2.ErrInvalidConn {
		return
	}
	log.Logger(runtime.AsCoreContext(context.Background())).Warnf("[mysql] %v", v)
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
	case "gorm":
		u, er := url.Parse(dsn)
		if er != nil {
			return dsn, er
		}
		query := u.Query()
		driver := query.Get("driver")
		if driver == "" {
			return "", fmt.Errorf("please provide a driver parameter for gorm scheme")
		}
		query.Del("driver")
		// Replace scheme
		u.Scheme = driver
		if u.Scheme == "mysql" {
			conn := query.Get("conn")
			query.Del("conn")
			u.Host = fmt.Sprintf("%s(%s:%s)", conn, u.Hostname(), u.Port())
			u.RawQuery = query.Encode()
			return cleanDSN(u.String(), vars, "mysql")
		} else {
			u.RawQuery = query.Encode()
			return cleanDSN(u.String(), vars, "url")
		}
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

func varsToTLSConfig(vars map[string]string) (*tls.Config, error) {
	u := &url.URL{}
	q := u.Query()
	q.Add(crypto.KeyCertStoreName, vars[crypto.KeyCertStoreName])
	q.Add(crypto.KeyCertInsecureHost, vars[crypto.KeyCertInsecureHost])
	q.Add(crypto.KeyCertUUID, vars[crypto.KeyCertUUID])
	q.Add(crypto.KeyCertKeyUUID, vars[crypto.KeyCertKeyUUID])
	q.Add(crypto.KeyCertCAUUID, vars[crypto.KeyCertCAUUID])
	u.RawQuery = q.Encode()
	return crypto.TLSConfigFromURL(u)
}

func OpenPool(ctx context.Context, uu string) (storage.Storage, error) {
	p, err := openurl.OpenPool(ctx, []string{uu}, func(ctx context.Context, dsn string) (*gorm.DB, error) {
		parts := strings.SplitN(dsn, "://", 2)
		if len(parts) < 2 {
			return nil, errors.WithMessage(errors.SqlDAO, "wrong format dsn")
		}
		scheme := parts[0]
		expectedVars := map[string]string{
			"prefix":                   "",
			"policies":                 "",
			"singular":                 "",
			"hookNames":                "",
			"ssl":                      "",
			"maxConnections":           "10",
			"maxIdleConnections":       "5",
			"connMaxLifetime":          "1m",
			crypto.KeyCertUUID:         "",
			crypto.KeyCertCAUUID:       "",
			crypto.KeyCertKeyUUID:      "",
			crypto.KeyCertStoreName:    "",
			crypto.KeyCertInsecureHost: "",
		}
		var clean string
		var er error
		var conn *sql.DB
		var tlsConfig *tls.Config
		switch scheme {
		case "gorm":
			gU, _ := url.Parse(dsn)
			scheme = gU.Query().Get("driver")
			clean, er = cleanDSN(dsn, expectedVars, "gorm")
		case MySQLDriver:
			clean, er = cleanDSN(dsn, expectedVars, "mysql")
		case SqliteDriver:
			clean, er = cleanDSN(dsn, expectedVars, "url")
		case PostgreDriver:
			clean, er = cleanDSN(dsn, expectedVars, "url")
		default:
			return nil, errors.WithMessage(errors.SqlDAO, "unsupported scheme")
		}
		if er != nil {
			return nil, er
		}
		if scheme != PostgreDriver {
			clean = strings.TrimPrefix(clean, scheme+"://")
		}

		if expectedVars["ssl"] == "true" {
			tlsConfig, er = varsToTLSConfig(expectedVars)
			if er != nil {
				return nil, er
			}
		}

		// Open sql connection pool - special case to force PG to use PGX driver, not PQ
		switch scheme {
		case PostgreDriver:
			pgxConfig, err := pgx.ParseConfig(clean)
			if err != nil {
				return nil, err
			}
			if tlsConfig != nil {
				pgxConfig.TLSConfig = tlsConfig
			}

			conn = stdlib.OpenDB(*pgxConfig)
		case MySQLDriver:
			if tlsConfig != nil {
				configID := uuid.New()
				if err := mysql2.RegisterTLSConfig(configID, &tls.Config{}); err != nil {
					return nil, err
				}
				if !strings.Contains(clean, "?") {
					clean += "?tls=" + configID
				} else {
					clean += "&tls=" + configID
				}
			}
			conn, er = sql.Open(scheme, clean)

			maxIdleConnections, err := strconv.Atoi(expectedVars["maxIdleConnections"])
			if err != nil {
				return nil, err
			}

			maxOpenConnections, err := strconv.Atoi(expectedVars["maxConnections"])
			if err != nil {
				return nil, err
			}

			connMaxLifetime, err := time.ParseDuration(expectedVars["connMaxLifetime"])
			if err != nil {
				return nil, err
			}

			log.Logger(ctx).Info("MySQL Config", zap.Any("maxOpenConns", maxOpenConnections), zap.Any("maxIdleConns", maxIdleConnections), zap.Any("connMaxLifetime", connMaxLifetime))
			conn.SetMaxIdleConns(maxIdleConnections)
			conn.SetMaxOpenConns(maxOpenConnections)
			conn.SetConnMaxLifetime(connMaxLifetime)
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
			LogLevel:                  logger.Info, // Log level
			IgnoreRecordNotFoundError: true,        // Ignore ErrRecordNotFound error for logger
			// ParameterizedQueries:      true,        // Don't include params in the SQL log
			// Colorful: false, // Disable color
		})

		logLevel := logger.Error
		// log2.Logger(ctx).Infof("LogSQL enabled ? %v", runtime.GetBool(runtime.KeyLogSQL))
		if runtime.GetBool(runtime.KeyLogSQL) {
			logLevel = logger.Info
		}

		db, err := gorm.Open(dialect, &gorm.Config{
			TranslateError: true,
			Logger: NewLogger(logger.Config{
				SlowThreshold:             time.Second, // Slow SQL threshold
				LogLevel:                  logLevel,    // Log level
				IgnoreRecordNotFoundError: true,        // Ignore ErrRecordNotFound error for logger
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

		if hooks := expectedVars["hookNames"]; hooks != "" {
			for _, h := range strings.Split(hooks, ",") {
				if reg, ok := hooksRegister[h]; ok {
					reg(db)
				}
			}
		}

		return db, nil
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
