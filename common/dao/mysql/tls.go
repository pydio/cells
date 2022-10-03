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

	return tools.MySQLDriver{}.Open(u.String())
}
