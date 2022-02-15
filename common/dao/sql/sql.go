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

package sql

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/service/metrics"
	sql2 "github.com/pydio/cells/v4/common/sql"
)

const (
	MysqlDriver  = "mysql"
	SqliteDriver = "sqlite3"
)

func init() {
	dao.RegisterDAODriver(MysqlDriver, sql2.NewDAO, func(driver, dsn string) dao.ConnDriver {
		return &mysql{}
	})
	dao.RegisterDAODriver(SqliteDriver, sql2.NewDAO, func(driver, dsn string) dao.ConnDriver {
		return &sqlite{}
	})
}

var (
	SqlConnectionOpenTimeout = 60 * time.Second
	SqlConnectionOpenRetries = 10 * time.Second
)

func getSqlConnection(driver string, dsn string) (*sql.DB, error) {
	if db, err := sql.Open(driver, dsn); err != nil {
		return nil, err
	} else {
		if err := pingWithRetries(db); err != nil {
			return nil, err
		}
		computeStats(db)
		return db, nil
	}
}

func pingWithRetries(db *sql.DB) error {
	var lastErr error
	if err := db.Ping(); err == nil {
		return nil
	} else {
		lastErr = err
		fmt.Println("[SQL] Server does not answer yet, will retry in 10 seconds...")
	}
	tick := time.NewTicker(SqlConnectionOpenRetries)
	timeout := time.NewTimer(SqlConnectionOpenTimeout)
	defer tick.Stop()
	defer timeout.Stop()
	for {
		select {
		case <-tick.C:
			if err := db.Ping(); err == nil {
				return nil
			} else {
				lastErr = err
				fmt.Println("[SQL] Server does not answer yet, will retry in 10 seconds...")
			}
		case <-timeout.C:
			return lastErr
		}
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
