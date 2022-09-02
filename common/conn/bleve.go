package conn

import (
	"context"
	"github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/index/scorch"
	"github.com/blevesearch/bleve/v2/index/upsidedown/store/boltdb"
	"github.com/pydio/cells/v4/common/utils/configx"
	"os"
)

func init() {
	RegisterConnProvider("bleve", newBleveConn)
}

func newBleveConn(ctx context.Context, c configx.Values) (Conn, error) {
	file := c.Val("dsn").String()

	var index bleve.Index
	var err error

	_, err = os.Stat(file)
	if os.IsNotExist(err) {
		index, err = bleve.NewUsing(file, bleve.NewIndexMapping(), scorch.Name, boltdb.Name, nil)
	} else {
		index, err = bleve.Open(file)
	}

	if err != nil {
		return nil, err
	}

	return &bleveConn{
		Index: index,
	}, nil
}

type bleveConn struct {
	bleve.Index
}

func (c *bleveConn) As(i interface{}) bool {
	if vv, ok := i.(*bleve.Index); ok {
		*vv = c.Index
		return true
	}
	return false
}

func (c *bleveConn) Addr() string {
	return "bleve"
}

func (c *bleveConn) Ping() error {
	return nil
}

func (c *bleveConn) Stats() map[string]interface{} {
	return c.Index.StatsMap()
}

func (c *bleveConn) Close() error {
	return nil
}
