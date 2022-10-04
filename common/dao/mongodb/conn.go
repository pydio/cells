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
	"github.com/pydio/cells/v4/common/crypto"
	"github.com/pydio/cells/v4/common/utils/std"
	"net/url"
	"time"

	"github.com/pkg/errors"
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

	log.Logger(c).Info("[MongoDB] attempt connection")
	oo := options.Client().ApplyURI(dsn)
	if u, e := url.Parse(dsn); e == nil && (u.Query().Get("ssl") == "true" || u.Query().Get("tls") == "true") {
		if tlsConfig, er := crypto.TLSConfigFromURL(u); er == nil {
			oo.TLSConfig = tlsConfig
		} else {
			log.Logger(c).Warn("Could not parse tlsOptions from URL: " + er.Error())
		}
	}
	// Create a new client and connect to the server
	client, err := mongo.Connect(c, oo)
	if err != nil {
		return nil, errors.Wrap(err, "[MongoDB] connection failed")
	}

	if err := std.Retry(c, func() error {
		cWithTimeout, cancel := context.WithTimeout(c, 1*time.Second)
		defer cancel()
		if err := client.Ping(cWithTimeout, readpref.Primary()); err != nil {
			log.Logger(c).Warn("[MongoDB] cannot ping server, retrying... ")
			return errors.Wrap(err, "[MongoDB] connection failed")
		}
		return nil
	}, 10*time.Second, 10*time.Minute); err != nil {
		return nil, err
	}

	log.Logger(c).Info("[MongoDB] connected and pinged")

	m.conn = client

	return client, nil

}

func (m *mongodb) GetConn(c context.Context) (dao.Conn, error) {
	return m.conn, nil
}

func (m *mongodb) SetMaxConnectionsForWeight(num int) {
	// Not implemented
}
