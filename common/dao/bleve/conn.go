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

package bleve

import (
	"context"
	"os"

	"github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/index/scorch"
	"github.com/blevesearch/bleve/v2/index/upsidedown/store/boltdb"

	"github.com/pydio/cells/v4/common/conn"
	"github.com/pydio/cells/v4/common/utils/configx"
)

func init() {
	conn.RegisterConnProvider("bleve", newBleveConn)
}

func newBleveConn(ctx context.Context, c configx.Values) (conn.Conn, error) {
	file := c.Val("dsn").String()

	var index bleve.Index
	var err error

	_, err = os.Stat(file)
	if os.IsNotExist(err) {
		index, err = bleve.NewUsing(file, bleve.NewIndexMapping(), scorch.Name, boltdb.Name, nil)
	} else {
		index, err = bleve.Open(file)
	}

	if err != nil {
		return nil, err
	}

	return &bleveConn{
		Index: index,
	}, nil
}

type bleveConn struct {
	bleve.Index
}

func (c *bleveConn) Name() string {
	return ""
}

func (c *bleveConn) ID() string {
	return ""
}

func (c *bleveConn) Metadata() map[string]string {
	return map[string]string{}
}

func (c *bleveConn) As(i interface{}) bool {
	if vv, ok := i.(*bleve.Index); ok {
		*vv = c.Index
		return true
	}
	return false
}

func (c *bleveConn) Addr() string {
	return "bleve"
}

func (c *bleveConn) Ping() error {
	return nil
}

func (c *bleveConn) Stats() map[string]interface{} {
	return c.Index.StatsMap()
}

func (c *bleveConn) Close() error {
	return c.Index.Close()
}
