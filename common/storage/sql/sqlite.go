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
	"database/sql/driver"
	"regexp"
	"strings"

	sqlite "github.com/glebarez/go-sqlite"

	_ "github.com/glebarez/sqlite"
)

const (
	SqliteDriver = "sqlite"
	SharedMemDSN = "file::memory:?mode=memory&cache=shared"
)

func init() {

	regex := func(s, re string) (bool, error) {
		ok, err := regexp.MatchString(re, s)
		return ok, err
	}
	_ = regex
	scalar := func(ctx *sqlite.FunctionContext, args []driver.Value) (driver.Value, error) {
		s := args[0].(string)
		re := args[1].(string)
		ok, err := regexp.MatchString(re, s)
		return ok, err
	}

	e := sqlite.RegisterScalarFunction("regexp_like", 2, scalar)
	if e != nil {
		panic(e)
	}
	e = sqlite.RegisterScalarFunction("REGEXP_LIKE", 2, scalar)
	if e != nil {
		panic(e)
	}
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
