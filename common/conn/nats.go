package conn

import (
	"context"
	"errors"
	"fmt"
	"github.com/nats-io/nats.go"
	"github.com/pydio/cells/v4/common/crypto"

	"github.com/pydio/cells/v4/common/utils/configx"
)

func init() {
	RegisterConnProvider("nats", newNatsConn)
}

func newNatsConn(ctx context.Context, c configx.Values) (Conn, error) {
	server := c.Val("server").String()
	port := c.Val("port").Int()
	db := c.Val("database").String()

	dsn := fmt.Sprintf("%s:%d/%s", server, port, db)

	tlsConfig, err := crypto.TLSConfig(c.Val("tls"))
	if err != nil {
		return nil, err
	}

	var opts []nats.Option
	if tlsConfig != nil {
		opts = append(opts, nats.Secure(tlsConfig))
	}

	conn, err := nats.Connect(dsn, opts...)
	if err != nil {
		return nil, err
	}

	return &natsConn{conn}, nil
}

type natsConn struct {
	*nats.Conn
}

func (c *natsConn) Name() string {
	return ""
}

func (c *natsConn) ID() string {
	return ""
}

func (c *natsConn) Metadata() map[string]string {
	return map[string]string{}
}

func (c *natsConn) As(i interface{}) bool {
	if vv, ok := i.(**nats.Conn); ok {
		*vv = c.Conn
		return true
	}
	return false
}

func (c *natsConn) Addr() string {
	return "nats"
}

func (c *natsConn) Ping() error {
	if !c.Conn.IsConnected() {
		return errors.New("not connected")
	}

	return nil
}

func (c *natsConn) Stats() map[string]interface{} {
	return nil
}

func (c *natsConn) Close() error {
	return nil
}
