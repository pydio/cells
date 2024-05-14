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
	"strings"

	mysql2 "github.com/go-sql-driver/mysql"
)

type mysqlHelper struct{}

func (m *mysqlHelper) Concat(s ...string) string {
	if len(s) == 1 {
		return s[0]
	}

	return `CONCAT(` + strings.Join(s, ", ") + `)`
}

func (m *mysqlHelper) Hash(s ...string) string {
	return `SHA1(` + m.Concat(s...) + `)`
}

func (m *mysqlHelper) HashParent(name string, s ...string) string {
	pmpath := `SUBSTRING_INDEX(` + m.Concat(s...) + `, '.', level-1)`
	return m.Hash(name, "'__###PARENT_HASH###__'", pmpath)
}

const (
	MySQLDriver = "mysql"
)

func IsMysqlConn(conn any) bool {
	_, ok := conn.(*mysql2.MySQLDriver)
	return ok
}
