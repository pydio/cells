package sql

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"sync"

	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/runtime/tenant"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/storage/sql/dbresolver"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

var (
	Drivers = []string{MySQLDriver, PostgreDriver, SqliteDriver}

	_ storage.Storage = (*gormStorage)(nil)
)

func init() {
	runtime.Register("system", func(ctx context.Context) {
		var mgr manager.Manager
		if !runtimecontext.Get(ctx, manager.ContextKey, &mgr) {
			return
		}

		gs := &gormStorage{
			once: &sync.Once{},
		}

		for _, gormType := range Drivers {
			mgr.RegisterStorage(gormType, openurl.WithOpener(gs.Open))
		}
	})
}

type gormStorage struct {
	db *gorm.DB
	dr *dbresolver.DBResolver

	once *sync.Once
}

func (gs *gormStorage) Open(ctx context.Context, dsn string) (storage.Storage, error) {

	var hookNames []string
	hookNames, dsn = DetectHooksAndRemoveFromDSN(dsn)

	var ten tenant.Tenant
	runtimecontext.Get(ctx, tenant.ContextKey, &ten)

	parts := strings.Split(dsn, "://")
	if len(parts) < 2 {
		return nil, errors.New("wrong format dsn")
	}
	driverName := parts[0]
	databaseName := strings.Join(parts[1:], "")
	if driverName == PostgreDriver {
		// DSN must still contain the scheme, otherwise expected connection info
		// must be in format "key=value key=value" etc
		databaseName = dsn
	}

	conn, err := sql.Open(driverName, databaseName)
	if err != nil {
		return nil, err
	}

	var dialect gorm.Dialector
	var driver string
	if IsMysqlConn(conn.Driver()) {
		dialect = mysql.New(mysql.Config{
			Conn: conn,
		})
		driver = MySQLDriver
	} else if IsPostGreConn(conn.Driver()) {
		dialect = postgres.New(postgres.Config{
			Conn: conn,
		})
		driver = PostgreDriver
	} else if IsSQLiteConn(conn.Driver()) {
		dialect = &sqlite.Dialector{
			Conn: conn,
		}
		driver = SqliteDriver
	}

	helper, _ := newHelper(driver)

	dialect = &Dialector{
		Dialector: dialect,
		Helper:    helper,
	}

	if gs.once == nil {
		gs.once = &sync.Once{}
	}

	gs.once.Do(func() {
		z := log.Logger(context.Background())
		gdb, _ := gorm.Open(dialect, &gorm.Config{
			//DisableForeignKeyConstraintWhenMigrating: true,
			FullSaveAssociations: true,
			TranslateError:       true,
			Logger:               NewLogger(z, DefaultConfig).LogMode(logger.Info),
		})

		//_ = gdb.Use(tracing.NewPlugin(tracing.WithoutMetrics()))

		dr := dbresolver.New()

		_ = gdb.Use(dr)
		for _, hook := range hookNames {
			if reg, ok := hooksRegister[hook]; ok {
				reg(gdb)
			}
		}

		gs.db = gdb
		gs.dr = dr
	})

	gs.dr.Register(dbresolver.Config{
		Sources: []gorm.Dialector{dialect},
	})

	return gs, nil
}

func (gs *gormStorage) Close(ctx context.Context) (e error) {
	return nil
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
