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
	"context"
	"crypto/sha1"
	"database/sql"
	"errors"
	"fmt"
	"io"
	"regexp"
	"strings"
	"time"

	uuid2 "github.com/pydio/cells/v4/common/utils/uuid"

	"github.com/go-sql-driver/mysql"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/install"
)

var (
	ErrMySQLCharsetNotSupported = errors.New("Charset is not supported for this version of MySQL")
	ErrMySQLVersionNotSupported = errors.New("This version of the database is currently not supported")
)

func dsnFromInstallConfig(c *install.InstallConfig) (string, error) {

	var err error

	var conf *mysql.Config

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

func installDocumentDSN(c *install.InstallConfig) error {

	if c.GetDocumentsDSN() == "" {
		return nil
	}

	var driver, dsn string
	if strings.HasPrefix(c.DocumentsDSN, "mongodb://") {
		driver = "mongodb"
		dsn = c.DocumentsDSN
	} else if strings.HasPrefix(c.DocumentsDSN, "boltdb") {
		driver = "boltdb"
		dsn = strings.TrimPrefix(c.DocumentsDSN, "boltdb://")
	} else if strings.HasPrefix(c.DocumentsDSN, "bleve") {
		driver = "bleve"
		dsn = strings.TrimPrefix(c.DocumentsDSN, "bleve://")
	}
	dbKey := driver + "-" + strings.Split(uuid2.New(), "-")[0]
	setDefaultsKey := ""
	if c.GetUseDocumentsDSN() && driver == "mongodb" {
		setDefaultsKey = "documentsDSN"
	}
	if er := config.SetDatabase(dbKey, driver, dsn, setDefaultsKey); er != nil {
		return er
	}
	if setDefaultsKey != "" {
		ss, e := ListServicesWithStorage()
		if e != nil {
			return e
		}
		for _, s := range ss {
			for _, storage := range s.Options().Storages {
				var supports bool
				for _, supported := range storage.SupportedDrivers {
					if supported == driver {
						supports = true
						break
					}
				}
				if supports {
					if er := config.Set(dbKey, "services", s.Name(), storage.StorageKey); er != nil {
						return er
					} else {
						fmt.Println("Assigning Document DSN to " + s.Name())
					}
				}
			}
		}
	}
	return nil
}

// DATABASES
func actionDatabaseAdd(c *install.InstallConfig, flags byte) error {

	if er := installDocumentDSN(c); er != nil {
		return er
	}

	if flags&InstallDSNOnly != 0 {
		return config.Save("cli", "Installed new Document DSN")
	}

	dsn, err := dsnFromInstallConfig(c)
	if err != nil {
		return err
	}

	if e := checkConnection(dsn); e != nil {
		return e
	}

	h := sha1.New()
	_, _ = io.WriteString(h, dsn)
	id := fmt.Sprintf("%x", h.Sum(nil))

	if e := config.SetDatabase(id, "mysql", dsn, "database"); e != nil {
		return e
	}

	return config.Save("cli", "Install / Setting Databases")
}

func addDatabaseTCPConnection(c *install.InstallConfig) (*mysql.Config, error) {
	conf := mysql.NewConfig()

	conf.User = c.GetDbTCPUser()
	conf.Passwd = c.GetDbTCPPassword()
	conf.Net = "tcp"
	conf.Addr = fmt.Sprintf("%s:%s", c.GetDbTCPHostname(), c.GetDbTCPPort())
	conf.DBName = c.GetDbTCPName()

	return conf, nil
}

func addDatabaseSocketConnection(c *install.InstallConfig) (*mysql.Config, error) {
	conf := mysql.NewConfig()

	conf.User = c.GetDbSocketUser()
	conf.Passwd = c.GetDbSocketPassword()
	conf.Net = "unix"
	conf.Addr = c.GetDbSocketFile()
	conf.DBName = c.GetDbSocketName()

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
			c, cf := context.WithTimeout(context.Background(), 3*time.Second)
			defer cf()
			if err := db.PingContext(c); err != nil && strings.HasPrefix(err.Error(), "Error 1049") {
				rootconf, _ := mysql.ParseDSN(dsn)
				dbname := rootconf.DBName
				rootconf.DBName = ""

				rootdsn := rootconf.FormatDSN()

				if rootdb, rooterr := sql.Open("mysql", rootdsn); rooterr != nil {
					return rooterr
				} else {
					version, err := getMysqlVersion(rootdb)
					if err != nil {
						return err
					}

					if err := checkMysqlCompat(version); err != nil {
						return err
					}

					errCharset := checkMysqlCharset(rootdb, version)
					switch {
					case errCharset == ErrMySQLCharsetNotSupported:
						dbname = dbname + " CHARACTER SET utf8 COLLATE utf8_general_ci"
					case errCharset != nil:
						return errCharset
					}

					if _, err = rootdb.Exec(fmt.Sprintf("create database if not exists %s", dbname)); err != nil {
						return err
					}
				}
			} else if err != nil {
				return err
			} else {
				version, err := getMysqlVersion(db)
				if err != nil {
					return err
				}

				if err := checkMysqlCompat(version); err != nil {
					return err
				}
				if err := checkMysqlCharset(db, version); err != nil {
					return err
				}

				break
			}
		}
	}
	return nil
}

