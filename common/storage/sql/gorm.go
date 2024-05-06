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

	cellsmysql "github.com/pydio/cells/v4/common/dao/mysql"
	cellspostgres "github.com/pydio/cells/v4/common/dao/pgsql"
	cellssqlite "github.com/pydio/cells/v4/common/dao/sqlite"
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/runtime/tenant"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/storage/sql/dbresolver"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

var (
	Drivers = []string{cellsmysql.Driver, cellspostgres.Driver, cellssqlite.Driver}

	_ storage.Storage = (*gormStorage)(nil)
)

func init() {
	gs := &gormStorage{}
	for _, gormType := range Drivers {
		storage.DefaultURLMux().Register(gormType, gs)
	}
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

func (gs *gormStorage) Register(conn any, tenant string, service string) {

	db := conn.(*sql.DB)

	var dialect gorm.Dialector
	var driver string
	if cellsmysql.IsMysqlConn(db.Driver()) {
		dialect = mysql.New(mysql.Config{
			Conn: db,
		})
		driver = cellsmysql.Driver
	} else if cellspostgres.IsPostGreConn(db.Driver()) {
		dialect = postgres.New(postgres.Config{
			Conn: db,
		})
		driver = cellspostgres.Driver
	} else if cellssqlite.IsSQLiteConn(db.Driver()) {
		dialect = &sqlite.Dialector{
			Conn: db,
		}
		driver = cellssqlite.Driver
	}

	helper, _ := newHelper(driver)

	dialect = &Dialector{
		Dialector: dialect,
		Helper:    helper,
	}

	dialect = &Dialector{
		Dialector: dialect,
		Helper:    helper,
	}

	if gs.once == nil {
		gs.once = &sync.Once{}
	}

	gs.once.Do(func() {
		db, _ := gorm.Open(dialect, &gorm.Config{
			//DisableForeignKeyConstraintWhenMigrating: true,
			FullSaveAssociations: true,
			TranslateError:       true,
			Logger:               logger.Default.LogMode(logger.Info),
		})

		dr := dbresolver.New()

		db.Use(dr)

		gs.db = db
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
		path, err := gs.template.Resolve(ctx)
		if err != nil {
			return true, err
		}
		var ten tenant.Tenant
		runtimecontext.Get(ctx, tenant.ContextKey, &ten)
		if conn, ok := gs.conns[path]; !ok {
			parts := strings.Split(path, "://")
			if len(parts) < 2 {
				return false, nil
			}
			if conn, err := sql.Open(parts[0], strings.Join(parts[1:], "")); err != nil {
				return true, err
			} else {
				gs.Register(conn, ten.ID(), runtimecontext.GetServiceName(ctx))
				gs.conns[path] = conn
			}
		} else {
			gs.Register(conn, ten.ID(), runtimecontext.GetServiceName(ctx))
		}

		*v = gs.db
		return true, nil
	}

	return false, nil
}

func (gs *gormStorage) CloseConns(ctx context.Context) error {
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
