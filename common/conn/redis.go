package conn

import (
	"context"
	"github.com/pydio/cells/v4/common/crypto"
	"net"

	"github.com/go-redis/redis/v8"

	"github.com/pydio/cells/v4/common/utils/configx"
)

func init() {
	RegisterConnProvider("redis", newRedisConn)
}

func newRedisConn(ctx context.Context, c configx.Values) (Conn, error) {
	server := c.Val("server").String()
	port := c.Val("port").String()
	db := c.Val("database").Int()
	user := c.Val("user").String()
	password := c.Val("password").String()

	tlsConfig, err := crypto.TLSConfig(c.Val("tls"))
	if err != nil {
		return nil, err
	}

	cli := redis.NewClient(&redis.Options{
		Addr:      net.JoinHostPort(server, port),
		Username:  user,
		Password:  password,
		DB:        db,
		TLSConfig: tlsConfig,
	})

	return &redisConn{
		Client: cli,
	}, nil
}

type redisConn struct {
	*redis.Client
}

func (c *redisConn) As(i interface{}) bool {
	if vv, ok := i.(**redis.Client); ok {
		*vv = c.Client
		return true
	}
	return false
}

func (c *redisConn) Addr() string {
	return "redis"
}

func (c *redisConn) Ping() error {
	if _, err := c.Client.Ping(context.TODO()).Result(); err != nil {
		return err
	}
	return nil
}

func (c *redisConn) Stats() map[string]interface{} {
	return nil
}

func (c *redisConn) Close() error {
	return nil
}
