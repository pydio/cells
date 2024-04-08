package sql

import (
	"context"
	"database/sql"
	"net/url"
	"strings"
	"sync"
	"text/template"

	"github.com/pborman/uuid"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	cellsmysql "github.com/pydio/cells/v4/common/dao/mysql"
	cellspostgres "github.com/pydio/cells/v4/common/dao/pgsql"
	cellssqlite "github.com/pydio/cells/v4/common/dao/sqlite"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/storage/dbresolver"
)

var (
	gormTypes = []string{cellsmysql.Driver, cellspostgres.Driver, cellssqlite.Driver}

	_ storage.Storage = (*gormStorage)(nil)
)

func init() {
	gs := &gormStorage{}
	for _, gormType := range gormTypes {
		storage.DefaultURLMux().Register(gormType, gs)
	}
}

type gormStorage struct {
	template *template.Template
	db       *gorm.DB
	dr       *dbresolver.DBResolver

	once *sync.Once
}

func (gs *gormStorage) OpenURL(ctx context.Context, u *url.URL) (storage.Storage, error) {
	t, err := template.New("gormStorage").Parse(u.String())
	if err != nil {
		return nil, err
	}

	gs.template = t

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
	for _, gormType := range gormTypes {
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

func (gs *gormStorage) Get(ctx context.Context, out interface{}) bool {

	if v, ok := out.(**gorm.DB); ok {
		*v = gs.db
		return true
	}

	return false
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
