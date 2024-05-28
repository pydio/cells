package dbresolver

import (
	"strings"

	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/tenant"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

func (dr *DBResolver) registerCallbacks(db *gorm.DB) {
	dr.Callback().Create().Before("*").Register("cells:db_resolver_context", dr.checkContext)
	dr.Callback().Query().Before("*").Register("cells:db_resolver_context", dr.checkContext)
	dr.Callback().Update().Before("*").Register("cells:db_resolver_context", dr.checkContext)
	dr.Callback().Delete().Before("*").Register("cells:db_resolver_context", dr.checkContext)
	dr.Callback().Row().Before("*").Register("cells:db_resolver_context", dr.checkContext)
	dr.Callback().Raw().Before("*").Register("cells:db_resolver_context", dr.checkContext)

	dr.Callback().Create().Before("*").Register("cells:db_resolver", dr.switchSource)
	dr.Callback().Query().Before("*").Register("cells:db_resolver", dr.switchReplica)
	dr.Callback().Update().Before("*").Register("cells:db_resolver", dr.switchSource)
	dr.Callback().Delete().Before("*").Register("cells:db_resolver", dr.switchSource)
	dr.Callback().Row().Before("*").Register("cells:db_resolver", dr.switchReplica)
	dr.Callback().Raw().Before("*").Register("cells:db_resolver", dr.switchGuess)
}

func (dr *DBResolver) checkContext(db *gorm.DB) {
	var t tenant.Tenant
	if propagator.Get(db.Statement.Context, tenant.ContextKey, &t) {
		db.Clauses(UseTenant(t.ID()))
	}

	if service := runtime.GetServiceName(db.Statement.Context); service != "" {
		db.Clauses(UseService(service))
	}
}

func (dr *DBResolver) switchSource(db *gorm.DB) {
	if !isTransaction(db.Statement.ConnPool) {
		db.Statement.ConnPool = dr.resolve(db.Statement, Write)
	}
}

func (dr *DBResolver) switchReplica(db *gorm.DB) {
	if !isTransaction(db.Statement.ConnPool) {
		if rawSQL := db.Statement.SQL.String(); len(rawSQL) > 0 {
			dr.switchGuess(db)
		} else {
			_, locking := db.Statement.Clauses["FOR"]
			if _, ok := db.Statement.Settings.Load(writeName); ok || locking {
				db.Statement.ConnPool = dr.resolve(db.Statement, Write)
			} else {
				db.Statement.ConnPool = dr.resolve(db.Statement, Read)
			}
		}
	}
}

func (dr *DBResolver) switchGuess(db *gorm.DB) {
	if !isTransaction(db.Statement.ConnPool) {
		if _, ok := db.Statement.Settings.Load(writeName); ok {
			db.Statement.ConnPool = dr.resolve(db.Statement, Write)
		} else if _, ok := db.Statement.Settings.Load(readName); ok {
			db.Statement.ConnPool = dr.resolve(db.Statement, Read)
		} else if rawSQL := strings.TrimSpace(db.Statement.SQL.String()); len(rawSQL) > 10 && strings.EqualFold(rawSQL[:6], "select") && !strings.EqualFold(rawSQL[len(rawSQL)-10:], "for update") {
			db.Statement.ConnPool = dr.resolve(db.Statement, Read)
		} else {
			db.Statement.ConnPool = dr.resolve(db.Statement, Write)
		}
	}
}

func isTransaction(connPool gorm.ConnPool) bool {
	_, ok := connPool.(gorm.TxCommitter)
	return ok
}
