package storage

import (
	"context"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"go.etcd.io/bbolt"
)

var (
	_ Storage = (*boltdbStorage)(nil)
)

func init() {
	storages = append(storages, &boltdbStorage{})
}

type boltdbStorage struct {
	dbs []*boltdb
}

type boltdb struct {
	db      *bbolt.DB
	service string
	tenant  string
}

func (s *boltdbStorage) Provides(conn any) bool {
	if _, ok := conn.(*bbolt.DB); ok {
		return true
	}

	return false
}

func (s *boltdbStorage) Register(conn any, tenant string, service string) {
	s.dbs = append(s.dbs, &boltdb{
		db:      conn.(*bbolt.DB),
		tenant:  tenant,
		service: service,
	})
}

func (s *boltdbStorage) Get(ctx context.Context, out interface{}) bool {
	if v, ok := out.(**bbolt.DB); ok {
		for _, db := range s.dbs {
			if db.tenant == servercontext.GetTenant(ctx) && db.service == servicecontext.GetServiceName(ctx) {
				*v = db.db
				return true
			}
		}
	}

	return false
}
