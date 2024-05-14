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
	"net/url"
	"strings"

	"github.com/go-sql-driver/mysql"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/storage"
)

var (
	createdTables = map[string]bool{}
	hooksRegister = map[string]func(*gorm.DB){}
	cleaners      []func(*gorm.DB) error
)

// DetectHooksAndRemoveFromDSN detects a hookNames=hook1,hook2,hook3 query parameter
// and remove it from the RawQuery
func DetectHooksAndRemoveFromDSN(dsn string) ([]string, string) {
	// Try to use standard URL
	if u, er := url.Parse(dsn); er == nil {
		if hh, ok := storage.DetectHooksAndRemoveFromURL(u); ok {
			return hh, u.String()
		} else {
			return nil, dsn
		}
	}
	// Try to use mysql
	if cfg, er := mysql.ParseDSN(dsn); er == nil {
		if param, ok := cfg.Params["hookNames"]; ok {
			hookNames := strings.Split(param, ",")
			delete(cfg.Params, "hookNames")
			return hookNames, cfg.FormatDSN()
		} else {
			return nil, dsn
		}
	}
	return nil, dsn
}

func init() {
	hooksRegister["cleanTables"] = func(db *gorm.DB) {
		_ = db.Callback().Create().After("gorm:after_create").Register("created_tables", hookCreate)
		cleaners = append(cleaners, func(d *gorm.DB) error {
			for t := range createdTables {
				if er := d.Migrator().DropTable(t); er != nil {
					return er
				}
			}
			return nil
		})
	}
}

func hookCreate(db *gorm.DB) {
	st := db.Statement
	if st.Table != "" {
		createdTables[st.Table] = true
	}
}
