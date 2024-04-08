package mongo

import (
	"context"
	"net/url"
	"strings"

	"github.com/pborman/uuid"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/pydio/cells/v4/common/dao/mongodb"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/storage"
)

var (
	mongoTypes = []string{mongodb.Driver}

	_ storage.Storage = (*mongoStorage)(nil)
)

func init() {
	ms := &mongoStorage{}
	for _, mongoType := range mongoTypes {
		storage.DefaultURLMux().Register(mongoType, ms)
	}
}

type mongoStorage struct {
	clients []*mongoClient
}

func (o *mongoStorage) OpenURL(ctx context.Context, u *url.URL) (storage.Storage, error) {
	// First we check if the connection is already used somewhere
	//for _, client := range o.clients {
	//	client.client.
	//	if db.db.Path() == u.Path {
	//		o.Register(db, "", "")
	//		return o, nil
	//	}
	//}

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(u.String()))
	if err != nil {
		return nil, err
	}

	// register the conn for future usage
	o.Register(client, "", "")

	return o, nil
}

type mongoClient struct {
	client  *mongo.Client
	service string
	tenant  string
}

func (s *mongoStorage) Provides(conn any) bool {
	if _, ok := conn.(*mongo.Client); ok {
		return true
	}

	return false
}

func (s *mongoStorage) Register(conn any, tenant string, service string) {
	s.clients = append(s.clients, &mongoClient{
		client:  conn.(*mongo.Client),
		tenant:  tenant,
		service: service,
	})
}

func (s *mongoStorage) GetConn(str string) (storage.Conn, error) {
	for _, mongoType := range mongoTypes {
		if strings.HasPrefix(str, mongoType) {
			client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(str))
			if err != nil {
				return nil, err
			}

			return (*mongoItem)(client), nil
		}
	}

	return nil, nil
}

func (s *mongoStorage) Get(ctx context.Context, out interface{}) bool {
	if v, ok := out.(**mongo.Client); ok {
		for _, client := range s.clients {
			if client.tenant == servercontext.GetTenant(ctx) && client.service == servicecontext.GetServiceName(ctx) {
				*v = client.client
				return true
			}
		}
	}

	return false
}

type mongoItem mongo.Client

func (i *mongoItem) Name() string {
	return "mongo"
}

func (i *mongoItem) ID() string {
	return uuid.New()
}

func (i *mongoItem) Metadata() map[string]string {
	return map[string]string{}
}

func (i *mongoItem) As(i2 interface{}) bool {
	return false
}

func (i *mongoItem) Driver() string {
	return "mongo"
}

func (i *mongoItem) DSN() string {
	return "TODO"
}
