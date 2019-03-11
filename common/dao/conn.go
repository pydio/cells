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
	"sync"

	"time"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/service/metrics"
)

var (
	conns = make(map[string]Conn)
	lock  = new(sync.RWMutex)
)

type conn struct{}

type Conn interface{}

type driver interface {
	Open(dsn string) (Conn, error)
}

func addConn(d string, dsn string) (Conn, error) {
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

	db, err := drv.Open(dsn)
	if err != nil {
		return nil, err
	}

	lock.Lock()
	defer lock.Unlock()

	conns[d+":"+dsn] = db

	return db, nil
}

func readConn(d string, dsn string) Conn {
	lock.RLock()
	defer lock.RUnlock()

	if conn, ok := conns[d+":"+dsn]; ok {
		return conn
	}

	return nil
}

func getConn(d string, dsn string) (Conn, error) {
	if conn := readConn(d, dsn); conn != nil {
		return conn, nil
	}

	return addConn(d, dsn)
}

func NewConn(d string, dsn string) (Conn, error) {
	return getConn(d, dsn)
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
