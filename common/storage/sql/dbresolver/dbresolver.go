package dbresolver

import (
	"fmt"
	"sync"

	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/callbacks"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/schema"

	"github.com/pydio/cells/v5/common/utils/openurl"
)

const (
	Write Operation = "write"
	Read  Operation = "read"
)

type ClauseBuilder interface {
	ClauseBuilders() map[string]clause.ClauseBuilder
}

type DBResolver struct {
	*openurl.Pool[gorm.Dialector]

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
	dialector, err := d.dr.Pool.Get(db.Statement.Context)
	if err != nil {
		panic(err)
	}

	db.Statement.Dialector = dialector

	switch d := dialector.(type) {
	case *mysql.Dialector:
		db.Statement.ConnPool = d.Conn
		db.ConnPool = d.Conn
	case *postgres.Dialector:
		db.Statement.ConnPool = d.Conn
		db.ConnPool = d.Conn
	case *sqlite.Dialector:
		db.Statement.ConnPool = d.Conn
		db.ConnPool = d.Conn
	}

	return dialector.Migrator(db)
}

func (d *DBResolverDialector) DataTypeOf(field *schema.Field) string {
	return ""
}

func (d *DBResolverDialector) DefaultValueOf(field *schema.Field) clause.Expression {
	return nil
}

func (d *DBResolverDialector) BindVarTo(writer clause.Writer, stmt *gorm.Statement, v interface{}) {
	dialector, err := d.dr.Pool.Get(stmt.Context)
	if err != nil {
		panic(err)
	}

	dialector.BindVarTo(writer, stmt, v)

	return
}

func (d *DBResolverDialector) QuoteTo(writer clause.Writer, s string) {
	return
}

func (d *DBResolverDialector) Explain(sql string, vars ...interface{}) string {
	return fmt.Sprintf("%s - %v", sql, vars)
}

func New(pool *openurl.Pool[gorm.Dialector]) *DBResolver {
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
	dialector, err := dr.Pool.Get(stmt.Context)
	if err != nil {
		panic(err)
	}

	stmt.Dialector = dialector

	if cb, ok := dialector.(ClauseBuilder); ok {
		for k, v := range cb.ClauseBuilders() {
			stmt.ClauseBuilders[k] = v
		}
	}

	switch d := dialector.(type) {
	case *mysql.Dialector:
		return d.Conn
	case *postgres.Dialector:
		return d.Conn
	case *sqlite.Dialector:
		return d.Conn
	}

	return nil
}

func (dr *DBResolver) convertToConnPool(dialectors []gorm.Dialector) (connPools []gorm.ConnPool, err error) {
	config := *dr.DB.Config
	for _, dialector := range dialectors {
		if db, err := gorm.Open(dialector, &config); err == nil {
			connPool := db.Config.ConnPool
			if preparedStmtDB, ok := connPool.(*gorm.PreparedStmtDB); ok {
				connPool = preparedStmtDB.ConnPool
			}

			dr.prepareStmtStore[connPool] = &gorm.PreparedStmtDB{
				ConnPool:    db.Config.ConnPool,
				Stmts:       map[string]*gorm.Stmt{},
				Mux:         &sync.RWMutex{},
				PreparedSQL: make([]string, 0, 100),
			}

			connPools = append(connPools, connPool)
		} else {
			return nil, err
		}
	}

	return connPools, err
}
