package etcd

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/conn"
	"github.com/pydio/cells/v4/common/crypto"
	"google.golang.org/grpc/connectivity"
	"net"
	"time"

	clientv3 "go.etcd.io/etcd/client/v3"

	"github.com/pydio/cells/v4/common/utils/configx"
)

func init() {
	conn.RegisterConnProvider("etcd", newEtcdConn)
}

func newEtcdConn(ctx context.Context, c configx.Values) (conn.Conn, error) {
	server := c.Val("server").String()
	port := c.Val("port").String()
	// db := c.Val("database").Int()
	user := c.Val("user").String()
	password := c.Val("password").String()

	tlsConfig, err := crypto.TLSConfig(c.Val("tls"))
	if err != nil {
		return nil, err
	}

	addr := net.JoinHostPort(server, port)
	if tlsConfig == nil {
		addr = "http://" + addr
	} else {
		addr = "https://" + addr
	}

	cli, err := clientv3.New(clientv3.Config{
		Endpoints:         []string{addr},
		DialTimeout:       2 * time.Second,
		DialKeepAliveTime: 2 * time.Second,
		Username:          user,
		Password:          password,
		TLS:               tlsConfig,
	})
	if err != nil {
		return nil, err
	}

	return &etcdConn{
		Client: cli,
	}, nil
}

type etcdConn struct {
	*clientv3.Client
}

func (c *etcdConn) Name() string {
	return ""
}

func (c *etcdConn) ID() string {
	return ""
}

func (c *etcdConn) Metadata() map[string]string {
	return map[string]string{}
}

func (c *etcdConn) As(i interface{}) bool {
	if vv, ok := i.(**clientv3.Client); ok {
		*vv = c.Client
		return true
	}
	return false
}

func (c *etcdConn) Addr() string {
	return "etcd"
}

func (c *etcdConn) Ping() error {
	if c.Client.ActiveConnection().GetState() != connectivity.Ready {
		return fmt.Errorf("not connected")
	}
	return nil
}

func (c *etcdConn) Stats() map[string]interface{} {
	return nil
}

func (c *etcdConn) Close() error {
	return nil
}
