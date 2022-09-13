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

package boltdb

import (
	"context"
	"github.com/pydio/cells/v4/common/conn"
	"github.com/pydio/cells/v4/common/utils/configx"
	bolt "go.etcd.io/bbolt"
)

func init() {
	conn.RegisterConnProvider("boltdb", newBoltDBConn)
}

func newBoltDBConn(ctx context.Context, c configx.Values) (conn.Conn, error) {
	file := c.Val("dsn").String()

	return newBoltDB(ctx, file, bolt.DefaultOptions)
}

func newBoltDB(ctx context.Context, file string, opt *bolt.Options) (conn.Conn, error) {
	db, err := bolt.Open(file, 0600, opt)
	if err != nil {
		return nil, err
	}

	return &boltdbConn{
		DB: db,
	}, nil
}

type boltdbConn struct {
	*bolt.DB
}

func (c *boltdbConn) Name() string {
	return ""
}

func (c *boltdbConn) ID() string {
	return ""
}

func (c *boltdbConn) Metadata() map[string]string {
	return map[string]string{}
}

func (c *boltdbConn) As(i interface{}) bool {
	if vv, ok := i.(**bolt.DB); ok {
		*vv = c.DB
		return true
	}
	return false
}

func (c *boltdbConn) Addr() string {
	return "bolt"
}

func (c *boltdbConn) Ping() error {
	return nil
}

func (c *boltdbConn) Stats() map[string]interface{} {
	// TODO - DB Stats
	return nil
}

func (c *boltdbConn) Close() error {
	return c.DB.Close()
}
