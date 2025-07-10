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
	"fmt"
	"io"
	"net/url"
	"regexp"
	"strings"

	"github.com/go-sql-driver/mysql"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/install"
	sql2 "github.com/pydio/cells/v5/common/storage/sql"
)

var (
	ErrMySQLCharsetNotSupported = errors.New("Charset is not supported for this version of MySQL")
	ErrMySQLVersionNotSupported = errors.New("This version of the database is currently not supported")
)

func dsnFromInstallConfig(c *install.InstallConfig) (string, error) {

	var err error
	var conf string
	connType := c.GetDbConnectionType()
	values := "prefix={{.Meta.prefix}}&policies={{.Meta.policies}}&singular={{.Meta.singular}}"

	switch connType {
	case "tcp", "mysql_tcp", "pg_tcp":
		conf = buildTCPConnectionString(c, values, connType == "pg_tcp")
	case "socket", "mysql_socket", "pg_socket":
		conf = buildSocketConnectionString(c, values, connType == "pg_socket")
	case "sqlite":
		conf = buildSqliteConnectionString(c, values)
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

	DSN, err := sql2.NewStorageDSN(dsn)
	if err != nil {
		return err
	}

	if serverInfos, e := DSN.Check(ctx, true); e != nil {
		return e
	} else if e = specificVersionsChecks(ctx, DSN.Driver(), serverInfos); e != nil {
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

func buildTCPConnectionString(c *install.InstallConfig, values string, pg bool) string {
	if pg {
		u := &url.URL{}
		u.Scheme = "postgres"
		u.Host = fmt.Sprintf("%s:%s", c.GetDbTCPHostname(), c.GetDbTCPPort())
		u.Path = c.GetDbTCPName()
		u.User = url.UserPassword(c.DbTCPUser, c.DbTCPPassword)
		qv := url.Values{}
		qv.Set("sslmode", "disable") // disable ssl by default for PG
		u.RawQuery = qv.Encode()
		return u.String() + "&" + values
	} else {
		conf := mysql.NewConfig()
		conf.User = c.GetDbTCPUser()
		conf.Passwd = c.GetDbTCPPassword()
		conf.Net = "tcp"
		conf.Addr = fmt.Sprintf("%s:%s", c.GetDbTCPHostname(), c.GetDbTCPPort())
		conf.DBName = c.GetDbTCPName()
		conf.ParseTime = true
		return "mysql://" + conf.FormatDSN() + "&" + values
	}

}

func buildSocketConnectionString(c *install.InstallConfig, values string, pg bool) string {
	if pg {
		// leave empty host and use host=/path/to/file in query
		u := &url.URL{}
		u.Scheme = "postgres"
		qv := url.Values{}
		qv.Set("host", c.GetDbSocketFile())
		u.RawQuery = qv.Encode()
		u.Path = c.GetDbTCPName()
		u.User = url.UserPassword(c.DbSocketUser, c.DbSocketPassword)
		return u.String() + "&" + values

	} else {
		conf := mysql.NewConfig()
		conf.User = c.GetDbSocketUser()
		conf.Passwd = c.GetDbSocketPassword()
		conf.Net = "unix"
		conf.Addr = c.GetDbSocketFile()
		conf.DBName = c.GetDbSocketName()
		conf.ParseTime = true
		return "mysql://" + conf.FormatDSN() + "&" + values
	}
}

func buildSqliteConnectionString(c *install.InstallConfig, values string) string {
	return "sqlite://" + c.GetDbSocketFile() + "?" + values
}

func specificVersionsChecks(ctx context.Context, driver string, infos *sql2.ServerInfos) error {
	if driver != "mysql" {
		return nil
	}
	version := infos.DbVersion
	if mysql8022Matched, _ := regexp.MatchString("^8.0.22$", version); mysql8022Matched {
		return errors.WithMessage(ErrMySQLVersionNotSupported, "version 8.0.22 is not supported")
	}
	mysqlMatched, _ := regexp.MatchString("^5.[456].*$", version)
	mariaMatched, _ := regexp.MatchString("^10.1.*-MariaDB$", version)
	if (mariaMatched || mysqlMatched) && infos.DbCharset == "utf8mb4" {
		return errors.WithMessage(ErrMySQLCharsetNotSupported, "This DB version has issues with utf8mb4 charset")
	}
	return nil
}