func getMysqlVersion(db *sql.DB) (string, error) {
	// Here we check the version of mysql and the default charset
	var version string
	err := db.QueryRow("SELECT VERSION()").Scan(&version)
	switch {
	case err == sql.ErrNoRows:
		return "", fmt.Errorf("Could not retrieve your mysql version - Please create the database manually and retry")
	case err != nil:
		return "", err
	}

	return version, nil
}

func checkMysqlCompat(version string) error {
	mysql8022Matched, err := regexp.MatchString("^8.0.22$", version)
	if err != nil {
		return fmt.Errorf("Could not determine db version")
	}

	if mysql8022Matched {
		log.Error(ErrMySQLVersionNotSupported.Error())
		return ErrMySQLVersionNotSupported
	}

	return nil
}

func checkMysqlCharset(db *sql.DB, version string) error {
	// Matches
	mysqlMatched, err1 := regexp.MatchString("^5.[456].*$", version)
	mariaMatched, err2 := regexp.MatchString("^10.1.*-MariaDB$", version)

	if err1 != nil || err2 != nil {
		return fmt.Errorf("Could not determine db version")
	}

	if mysqlMatched || mariaMatched {
		var charname, charvalue string
		err := db.QueryRow("SHOW VARIABLES LIKE 'character_set_database'").Scan(&charname, &charvalue)
		switch {
		case err == sql.ErrNoRows:
			return fmt.Errorf("Could not retrieve your default charset - Please create the database manually and retry")
		case err != nil:
			return err
		default:
		}

		if charvalue == "utf8mb4" {
			return ErrMySQLCharsetNotSupported
		}
	}

	return nil
}

func checkCellsInstallExists(dsn string) (install bool, admin bool, e error) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return
	}
	rows, er := db.Query("SHOW TABLES LIKE 'idm_user_%'")
	if er != nil {
		return
	}
	defer rows.Close()
	//var tables []string
	var table string
	var iut, iua bool
	for rows.Next() {
		if er = rows.Scan(&table); er == nil {
			switch table {
			case "idm_user_idx_tree":
				iut = true
			case "idm_user_attributes":
				iua = true
			}
		}
	}
	if iut && iua {
		install = true
		q := "SELECT count(t.name) FROM `idm_user_idx_tree` as t , `idm_user_attributes` as a WHERE (a.name = 'profile' AND a.value = 'admin') AND (t.uuid = a.uuid) LIMIT 1"
		var count int
		if er := db.QueryRow(q).Scan(&count); er == nil && count > 0 {
			admin = true
		}
	}

	return
}
