package mysql

import (
	"database/sql"
	"database/sql/driver"
	"net/url"

	tools "github.com/go-sql-driver/mysql"

	"github.com/pydio/cells/v4/common/crypto"
)

func init() {
	sql.Register("mysql+tls", &MySQLDriver{})
}

// MySQLDriver is exported to make the driver directly accessible.
// In general the driver is used via the database/sql package.
type MySQLDriver struct{}

// Open new Connection.
// See https://github.com/go-sql-driver/mysql#dsn-data-source-name for how
// the DSN string is formatted
func (d MySQLDriver) Open(dsn string) (driver.Conn, error) {
	mysqlConfig, err := tools.ParseDSN(dsn)
	if err != nil {
		return nil, err
	}
	if ssl, ok := mysqlConfig.Params["ssl"]; ok && ssl == "true" {
		u := &url.URL{}
		q := u.Query()
		q.Add(crypto.KeyCertStoreName, mysqlConfig.Params[crypto.KeyCertStoreName])
		q.Add(crypto.KeyCertInsecureHost, mysqlConfig.Params[crypto.KeyCertInsecureHost])
		q.Add(crypto.KeyCertUUID, mysqlConfig.Params[crypto.KeyCertUUID])
		q.Add(crypto.KeyCertKeyUUID, mysqlConfig.Params[crypto.KeyCertKeyUUID])
		q.Add(crypto.KeyCertCAUUID, mysqlConfig.Params[crypto.KeyCertCAUUID])
		u.RawQuery = q.Encode()

		tlsConfig, err := crypto.TLSConfigFromURL(u)
		if err != nil {
			return nil, err
		}
		if tlsConfig != nil {
			delete(mysqlConfig.Params, "ssl")
			delete(mysqlConfig.Params, crypto.KeyCertStoreName)
			delete(mysqlConfig.Params, crypto.KeyCertInsecureHost)
			delete(mysqlConfig.Params, crypto.KeyCertUUID)
			delete(mysqlConfig.Params, crypto.KeyCertKeyUUID)
			delete(mysqlConfig.Params, crypto.KeyCertCAUUID)

			tools.RegisterTLSConfig("cells", tlsConfig)
			mysqlConfig.TLSConfig = "cells"
			dsn = mysqlConfig.FormatDSN()
		}
	}

	return tools.MySQLDriver{}.Open(dsn)
}
