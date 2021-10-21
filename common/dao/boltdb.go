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

package dao

import (
	bolt "github.com/etcd-io/bbolt"
)

type boltdb struct {
	conn *bolt.DB
}

func (b *boltdb) Open(dsn string) (Conn, error) {
	db, err := bolt.Open(dsn, 0600, nil)
	if err != nil {
		return nil, err
	}

	b.conn = db

	return db, nil
}

func (b *boltdb) GetConn() Conn {
	return b.conn
}

func (b *boltdb) SetMaxConnectionsForWeight(num int) {
	// Not implemented
}
