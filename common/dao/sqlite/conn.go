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

package sqlite

import (
	"context"
	"database/sql"
	"net/url"

	"github.com/pydio/cells/v4/common/conn"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/std"
)

func init() {
	conn.DefaultURLMux().Register("sqlite", &sqliteOpener{})
	conn.RegisterConnProvider("sqlite", newSQLiteConn)
}

type sqliteOpener struct{}

func (o *sqliteOpener) OpenURL(ctx context.Context, u *url.URL) (conn.Conn, error) {
	conf := configx.New()
	conf.Val("dsn").Set(u.Path)

	return newSQLiteConn(ctx, conf)
}

func newSQLiteConn(ctx context.Context, c configx.Values) (conn.Conn, error) {
	dsn := c.Val("dsn").String()

	conn, err := sql.Open("sqlite3", dsn)
	if err != nil {
		return nil, err
	}

	ch := make(chan map[string]interface{})
	return &sqlConn{
		std.Randkey(16),
		ch,
		conn,
	}, nil
}

type sqlConn struct {
	id string
	ch chan (map[string]interface{})
	*sql.DB
}

func (c *sqlConn) Name() string {
	return "mysql"
}

func (c *sqlConn) ID() string {
	return c.id
}

func (c *sqlConn) Metadata() map[string]string {
	return map[string]string{}
}

func (c *sqlConn) As(i interface{}) bool {
	if vv, ok := i.(**sql.DB); ok {
		*vv = c.DB
		return true
	} else if sw, ok := i.(*registry.StatusReporter); ok {
		*sw = c
		return true
	}

	return false
}

func (c *sqlConn) Addr() string {
	return "mysql"
}

func (c *sqlConn) Stats() map[string]interface{} {
	stats := c.DB.Stats()
	return map[string]interface{}{
		"MaxOpenConnections": stats.MaxOpenConnections,
		"OpenConnections":    stats.OpenConnections,
		"InUse":              stats.InUse,
		"Idle":               stats.Idle,
		"WaitCount":          stats.WaitCount,
		"WaitDuration":       stats.WaitDuration,
		"MaxIdleClosed":      stats.MaxIdleClosed,
		"MaxIdleTimeClosed":  stats.MaxIdleTimeClosed,
		"MaxLifetimeClosed":  stats.MaxLifetimeClosed,
	}
}

func (c *sqlConn) WatchStatus() (registry.StatusWatcher, error) {
	return util.NewChanStatusWatcher(c, c.ch), nil
}
