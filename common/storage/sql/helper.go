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
	"fmt"

	cellsmysql "github.com/pydio/cells/v4/common/dao/mysql"
	cellspostgres "github.com/pydio/cells/v4/common/dao/pgsql"
	cellssqlite "github.com/pydio/cells/v4/common/dao/sqlite"
)

type Helper interface {
	Concat(...string) string
	Hash(...string) string
	HashParent(string, ...string) string
}

func newHelper(d string) (Helper, error) {
	switch d {
	case cellsmysql.Driver:
		return new(mysqlHelper), nil
	case cellspostgres.Driver:
		return new(postgresHelper), nil
	case cellssqlite.Driver:
		return new(sqliteHelper), nil
	default:
		return nil, fmt.Errorf("wrong driver")
	}
}
