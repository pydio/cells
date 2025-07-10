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
	"net/url"
	"regexp"
	"strings"

	"github.com/go-sql-driver/mysql"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/proto/install"
	sql2 "github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

var (
	ErrMySQLCharsetNotSupported = errors.New("Charset is not supported for this version of MySQL")
	ErrMySQLVersionNotSupported = errors.New("This version of the database is currently not supported")
)

func dsnFromInstallConfig(c *install.InstallConfig) (string, error) {

	var err error
	var conf string
	connType := c.GetDbConnectionType()
	values := url.Values{}
	values.Add("prefix", "{{.Meta.prefix}}")
	values.Add("policies", "{{.Meta.policies}}")
	values.Add("singular", "{{.Meta.singular}}")

	switch connType {
	case "tcp", "mysql_tcp", "pg_tcp":
		conf = buildTCPConnectionString(c, values, connType == "pg_tcp")
	case "socket", "mysql_socket", "pg_socket":
		conf = buildSocketConnectionString(c, values, connType == "pg_socket")
	case "sqlite":
		conf = buildSqliteConnectionString(c, values, connType == "sqlite")
	case "manual":
		return c.GetDbManualDSN(), nil
	default:
		return "", fmt.Errorf("Unknown type")
	}

	return conf, err

}

func installDocumentDSN(ctx context.Context, c *install.InstallConfig) error {
	if c.UseDocumentsDSN && strings.HasPrefix(c.DocumentsDSN, "mongodb://") {
		if !strings.Contains(c.DocumentsDSN, "?") {
			c.DocumentsDSN += "?prefix={{.Meta.prefix}}"
		} else {
			c.DocumentsDSN += "&prefix={{.Meta.prefix}}"
		}
		if err := config.SetDatabase(ctx, "mongodb", "mongodb", c.DocumentsDSN, "documentsDSN"); err != nil {
			return err
		}
	} else {
		if err := config.SetDatabase(ctx, "boltdb", "bolt", "boltdb://{{ autoMkdir (serviceDataDir .Service) }}/{{ .Meta.file }}", ""); err != nil {
			return err
		}

		if err := config.SetDatabase(ctx, "bleve", "bleve", "bleve://{{ autoMkdir (serviceDataDir .Service) }}/{{ .Meta.file }}", ""); err != nil {
			return err
		}
	}

	return nil
}

// DATABASES
func actionDatabaseAdd(ctx context.Context, c *install.InstallConfig, flags byte) error {

	// First removing the old install
	config.Del(ctx, "databases")

	if er := installDocumentDSN(ctx, c); er != nil {
		return er
	}

	if flags&InstallDSNOnly != 0 {
		return config.Save(ctx, "cli", "Installed new Document DSN")
	}

	dsn, err := dsnFromInstallConfig(c)
	if err != nil {
		return err
	}

	if e := checkConnection(ctx, dsn); e != nil {
		return e
	}

	h := sha1.New()
	_, _ = io.WriteString(h, dsn)
	id := fmt.Sprintf("%x", h.Sum(nil))

	if e := config.SetDatabase(ctx, id, "sql", dsn, "database"); e != nil {
		return e
	}

	return config.Save(ctx, "cli", "Install / Setting Databases")
}

func buildTCPConnectionString(c *install.InstallConfig, values url.Values, pg bool) string {
	if pg {
		u := &url.URL{}
		u.Scheme = "postgres"
		u.Host = fmt.Sprintf("%s:%s", c.GetDbTCPHostname(), c.GetDbTCPPort())
		u.Path = c.GetDbTCPName()
		u.User = url.UserPassword(c.DbTCPUser, c.DbTCPPassword)
		qv := url.Values{}
		qv.Set("sslmode", "disable") // disable ssl by default for PG
		u.RawQuery = qv.Encode()
		var pureValues string
		for k, v := range values {
			pureValues = pureValues + "&" + k + "=" + v[0]
		}
		return u.String() + pureValues
	} else {
		conf := mysql.NewConfig()
		conf.User = c.GetDbTCPUser()
		conf.Passwd = c.GetDbTCPPassword()
		conf.Net = "tcp"
		conf.Addr = fmt.Sprintf("%s:%s", c.GetDbTCPHostname(), c.GetDbTCPPort())
		conf.DBName = c.GetDbTCPName()
		conf.ParseTime = true
		conf.Params = make(map[string]string)
		for k, v := range values {
			conf.Params[k] = v[0]
		}
		return "mysql://" + conf.FormatDSN()
	}

}

func buildSocketConnectionString(c *install.InstallConfig, values url.Values, pg bool) string {
	if pg {
		// leave empty host and use host=/path/to/file in query
		u := &url.URL{}
		u.Scheme = "postgres"
		qv := url.Values{}
		qv.Set("host", c.GetDbSocketFile())
		u.RawQuery = qv.Encode()
		u.Path = c.GetDbTCPName()
		u.User = url.UserPassword(c.DbSocketUser, c.DbSocketPassword)
		var pureValues string
		for k, v := range values {
			pureValues = pureValues + "&" + k + "=" + v[0]
		}
		return u.String() + pureValues

	} else {
		conf := mysql.NewConfig()
		conf.User = c.GetDbSocketUser()
		conf.Passwd = c.GetDbSocketPassword()
		conf.Net = "unix"
		conf.Addr = c.GetDbSocketFile()
		conf.DBName = c.GetDbSocketName()
		conf.ParseTime = true
		conf.Params = make(map[string]string)
		for k, v := range values {
			conf.Params[k] = v[0]
		}
		return "mysql://" + conf.FormatDSN()
	}
}

func buildSqliteConnectionString(c *install.InstallConfig, values url.Values, pg bool) string {
	var pureValues string
	for k, v := range values {
		pureValues = pureValues + k + "=" + v[0] + "&"
	}
	return "sqlite://" + c.GetDbSocketFile() + "?" + pureValues
}

func checkConnection(ctx context.Context, dsn string) error {

	DSN, err := sql2.NewStorageDSN(dsn)
	if err != nil {
		return err
	}
	return DSN.Check(ctx, true)
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
