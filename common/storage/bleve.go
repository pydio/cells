package storage

import (
	"context"
	"strings"

	servercontext "github.com/pydio/cells/v4/common/server/context"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/storage/bleve"
)

var (
	_ Storage = (*bleveStorage)(nil)
)

func init() {
	storages = append(storages, &bleveStorage{})
}

type bleveStorage struct {
	dbs []*blevedb
}

type blevedb struct {
	db      bleve.Indexer
	service string
	tenant  string
}

func (s *bleveStorage) Provides(conn any) bool {
	if _, ok := conn.(bleve.Indexer); ok {
		return true
	}

	return false
}

func (s *bleveStorage) GetConn(str string) (any, bool) {
	if strings.HasPrefix(str, "bleve://") {
		index, err := bleve.NewIndexer(&bleve.BleveConfig{
			BlevePath:    strings.TrimPrefix(str, "bleve://"),
			RotationSize: bleve.DefaultRotationSize,
			BatchSize:    bleve.DefaultBatchSize,
		})
		if err != nil {
			return nil, false
		}

		return index, true
	}

	return nil, false
}

func (s *bleveStorage) Register(conn any, tenant string, service string) {
	s.dbs = append(s.dbs, &blevedb{
		db:      conn.(bleve.Indexer),
		tenant:  tenant,
		service: service,
	})
}

func (s *bleveStorage) Get(ctx context.Context, out interface{}) bool {
	if v, ok := out.(**bleve.Indexer); ok {
		for _, db := range s.dbs {
			if db.tenant == servercontext.GetTenant(ctx) && db.service == servicecontext.GetServiceName(ctx) {
				**v = db.db
				return true
			}
		}
	}

	return false
}
