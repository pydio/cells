package conn

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/crypto"
	"github.com/pydio/cells/v4/common/utils/configx"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"net/url"
)

func init() {
	RegisterConnProvider("mongodb", newMongoConn)
}

func newMongoConn(ctx context.Context, c configx.Values) (Conn, error) {
	server := c.Val("server").String()
	port := c.Val("port").Int()
	db := c.Val("database").String()

	auth, err := addUser(c.Val("auth"))
	if err != nil {
		return nil, err
	} else if auth != "" {
		auth = auth + "@"
	}

	dsn := fmt.Sprintf("mongodb://%s%s:%d/%s", auth, server, port, db)

	opts := options.Client().ApplyURI(dsn)

	tls, err := addTLS(c.Val("tls"))
	if err != nil {
		return nil, err
	} else if tls != "" {
		dsn = tls
	}

	u, err := url.Parse(dsn + tls)
	if err != nil {
		return nil, err
	}
	tlsConfig, err := crypto.TLSConfigFromURL(u)
	if err != nil {
		return nil, err
	}

	if tlsConfig != nil {
		opts.TLSConfig = tlsConfig
	}

	conn, err := mongo.Connect(ctx, opts)
	if err != nil {
		return nil, err
	}
	return &mongoConn{conn}, nil
}

type mongoConn struct {
	*mongo.Client
}

func (c *mongoConn) Name() string {
	return ""
}

func (c *mongoConn) ID() string {
	return ""
}

func (c *mongoConn) Metadata() map[string]string {
	return map[string]string{}
}

func (c *mongoConn) As(i interface{}) bool {
	if vv, ok := i.(**mongo.Client); ok {
		*vv = c.Client
		return true
	}
	return false
}

func (c *mongoConn) Addr() string {
	return "mongodb"
}

func (c *mongoConn) Ping() error {
	return nil
}

func (c *mongoConn) Stats() map[string]interface{} {
	return map[string]interface{}{}
}

func (c *mongoConn) Close() error {
	return nil
}
