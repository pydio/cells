/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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
	"database/sql"
	"regexp"
	"strings"

	sqlite3 "github.com/mattn/go-sqlite3"
)

const (
	SqliteDriver = "sqlite3-extended"
	SharedMemDSN = "file::memory:?mode=memory&cache=shared"
)

func IsSQLiteConn(conn any) bool {
	_, ok := conn.(*sqlite3.SQLiteDriver)

	return ok
}

func init() {

	regex := func(s, re string) (bool, error) {
		return regexp.MatchString(re, s)
	}
	sql.Register(SqliteDriver,
		&sqlite3.SQLiteDriver{
			ConnectHook: func(conn *sqlite3.SQLiteConn) error {
				if err := conn.RegisterFunc("regexp_like", regex, true); err != nil {
					return err
				}
				if err := conn.RegisterFunc("REGEXP_LIKE", regex, true); err != nil {
					return err
				}

				return nil
			},
		})

}

type sqliteHelper struct{}

func (*sqliteHelper) Concat(s ...string) string {
	return strings.Join(s, " || ")
}

func (*sqliteHelper) Hash(s ...string) string {
	return ""
}

func (*sqliteHelper) HashParent(name string, s ...string) string {
	return ""
}
