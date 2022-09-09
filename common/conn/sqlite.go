package conn

import (
	"context"
	"database/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/std"
)

func init() {
	RegisterConnProvider("sqlite", newSQLiteConn)
}

func newSQLiteConn(ctx context.Context, c configx.Values) (Conn, error) {
	dsn := c.Val("dsn").String()

	conn, err := sql.Open("sqlite3", dsn)
	if err != nil {
		return nil, err
	}

	ch := make(chan map[string]interface{})
	return &sqlConn{
		std.Randkey(16),
		ch,
		conn,
	}, nil
}
