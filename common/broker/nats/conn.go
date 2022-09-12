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

package nats

import (
	"context"
	"errors"
	"fmt"

	"github.com/nats-io/nats.go"

	"github.com/pydio/cells/v4/common/conn"
	"github.com/pydio/cells/v4/common/crypto"
	"github.com/pydio/cells/v4/common/utils/configx"
)

func init() {
	conn.RegisterConnProvider("nats", newNatsConn)
}

func newNatsConn(ctx context.Context, c configx.Values) (conn.Conn, error) {
	server := c.Val("server").String()
	port := c.Val("port").Int()
	db := c.Val("database").String()

	dsn := fmt.Sprintf("%s:%d/%s", server, port, db)

	tlsConfig, err := crypto.TLSConfig(c.Val("tls"))
	if err != nil {
		return nil, err
	}

	var opts []nats.Option
	if tlsConfig != nil {
		opts = append(opts, nats.Secure(tlsConfig))
	}

	conn, err := nats.Connect(dsn, opts...)
	if err != nil {
		return nil, err
	}

	return &natsConn{conn}, nil
}

type natsConn struct {
	*nats.Conn
}

func (c *natsConn) Name() string {
	return ""
}

func (c *natsConn) ID() string {
	return ""
}

func (c *natsConn) Metadata() map[string]string {
	return map[string]string{}
}

func (c *natsConn) As(i interface{}) bool {
	if vv, ok := i.(**nats.Conn); ok {
		*vv = c.Conn
		return true
	}
	return false
}

func (c *natsConn) Addr() string {
	return "nats"
}

func (c *natsConn) Ping() error {
	if !c.Conn.IsConnected() {
		return errors.New("not connected")
	}

	return nil
}

func (c *natsConn) Stats() map[string]interface{} {
	return nil
}

func (c *natsConn) Close() error {
	return nil
}
