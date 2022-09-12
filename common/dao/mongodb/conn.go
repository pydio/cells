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

package mongodb

import (
	"context"
	"fmt"
	"net/url"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/pydio/cells/v4/common/conn"
	"github.com/pydio/cells/v4/common/crypto"
	"github.com/pydio/cells/v4/common/utils/configx"
)

func init() {
	conn.RegisterConnProvider("mongodb", newMongoConn)
}

func newMongoConn(ctx context.Context, c configx.Values) (conn.Conn, error) {
	server := c.Val("server").String()
	port := c.Val("port").Int()
	db := c.Val("database").String()

	auth, err := conn.AddUser(c.Val("auth"))
	if err != nil {
		return nil, err
	} else if auth != "" {
		auth = auth + "@"
	}

	dsn := fmt.Sprintf("mongodb://%s%s:%d/%s", auth, server, port, db)

	opts := options.Client().ApplyURI(dsn)

	tls, err := conn.AddTLS(c.Val("tls"))
	if err != nil {
		return nil, err
	} else if tls != "" {
		dsn = tls
	}

	u, err := url.Parse(dsn + tls)
	if err != nil {
		return nil, err
	}
	tlsConfig, err := crypto.TLSConfigFromURL(u)
	if err != nil {
		return nil, err
	}

	if tlsConfig != nil {
		opts.TLSConfig = tlsConfig
	}

	conn, err := mongo.Connect(ctx, opts)
	if err != nil {
		return nil, err
	}
	return &mongoConn{conn}, nil
}

type mongoConn struct {
	*mongo.Client
}

func (c *mongoConn) Name() string {
	return ""
}

func (c *mongoConn) ID() string {
	return ""
}

func (c *mongoConn) Metadata() map[string]string {
	return map[string]string{}
}

func (c *mongoConn) As(i interface{}) bool {
	if vv, ok := i.(**mongo.Client); ok {
		*vv = c.Client
		return true
	}
	return false
}

func (c *mongoConn) Addr() string {
	return "mongodb"
}

func (c *mongoConn) Ping() error {
	return nil
}

func (c *mongoConn) Stats() map[string]interface{} {
	return map[string]interface{}{}
}

func (c *mongoConn) Close() error {
	return nil
}
