package storage

import (
	"gorm.io/gorm/logger"
	"sync"

	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	cellsmysql "github.com/pydio/cells/v4/common/dao/mysql"
	cellspostgres "github.com/pydio/cells/v4/common/dao/pgsql"
	cellssqlite "github.com/pydio/cells/v4/common/dao/sqlite"
	"github.com/pydio/cells/v4/common/storage/dbresolver"
)

var (
	gormTypes = []string{cellsmysql.Driver, cellspostgres.Driver, cellssqlite.Driver}

	_ Provider = (*gormStorageProvider)(nil)
	_ Storage  = (*gormStorage)(nil)
)

func init() {
	providers = append(providers, &gormStorageProvider{})
}

type gormStorageProvider struct{}

func (*gormStorageProvider) Provide(driver string) ProviderFunc {
	for _, t := range gormTypes {
		if t == driver {
			return newGormStorage
		}
	}

	return nil
}

type gormStorage struct {
	db *gorm.DB
	dr *dbresolver.DBResolver

	once *sync.Once
}

func newGormStorage(driver string, dsn string) Storage {
	var dialect gorm.Dialector
	switch driver {
	case cellssqlite.Driver:
		dialect = &sqlite.Dialector{
			DriverName: driver,
			DSN:        dsn,
		}
	case cellsmysql.Driver:
		dialect = mysql.Open(dsn)
	case cellspostgres.Driver:
		dialect = postgres.Open(dsn)
	}

	helper, _ := newHelper(driver)
	dialect = &Dialector{
		Dialector: dialect,
		Helper:    helper,
	}

	db, _ := gorm.Open(dialect, &gorm.Config{
		//DisableForeignKeyConstraintWhenMigrating: true,
		FullSaveAssociations: true,
		TranslateError:       true,
		Logger:               logger.Default.LogMode(logger.Info),
	})

	dr := dbresolver.New()

	db.Use(dr)

	return &gormStorage{
		db: db,
		dr: dr,
	}
}

func (gs *gormStorage) Register(driver string, dsn string, tenant string, service string) {

	var dialect gorm.Dialector
	switch driver {
	case cellssqlite.Driver:
		dialect = &sqlite.Dialector{
			DriverName: driver,
			DSN:        dsn,
		}
	case cellsmysql.Driver:
		dialect = mysql.Open(dsn)
	case cellspostgres.Driver:
		dialect = postgres.Open(dsn)
	}

	helper, _ := newHelper(driver)

	dialect = &Dialector{
		Dialector: dialect,
		Helper:    helper,
	}

	gs.dr.Register(dbresolver.Config{
		Sources: []gorm.Dialector{dialect},
		Tenant:  tenant,
		Service: service,
	})
}

func (gs *gormStorage) Get(out interface{}) bool {
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
