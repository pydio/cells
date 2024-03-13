package storage

import (
	"context"
	"strings"
	"time"

	"go.etcd.io/bbolt"

	servercontext "github.com/pydio/cells/v4/common/server/context"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
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

func (s *boltdbStorage) GetConn(str string) (any, bool) {
	if strings.HasPrefix(str, "boltdb") {
		options := bbolt.DefaultOptions
		options.Timeout = 5 * time.Second

		conn, err := bbolt.Open(strings.TrimPrefix(str, "boltdb://"), 0644, options)
		if err != nil {
			return nil, false
		}

		return conn, true
	}

	return nil, false
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
