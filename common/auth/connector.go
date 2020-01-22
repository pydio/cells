package auth

import (
	"github.com/dexidp/dex/connector"
	dlog "github.com/dexidp/dex/pkg/log"
	"github.com/golang/protobuf/proto"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
)

type Connector interface {
	ID() string
	Name() string
	Type() string
	Conn() connector.Connector
}

type OpenerFunc func(proto.Message) (Opener, error)

type Opener interface {
	Open(string, dlog.Logger) (connector.Connector, error)
}

var (
	connectorTypes = make(map[string]OpenerFunc)
	connectors     []Connector
)

// RegisterConnectorType registers how to set an opener for a connector type
func RegisterConnectorType(connType string, openerFunc OpenerFunc) {
	connectorTypes[connType] = openerFunc
}

// RegisterConnector to the auth registry and opens up the connection
func RegisterConnector(id, name, connectorType string, data proto.Message) {
	openerFunc, ok := connectorTypes[connectorType]
	if !ok {
		log.Warn("Could not retrieve opener func", zap.String("type", connectorType))
		return
	}

	opener, err := openerFunc(data)
	if err != nil {
		log.Warn("Could not retrieve opener")
		return
	}

	c, err := opener.Open(id, nil)
	if err != nil {
		log.Warn("Could not open connector", zap.Error(err))
		return
	}

	connectors = append(connectors, &conn{
		id:            id,
		name:          name,
		connectorType: connectorType,
		conn:          c,
	})
}

// GetConnectors list all the connectors correctly configured
func GetConnectors() []Connector {
	return connectors
}

type connType struct {
	opener func(proto.Message) (Opener, error)
}

func (c *connType) Opener() func(proto.Message) (Opener, error) {
	return c.opener
}

type conn struct {
	id            string
	name          string
	connectorType string
	conn          connector.Connector
}

func (c *conn) ID() string {
	return c.id
}

func (c *conn) Name() string {
	return c.name
}

func (c *conn) Type() string {
	return c.connectorType
}

func (c *conn) Conn() connector.Connector {
	return c.conn
}
