package dbresolver

import (
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/plugin/dbresolver"
)

// Operation specifies dbresolver mode
type Operation string

const (
	writeName = "cells:db_resolver:write"
	readName  = "cells:db_resolver:read"
)

var (
	Use = dbresolver.Use
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
