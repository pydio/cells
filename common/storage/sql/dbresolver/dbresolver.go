package dbresolver

import (
	"database/sql"
	"sync"

	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/callbacks"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/schema"

	"github.com/pydio/cells/v4/common/utils/openurl"
)

const (
	Write Operation = "write"
	Read  Operation = "read"
)

type DBResolver struct {
	*openurl.Pool[*sql.DB]

	*gorm.DB
	global           *resolver
	prepareStmtStore map[gorm.ConnPool]*gorm.PreparedStmtDB
	compileCallbacks []func(gorm.ConnPool) error

	once *sync.Once
}

type DBResolverDialector struct {
	dr *DBResolver
}

func (d *DBResolverDialector) Name() string {
	return ""
}

func (d *DBResolverDialector) Initialize(db *gorm.DB) error {
	callbacks.RegisterDefaultCallbacks(db, &callbacks.Config{
		CreateClauses:        []string{"INSERT", "VALUES", "ON CONFLICT", "RETURNING"},
		UpdateClauses:        []string{"UPDATE", "SET", "WHERE", "RETURNING"},
		DeleteClauses:        []string{"DELETE", "FROM", "WHERE", "RETURNING"},
		LastInsertIDReversed: true,
	})

	return nil
}

func (d *DBResolverDialector) Migrator(db *gorm.DB) gorm.Migrator {
	conn, err := d.dr.Pool.Get(db.Statement.Context)
	if err != nil {
		panic(err)
	}

	var dialect gorm.Dialector
	// var driver string
	if IsMysqlConn(conn.Driver()) {
		dialect = mysql.New(mysql.Config{
			Conn: conn,
		})
		// driver = MySQLDriver
	} else if IsPostGreConn(conn.Driver()) {
		dialect = postgres.New(postgres.Config{
			Conn: conn,
		})
		// driver = PostgreDriver
	} else if IsSQLiteConn(conn.Driver()) {
		dialect = &sqlite.Dialector{
			Conn: conn,
		}
		// 	driver = SqliteDriver
	}

	db.Statement.Dialector = dialect

	return db.Statement.Migrator()
}

func (d *DBResolverDialector) DataTypeOf(field *schema.Field) string {
	return ""
}

func (d *DBResolverDialector) DefaultValueOf(field *schema.Field) clause.Expression {
	return nil
}

func (d *DBResolverDialector) BindVarTo(writer clause.Writer, stmt *gorm.Statement, v interface{}) {
	return
}

func (d *DBResolverDialector) QuoteTo(writer clause.Writer, s string) {
	return
}

func (d *DBResolverDialector) Explain(sql string, vars ...interface{}) string {
	return "Explaining"
}

func New(pool *openurl.Pool[*sql.DB]) *DBResolver {
	return &DBResolver{
		Pool: pool,
	}
}

func (dr *DBResolver) Dialector() gorm.Dialector {
	return &DBResolverDialector{dr}
}

func (dr *DBResolver) Name() string {
	return "cells:db_resolver"
}

func (dr *DBResolver) Initialize(db *gorm.DB) error {
	dr.DB = db

	if dr.once == nil {
		dr.once = &sync.Once{}
	}

	var err error

	dr.once.Do(func() {
		dr.registerCallbacks(db)
	})

	return err
}

func (dr *DBResolver) resolve(stmt *gorm.Statement, op Operation) gorm.ConnPool {

	conn, err := dr.Pool.Get(stmt.Context)
	if err != nil {
		panic(err)
	}

	return conn
}
