package boltdb

import (
	"context"
	"net/url"
	"strings"
	"time"

	"go.etcd.io/bbolt"

	servercontext "github.com/pydio/cells/v4/common/server/context"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var (
	_ storage.Storage = (*boltdbStorage)(nil)
)

func init() {
	storage.DefaultURLMux().Register("boltdb", &boltdbStorage{})
}

type boltdbStorage struct {
	dbs []*boltdb
}

func (o *boltdbStorage) OpenURL(ctx context.Context, u *url.URL) (storage.Storage, error) {
	// First we check if the connection is already used somewhere
	for _, db := range o.dbs {
		if db.db.Path() == u.Path {
			o.Register(db.db, "", "")
			return o, nil
		}
	}

	q := u.Query()

	options := bbolt.DefaultOptions
	options.Timeout = 5 * time.Second

	if q.Has("timeout") {
		if timeout, err := time.ParseDuration(q.Get("timeout")); err != nil {
			options.Timeout = timeout
		}
	}

	conn, err := bbolt.Open(u.Path, 0644, options)
	if err != nil {
		return nil, err
	}

	// register the conn for future usage
	o.Register(conn, "", "")

	return o, nil
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

func (s *boltdbStorage) GetConn(str string) (storage.Conn, error) {
	if strings.HasPrefix(str, "boltdb") {
		options := bbolt.DefaultOptions
		options.Timeout = 5 * time.Second

		conn, err := bbolt.Open(strings.TrimPrefix(str, "boltdb://"), 0644, options)
		if err != nil {
			return nil, err
		}

		return (*boltItem)(conn), nil
	}

	return nil, nil
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

type boltItem bbolt.DB

func (i *boltItem) Name() string {
	return "boltdb"
}

func (i *boltItem) ID() string {
	return uuid.New()
}

func (i *boltItem) Metadata() map[string]string {
	return map[string]string{}
}

func (i *boltItem) As(i2 interface{}) bool {
	return false
}

func (i *boltItem) Driver() string {
	return "boltdb"
}

func (i *boltItem) DSN() string {
	return (*bbolt.DB)(i).Path()
}
