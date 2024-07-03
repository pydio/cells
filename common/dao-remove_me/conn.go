//go:build exclude
// +build exclude

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
	"context"
	"fmt"
	"sync"
)

var (
	conns = make(map[string]*conn)
	lock  = new(sync.RWMutex)
)

type conn struct {
	d      ConnDriver
	weight int
}

type Conn interface{}

type ConnDriver interface {
	Open(ctx context.Context, dsn string) (Conn, error)
	GetConn(ctx context.Context) (Conn, error)
	SetMaxConnectionsForWeight(int)
}

type closer interface {
	Close(ctx context.Context) error
}

type closerNoCtx interface {
	Close() error
}

type disconnecter interface {
	Disconnect(ctx context.Context) error
}

func NewConn(ctx context.Context, d string, dsn string) (Conn, error) {
	return nil, fmt.Errorf("deprecated")
}

func closeConn(ctx context.Context, conn Conn) error {
	lock.Lock()
	defer lock.Unlock()

	for k, c := range conns {
		if co, e := c.d.GetConn(ctx); e == nil && co == conn {
			if cl, ok := conn.(closer); ok {
				if err := cl.Close(ctx); err != nil {
					return err
				}
			} else if di, ok := conn.(closerNoCtx); ok {
				if err := di.Close(); err != nil {
					return err
				}
			} else if di, ok := conn.(disconnecter); ok {
				if err := di.Disconnect(ctx); err != nil {
					return err
				}
			}
			delete(conns, k)
		}
	}

	return nil
}
