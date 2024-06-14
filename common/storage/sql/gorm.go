package sql

import (
	"context"
	"database/sql"
	"errors"
	"net/url"
	"strings"
	"time"

	mysql2 "github.com/go-sql-driver/mysql"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"

	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/controller"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/storage/sql/dbresolver"
	"github.com/pydio/cells/v4/common/telemetry/log"
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
		var prefix string
		if dbresolver.IsMysqlConn(conn.Driver()) {
			dialect = mysql.New(mysql.Config{
				Conn: conn,
			})
			config, err := mysql2.ParseDSN(dsn)
			if err != nil {
				return nil, err
			}
			if p, ok := config.Params["prefix"]; ok {
				prefix = p
			}
			delete(config.Params, "prefix")

			dsn = config.FormatDSN()
		} else if dbresolver.IsPostGreConn(conn.Driver()) {
			dialect = postgres.New(postgres.Config{
				Conn: conn,
			})

			u, err := url.Parse(dsn)
			if err != nil {
				return nil, err
			}

			q := u.Query()
			if q.Has("prefix") {
				prefix = q.Get("prefix")
			}
		} else if dbresolver.IsSQLiteConn(conn.Driver()) {
			dialect = &sqlite.Dialector{
				Conn: conn,
			}

			u, err := url.Parse(dsn)
			if err != nil {
				return nil, err
			}

			q := u.Query()
			if q.Has("prefix") {
				prefix = q.Get("prefix")
			}
		}

		db, err := gorm.Open(dialect, &gorm.Config{
			Logger: &logWrapper{log.Logger(ctx)},
			NamingStrategy: &schema.NamingStrategy{
				TablePrefix: prefix,
			},
		})
		if err != nil {
			return nil, err
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

type logWrapper struct {
	log.ZapLogger
}

func (l logWrapper) LogMode(level logger.LogLevel) logger.Interface {
	return &logWrapper{l.ZapLogger.WithOptions(zap.IncreaseLevel(zap.LevelEnablerFunc(func(zapLevel zapcore.Level) bool {
		return int(zapLevel) > int(level)
	})))}
}

func (l logWrapper) Info(ctx context.Context, s string, i ...interface{}) {
	l.ZapLogger.Infof(s, i...)
}

func (l logWrapper) Warn(ctx context.Context, s string, i ...interface{}) {
	l.ZapLogger.Warnf(s, i...)
}

func (l logWrapper) Error(ctx context.Context, s string, i ...interface{}) {
	l.ZapLogger.Errorf(s, i...)
}

func (l logWrapper) Trace(ctx context.Context, begin time.Time, fc func() (sql string, rowsAffected int64), err error) {
	// TODO
}
