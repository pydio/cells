package sql

import (
	"context"
	"database/sql"
	"strings"
	"sync"

	"github.com/pborman/uuid"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/plugin/opentelemetry/tracing"

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

		gs := &gormStorage{}
		for _, gormType := range Drivers {
			mgr.RegisterStorage(gormType, gs)
		}
	})
}

type gormStorage struct {
	template openurl.Template
	db       *gorm.DB
	dr       *dbresolver.DBResolver

	conns map[string]*sql.DB

	once *sync.Once
}

func (gs *gormStorage) OpenURL(ctx context.Context, dsn string) (storage.Storage, error) {
	t, err := openurl.URLTemplate(dsn)
	if err != nil {
		return nil, err
	}

	gs.template = t
	gs.conns = make(map[string]*sql.DB)

	return gs, nil
}

/*
func (gs *gormStorage) Provides(conn any) bool {
	switch conn.(type) {
	case *sql.DB:
	default:
		return false
	}

	return true
}

func (gs *gormStorage) GetConn(str string) (storage.Conn, error) {
	for _, gormType := range Drivers {
		if strings.HasPrefix(str, gormType+"://") {
			db, err := sql.Open(gormType, strings.TrimPrefix(str, gormType+"://"))
			if err != nil {
				return nil, err
			}

			return (*gormItem)(db), nil
		}
	}

	return nil, nil
}

*/

func (gs *gormStorage) Register(conn any, tenant string, service string, hooks ...string) {

	db := conn.(*sql.DB)

	var dialect gorm.Dialector
	var driver string
	if IsMysqlConn(db.Driver()) {
		dialect = mysql.New(mysql.Config{
			Conn: db,
		})
		driver = MySQLDriver
	} else if IsPostGreConn(db.Driver()) {
		dialect = postgres.New(postgres.Config{
			Conn: db,
		})
		driver = PostgreDriver
	} else if IsSQLiteConn(db.Driver()) {
		dialect = &sqlite.Dialector{
			Conn: db,
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

		_ = gdb.Use(tracing.NewPlugin(tracing.WithoutMetrics()))

		dr := dbresolver.New()

		_ = gdb.Use(dr)
		for _, hook := range hooks {
			if reg, ok := hooksRegister[hook]; ok {
				reg(gdb)
			}
		}

		gs.db = gdb
		gs.dr = dr
	})

	gs.dr.Register(dbresolver.Config{
		Sources: []gorm.Dialector{dialect},
		Tenant:  tenant,
		Service: service,
	})
}

func (gs *gormStorage) Get(ctx context.Context, out interface{}) (bool, error) {
	if v, ok := out.(**gorm.DB); ok {
		dsn, err := gs.template.Resolve(ctx) // cannot use ResolveURL here as it may be a mysql DSN (invalid URL)
		if err != nil {
			return true, err
		}

		var hookNames []string
		hookNames, dsn = DetectHooksAndRemoveFromDSN(dsn)

		var ten tenant.Tenant
		runtimecontext.Get(ctx, tenant.ContextKey, &ten)
		// Todo : why the two levels of register (.conns[dsn] and then Register below) ?
		// Could the Dbresolver directly handle the dsn, including ServiceName & TenantID ?
		if conn, ok := gs.conns[dsn]; !ok {
			parts := strings.Split(dsn, "://")
			if len(parts) < 2 {
				return false, nil
			}
			driverName := parts[0]
			databaseName := strings.Join(parts[1:], "")
			if driverName == PostgreDriver {
				// DSN must still contain the scheme, otherwise expected connection info
				// must be in format "key=value key=value" etc
				databaseName = dsn
			}
			if conn, err := sql.Open(driverName, databaseName); err != nil {
				return true, err
			} else {
				gs.Register(conn, ten.ID(), runtimecontext.GetServiceName(ctx), hookNames...)
				gs.conns[dsn] = conn
			}
		} else {
			gs.Register(conn, ten.ID(), runtimecontext.GetServiceName(ctx), hookNames...)
		}

		*v = gs.db
		return true, nil
	}

	return false, nil
}

func (gs *gormStorage) CloseConns(ctx context.Context, clean ...bool) (e error) {
	for _, db := range gs.conns {
		if len(clean) > 0 && len(cleaners) > 0 {
			for _, c := range cleaners {
				if er := c(gs.db); er != nil {
					return er
				}
			}
		}
		if e = db.Close(); e != nil {
			return e
		}
	}
	return
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

type gormItem sql.DB

func (i *gormItem) Name() string {
	return "gorm"
}

func (i *gormItem) ID() string {
	return uuid.New()
}

func (i *gormItem) Metadata() map[string]string {
	return map[string]string{}
}

func (i *gormItem) As(i2 interface{}) bool {
	return false
}

func (i *gormItem) Driver() string {
	return "gorm"
}

func (i *gormItem) DSN() string {
	return "TODO"
}
