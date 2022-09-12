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

package redis

import (
	"context"
	"net"

	"github.com/go-redis/redis/v8"

	"github.com/pydio/cells/v4/common/conn"
	"github.com/pydio/cells/v4/common/crypto"
	"github.com/pydio/cells/v4/common/utils/configx"
)

func init() {
	conn.RegisterConnProvider("redis", newRedisConn)
}

func newRedisConn(ctx context.Context, c configx.Values) (conn.Conn, error) {
	server := c.Val("server").String()
	port := c.Val("port").String()
	db := c.Val("database").Int()
	user := c.Val("user").String()
	password := c.Val("password").String()

	tlsConfig, err := crypto.TLSConfig(c.Val("tls"))
	if err != nil {
		return nil, err
	}

	cli := redis.NewClient(&redis.Options{
		Addr:      net.JoinHostPort(server, port),
		Username:  user,
		Password:  password,
		DB:        db,
		TLSConfig: tlsConfig,
	})

	return &redisConn{
		Client: cli,
	}, nil
}

type redisConn struct {
	*redis.Client
}

func (c *redisConn) Name() string {
	return ""
}

func (c *redisConn) ID() string {
	return ""
}

func (c *redisConn) Metadata() map[string]string {
	return map[string]string{}
}

func (c *redisConn) As(i interface{}) bool {
	if vv, ok := i.(**redis.Client); ok {
		*vv = c.Client
		return true
	}
	return false
}

func (c *redisConn) Addr() string {
	return "redis"
}

func (c *redisConn) Ping() error {
	if _, err := c.Client.Ping(context.TODO()).Result(); err != nil {
		return err
	}
	return nil
}

func (c *redisConn) Stats() map[string]interface{} {
	return nil
}

func (c *redisConn) Close() error {
	return nil
}
