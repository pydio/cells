package dbresolver

import (
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// Operation specifies dbresolver mode
type Operation string

const (
	writeName = "cells:db_resolver:write"
	readName  = "cells:db_resolver:read"
)

// ModifyStatement modify operation mode
func (op Operation) ModifyStatement(stmt *gorm.Statement) {
	var optName string
	if op == Write {
		optName = writeName
		stmt.Settings.Delete(readName)
	} else if op == Read {
		optName = readName
		stmt.Settings.Delete(writeName)
	}

	if optName != "" {
		stmt.Settings.Store(optName, struct{}{})
		if fc := stmt.DB.Callback().Query().Get("cells:db_resolver"); fc != nil {
			fc(stmt.DB)
		}
	}
}

// Build implements clause.Expression interface
func (op Operation) Build(clause.Builder) {
}

// UseTenant specifies configuration
func UseTenant(str string) clause.Expression {
	return usingTenant{Use: str}
}

const (
	tenantName = "cells:db_resolver:tenant"
)

type usingTenant struct {
	Use string
}

// ModifyStatement modify operation mode
func (u usingTenant) ModifyStatement(stmt *gorm.Statement) {
	stmt.Clauses[tenantName] = clause.Clause{Expression: u}
	if fc := stmt.DB.Callback().Query().Get("cells:db_resolver"); fc != nil {
		fc(stmt.DB)
	}
}

// Build implements clause.Expression interface
func (u usingTenant) Build(clause.Builder) {
}

// UseService specifies configuration
func UseService(str string) clause.Expression {
	return usingService{Use: str}
}

const (
	serviceName = "cells:db_resolver:service"
)

type usingService struct {
	Use string
}

// ModifyStatement modify operation mode
func (u usingService) ModifyStatement(stmt *gorm.Statement) {
	stmt.Clauses[serviceName] = clause.Clause{Expression: u}
	if fc := stmt.DB.Callback().Query().Get("cells:db_resolver"); fc != nil {
		fc(stmt.DB)
	}
}

// Build implements clause.Expression interface
func (u usingService) Build(clause.Builder) {
}
