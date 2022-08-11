package conn

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/pydio/cells/v4/common/utils/configx"
)

func init() {
	RegisterConnProvider("mysql", newMysqlConn)
}

func newMysqlConn(ctx context.Context, c configx.Values) (Conn, error) {

	server := c.Val("server").String()
	port := c.Val("port").Int()
	db := c.Val("database").String()

	auth, err := addUser(c.Val("auth"))
	if err != nil {
		return nil, err
	} else if auth != "" {
		auth = auth + "@"
	}

	tls, err := addTLS(c.Val("tls"))
	if err != nil {
		return nil, err
	} else if tls != "" {
		tls = "?" + tls
	}

	dsn := fmt.Sprintf("%stcp(%s:%d)/%s%s", auth, server, port, db, tls)

	conn, err := sql.Open("mysql+tls", dsn)
	if err != nil {
		return nil, err
	}
	return &sqlConn{conn}, nil
}

type sqlConn struct {
	*sql.DB
}

func (c *sqlConn) As(i interface{}) bool {
	if vv, ok := i.(**sql.DB); ok {
		*vv = c.DB
		return true
	}
	return false
}

func (c *sqlConn) Addr() string {
	return "mysql"
}

func (c *sqlConn) Stats() map[string]interface{} {
	stats := c.DB.Stats()
	return map[string]interface{}{
		"MaxOpenConnections": stats.MaxOpenConnections,
		"OpenConnections":    stats.OpenConnections,
		"InUse":              stats.InUse,
		"Idle":               stats.Idle,
		"WaitCount":          stats.WaitCount,
		"WaitDuration":       stats.WaitDuration,
		"MaxIdleClosed":      stats.MaxIdleClosed,
		"MaxIdleTimeClosed":  stats.MaxIdleTimeClosed,
		"MaxLifetimeClosed":  stats.MaxLifetimeClosed,
	}
}
