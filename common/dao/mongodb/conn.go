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

package mongodb

import (
	"context"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	
	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/log"
)

type mongodb struct {
	conn *mongo.Client
}

func (m *mongodb) Open(c context.Context, dsn string) (dao.Conn, error) {

	// Create a new client and connect to the server
	client, err := mongo.Connect(c, options.Client().ApplyURI(dsn))
	if err != nil {
		return nil, err
	}

	if err := client.Ping(c, readpref.Primary()); err != nil {
		return nil, err
	}
	log.Logger(c).Info("MongoDB connected and pinged")

	m.conn = client

	return client, nil

}

func (m *mongodb) GetConn(c context.Context) (dao.Conn, error) {
	return m.conn, nil
}

func (m *mongodb) SetMaxConnectionsForWeight(num int) {
	// Not implemented
}
