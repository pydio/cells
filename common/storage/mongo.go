package storage

import (
	"context"
	"strings"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/pydio/cells/v4/common/dao/mongodb"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
)

var (
	mongoTypes = []string{mongodb.Driver}

	_ Storage = (*mongoStorage)(nil)
)

func init() {
	storages = append(storages, &mongoStorage{})
}

type mongoStorage struct {
	clients []*mongoClient
}

type mongoClient struct {
	client  *mongo.Client
	service string
	tenant  string
}

func newMongoStorage() Storage {
	return &mongoStorage{}
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

func (s *mongoStorage) GetConn(str string) (any, bool) {
	for _, mongoType := range mongoTypes {
		if strings.HasPrefix(str, mongoType) {
			client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(str))
			if err != nil {
				return nil, false
			}

			return client, true
		}
	}

	return nil, false
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
