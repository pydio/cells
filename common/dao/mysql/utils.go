package mysql

import (
	"github.com/go-sql-driver/mysql"
	"github.com/pydio/cells/v4/common/utils/configx"
	"net"
)

func DSNToConfig(dsn string) (configx.Values, error) {
	c := configx.New()

	conf, err := mysql.ParseDSN(dsn)
	if err != nil {
		return nil, err
	}

	host, port, err := net.SplitHostPort(conf.Addr)
	if err != nil {
		return nil, err
	}

	c.Val("server").Set(host)
	c.Val("port").Set(port)
	c.Val("path").Set(conf.DBName)
	c.Val("scheme").Set("mysql")

	if conf.User != "" {
		auth := c.Val("auth")
		auth.Val("user").Set(conf.User)
		if conf.Passwd != "" {
			auth.Val("password").Set(conf.Passwd)
		}
	}

	params := c.Val("params")
	params.Set(conf.Params)

	if conf.ParseTime {
		params.Val("parseTime").Set(true)
	}

	// TODO ? TLS

	return c, nil
}
