/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package sqlite

import (
	"context"
	"database/sql"
	"regexp"

	sqlite3 "github.com/mattn/go-sqlite3"

	"github.com/pydio/cells/v4/common/dao"
	commonsql "github.com/pydio/cells/v4/common/sql"
)

const (
	Driver       = "sqlite3-extended"
	SharedMemDSN = "file::memory:?mode=memory&cache=shared"
)

func init() {
	dao.RegisterDAODriver(Driver, commonsql.NewDAO, func(ctx context.Context, driver, dsn string) dao.ConnDriver {
		return &conn{}
	})

	regex := func(s, re string) (bool, error) {
		return regexp.MatchString(re, s)
	}
	sql.Register(Driver,
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

	//sql.Register(Driver,
	//	&sqlite3.SQLiteDriver{
	//		ConnectHook: func(conn *sqlite3.SQLiteConn) error {
	//			// Define the `concat` function, since we use this elsewhere.
	//			err := conn.RegisterFunc(
	//				"CONCAT",
	//				func(args ...string) (string, error) {
	//					return strings.Join(args, ""), nil
	//				},
	//				false,
	//			)
	//			return err
	//		},
	//	})

}
