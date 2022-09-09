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

package mysql

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/pydio/cells/v4/common/crypto"
	"github.com/pydio/cells/v4/common/registry/util"
	"net/url"
	"sync"

	tools "github.com/go-sql-driver/mysql"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/service/errors"
	commonsql "github.com/pydio/cells/v4/common/sql"
)

var (
	mysqlLock                    = &sync.Mutex{}
	ConnectionsPercentPerRequest = 5
	MaxConnectionsPercent        = 90
	IdleConnectionsPercent       = 25
)

type conn struct {
	conn *sql.DB
}

func (m *conn) Open(c context.Context, dsn string) (dao.Conn, error) {
	var (
		db *sql.DB
	)

	u, err := url.Parse(dsn)
	if err != nil {
		return nil, err
	}

	tlsConfig, err := crypto.TLSConfigFromURL(u)
	if err != nil {
		return nil, err
	}

	if tlsConfig != nil {
		q := u.Query()
		q.Add("tls", "cells")

		u.RawQuery = q.Encode()

		tools.RegisterTLSConfig("cells", tlsConfig)
	}

	// Try to create the database to ensure it exists
	mysqlConfig, err := tools.ParseDSN(u.String())
	if err != nil {
		return nil, err
	}
	dbName := mysqlConfig.DBName
	newDSN := mysqlConfig.FormatDSN()
	mysqlConfig.DBName = ""
	rootDSN := mysqlConfig.FormatDSN()

	addr := util.CreateAddress(mysqlConfig.Addr, nil)
	fmt.Println("Registered address ", addr.ID())

	if db, err = commonsql.GetSqlConnection(c, "mysql", rootDSN); err != nil {
		return nil, err
	}
	if _, err = db.Exec(fmt.Sprintf("create database if not exists `%s`", dbName)); err != nil {
		return nil, err
	}

	if db, err = commonsql.GetSqlConnection(c, "mysql", newDSN); err != nil {
		return nil, err
	}

	m.conn = db

	return db, nil
}

func (m *conn) Addr() string {
	return "yo yo yo"
}

func (m *conn) GetConn(ctx context.Context) (dao.Conn, error) {
	return m.conn, nil
}

func (m *conn) getMaxTotalConnections() int {
	db := m.conn

	var num int

	if err := db.QueryRow(`select @@max_connections`).Scan(&num); err != nil {
		return 0
	}

	return (num * MaxConnectionsPercent) / 100
}

func (m *conn) SetMaxConnectionsForWeight(num int) {

	mysqlLock.Lock()
	defer mysqlLock.Unlock()

	maxConns := m.getMaxTotalConnections() * (num * ConnectionsPercentPerRequest) / 100
	maxIdleConns := maxConns * IdleConnectionsPercent / 100

	m.conn.SetMaxOpenConns(maxConns)
	m.conn.SetMaxIdleConns(maxIdleConns)
}

// FilterDAOErrors hides sensitive information about the underlying table
// when we receive MySQLError.
func FilterDAOErrors(err error) (error, bool) {
	filtered := false
	if err != nil {
		if _, ok := err.(*tools.MySQLError); ok {
			err = errors.InternalServerError("dao.error", "DAO error received")
			filtered = true
		}
	}
	return err, filtered
}
