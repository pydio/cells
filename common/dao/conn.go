/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
	"database/sql"
	"fmt"

	"time"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/service/metrics"
)

type conn struct{}

type Conn interface{}

type driver interface {
	Open(dsn string) (Conn, error)
}

func NewConn(d string, dsn string) (Conn, error) {
	var drv driver
	switch d {
	case "mysql":
		drv = new(mysql)
	case "sqlite3":
		drv = new(sqlite)
	case "boltdb":
		drv = new(boltdb)
	default:
		return nil, fmt.Errorf("wrong driver")
	}

	if db, err := drv.Open(dsn); err != nil {
		return nil, err
	} else {
		return db, nil
	}

}

func getSqlConnection(driver string, dsn string) (*sql.DB, error) {
	if db, err := sql.Open(driver, dsn); err != nil {
		return nil, err
	} else {
		if err := db.Ping(); err != nil {
			return nil, err
		}
		db.SetMaxOpenConns(common.DB_MAX_OPEN_CONNS)
		db.SetConnMaxLifetime(common.DB_CONN_MAX_LIFETIME)
		db.SetMaxIdleConns(common.DB_MAX_IDLE_CONNS)
		computeStats(db)
		return db, nil
	}
}

func computeStats(db *sql.DB) {
	go func() {
		for {
			s := db.Stats()
			metrics.GetMetrics().Gauge("db_open_connections").Update(float64(s.OpenConnections))
			<-time.After(30 * time.Second)
		}
	}()
}
