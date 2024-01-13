package storage

import (
	"context"
	"github.com/blevesearch/bleve/v2"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
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
	db      bleve.Index
	service string
	tenant  string
}

func (s *bleveStorage) Provides(conn any) bool {
	if _, ok := conn.(bleve.Index); ok {
		return true
	}

	return false
}

func (s *bleveStorage) Register(conn any, tenant string, service string) {
	s.dbs = append(s.dbs, &blevedb{
		db:      conn.(bleve.Index),
		tenant:  tenant,
		service: service,
	})
}

func (s *bleveStorage) Get(ctx context.Context, out interface{}) bool {
	if v, ok := out.(*bleve.Index); ok {
		for _, db := range s.dbs {
			if db.tenant == servercontext.GetTenant(ctx) && db.service == servicecontext.GetServiceName(ctx) {
				*v = db.db
				return true
			}
		}
	}

	return false
}
