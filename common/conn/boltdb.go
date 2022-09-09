package conn

import (
	"context"
	"github.com/pydio/cells/v4/common/utils/configx"
	bolt "go.etcd.io/bbolt"
	"time"
)

func init() {
	RegisterConnProvider("boltdb", newBoltDBConn)
}

func newBoltDBConn(ctx context.Context, c configx.Values) (Conn, error) {
	file := c.Val("dsn").String()

	opt := *bolt.DefaultOptions
	opt.Timeout = 20 * time.Second
	db, err := bolt.Open(file, 0600, &opt)
	if err != nil {
		return nil, err
	}

	return &boltdbConn{
		DB: db,
	}, nil
}

type boltdbConn struct {
	*bolt.DB
}

func (c *boltdbConn) Name() string {
	return ""
}

func (c *boltdbConn) ID() string {
	return ""
}

func (c *boltdbConn) Metadata() map[string]string {
	return map[string]string{}
}

func (c *boltdbConn) As(i interface{}) bool {
	if vv, ok := i.(**bolt.DB); ok {
		*vv = c.DB
		return true
	}
	return false
}

func (c *boltdbConn) Addr() string {
	return "bolt"
}

func (c *boltdbConn) Ping() error {
	return nil
}

func (c *boltdbConn) Stats() map[string]interface{} {
	// TODO - DB Stats
	return nil
}

func (c *boltdbConn) Close() error {
	return c.DB.Close()
}
