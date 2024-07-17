/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package sql

import (
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/storage"
)

var (
	createdTables = map[string]bool{}
	hooksRegister = map[string]func(*gorm.DB){}
)

func init() {
	hooksRegister["cleanTables"] = cleanTablesHook
}

func cleanTablesHook(db *gorm.DB) {
	// try to catch create table names with a callback on all create queries
	_ = db.Callback().Create().After("gorm:after_create").Register("created_tables", func(db *gorm.DB) {
		st := db.Statement
		if st.Table != "" {
			createdTables[st.Table] = true
		}
	})
	// Register a FinisherHook to drop registered tables
	storage.TestFinisherHooks = append(storage.TestFinisherHooks, func() error {
		for t := range createdTables {
			if er := db.Migrator().DropTable(t); er != nil {
				return er
			}
		}
		return nil
	})
}
