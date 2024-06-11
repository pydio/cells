//go:build exclude
// +build exclude

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
	"sync"

	tools "github.com/go-sql-driver/mysql"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/runtime"
	commonsql "github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/telemetry/metrics"
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

	// Try to create the database to ensure it exists
	mysqlConfig, err := tools.ParseDSN(dsn)
	if err != nil {
		return nil, err
	}
	dbName := mysqlConfig.DBName
	mysqlConfig.DBName = ""
	rootDSN := mysqlConfig.FormatDSN()

	driver := "mysql"
	if ssl, ok := mysqlConfig.Params["ssl"]; ok && ssl == "true" {
		driver += "+tls"
	}

	if db, err = commonsql.GetSqlConnection(c, driver, rootDSN); err != nil {
		return nil, err
	}
	if _, err = db.Exec(fmt.Sprintf("create database if not exists `%s`", dbName)); err != nil {
		return nil, err
	}

	if db, err = commonsql.GetSqlConnection(c, driver, dsn); err != nil {
		return nil, err
	}

	if !runtime.IsFork() {
		if res, err := CheckCollation(c, db, dbName); err != nil && len(res) > 0 {
			return nil, err
		} else if len(res) > 0 {
			log.Logger(c).Warn("[SQL] *************************************************************************************************************************")
			log.Logger(c).Warn("[SQL] ")
			log.Logger(c).Warn("[SQL]   The following tables have a character set that does not match the default character set for the database...")
			for k, v := range res {
				log.Logger(c).Warn("[SQL]   ", zap.String("name", k), zap.String("collation", v))
			}
			log.Logger(c).Warn("[SQL]   It might be due to the database being migrated from another system or the default database having been updated.")
			log.Logger(c).Warn("[SQL]   It could potentially lead to issues during upgrades so we you should pre-emptively fix the tables collations.")
			log.Logger(c).Warn("[SQL]   Find more information here : https://pydio.com/en/docs/cells/v4/major-versions-upgrade-informations ")
			log.Logger(c).Warn("[SQL] ")
			log.Logger(c).Warn("[SQL] *************************************************************************************************************************")
		}

		var version string
		if err := db.QueryRow("SELECT VERSION()").Scan(&version); err == nil {
			metrics.TaggedHelper(map[string]string{
				"version": version,
			}).Gauge("db_version_info").Update(1)
		}

	}

	m.conn = db

	return db, nil
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

func CheckCollation(ctx context.Context, db *sql.DB, dbName string) (map[string]string, error) {
	rows, err := db.QueryContext(ctx, "SELECT TABLE_NAME, TABLE_COLLATION"+
		" FROM INFORMATION_SCHEMA.TABLES tbl"+
		" WHERE TABLE_SCHEMA=\""+dbName+"\" AND TABLE_TYPE=\"BASE TABLE\""+
		" AND TABLE_NAME NOT LIKE '%_migrations'"+
		" AND TABLE_NAME NOT LIKE '%_migration'"+
		" AND TABLE_COLLATION NOT LIKE 'ascii%'"+
		" AND TABLE_COLLATION NOT LIKE CONCAT(@@CHARACTER_SET_DATABASE, \"%\");")

	if err != nil {
		return nil, err
	}

	res := make(map[string]string)

	for rows.Next() {
		var name, collation string
		rows.Scan(&name, &collation)
		res[name] = collation
	}

	return res, nil
}

// FilterDAOErrors hides sensitive information about the underlying table
// when we receive MySQLError.
func FilterDAOErrors(err error) (error, bool) {
	filtered := false
	if err != nil {
		if _, ok := err.(*tools.MySQLError); ok {
			err = errors.WithMessage(errors.StatusInternalServerError, "DAO error received")
			filtered = true
		}
	}
	return err, filtered
}
