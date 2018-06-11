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

package lib

import (
	"crypto/sha1"
	"database/sql"
	"fmt"
	"io"
	"strings"

	"github.com/go-sql-driver/mysql"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/install"
)

func dsnFromInstallConfig(c *install.InstallConfig) (string, error) {

	var err error

	conf := new(mysql.Config)

	switch c.GetDbConnectionType() {
	case "tcp":
		conf, err = addDatabaseTCPConnection(c)
	case "socket":
		conf, err = addDatabaseSocketConnection(c)
	case "manual":
		conf, err = addDatabaseManualConnection(c)
	default:
		return "", fmt.Errorf("Unknown type")
	}

	if err != nil {
		return "", err
	}

	conf.ParseTime = true

	// Check DB Connection
	dsn := conf.FormatDSN()

	return dsn, nil

}

// DATABASES
func actionDatabaseAdd(c *install.InstallConfig) error {

	dsn, err := dsnFromInstallConfig(c)
	if err != nil {
		return err
	}

	if e := checkConnection(dsn); e != nil {
		return e
	}

	connection := map[string]string{
		"driver": "mysql",
		"dsn":    dsn,
	}

	h := sha1.New()
	io.WriteString(h, dsn)
	id := fmt.Sprintf("%x", h.Sum(nil))

	config.Set(connection, "databases", id)

	// Only set the default if the default is not set
	if config.Get("defaults", "database").String("") == "" {
		config.Set(id, "defaults", "database")
	}

	config.Save("cli", "Install / Setting Databases")

	return nil
}

func addDatabaseTCPConnection(c *install.InstallConfig) (*mysql.Config, error) {
	conf := &mysql.Config{
		User:   c.GetDbTCPUser(),
		Passwd: c.GetDbTCPPassword(),
		Net:    "tcp",
		Addr:   fmt.Sprintf("%s:%s", c.GetDbTCPHostname(), c.GetDbTCPPort()),
		DBName: c.GetDbTCPName(),
	}

	return conf, nil
}

func addDatabaseSocketConnection(c *install.InstallConfig) (*mysql.Config, error) {
	conf := &mysql.Config{
		User:   c.GetDbSocketUser(),
		Passwd: c.GetDbSocketPassword(),
		Net:    "unix",
		Addr:   c.GetDbSocketFile(),
		DBName: c.GetDbSocketName(),
	}

	return conf, nil
}

func addDatabaseManualConnection(c *install.InstallConfig) (*mysql.Config, error) {
	// DSN has already been validated - no need to check the error
	conf, _ := mysql.ParseDSN(c.GetDbManualDSN())

	return conf, nil
}

func checkConnection(dsn string) error {
	for {
		if db, err := sql.Open("mysql", dsn); err != nil {
			return err
		} else {
			// Open doesn't open a connection. Validate DSN data:
			if err = db.Ping(); err != nil && strings.HasPrefix(err.Error(), "Error 1049") {
				rootconf, _ := mysql.ParseDSN(dsn)
				dbname := rootconf.DBName
				rootconf.DBName = ""

				rootdsn := rootconf.FormatDSN()

				if rootdb, rooterr := sql.Open("mysql", rootdsn); rooterr != nil {
					return rooterr
				} else {
					if _, err = rootdb.Exec(fmt.Sprintf("create database if not exists %s", dbname)); err != nil {
						return err
					}
				}
			} else if err != nil {
				return err
			} else {
				break
			}
		}
	}
	return nil
}
