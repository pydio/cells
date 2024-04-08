package mem

import (
	"context"
	"net/url"

	"go.etcd.io/bbolt"

	"github.com/pydio/cells/v4/common/storage"
)

var (
	_ storage.Storage = (*memStorage)(nil)
)

func init() {
	storage.DefaultURLMux().Register("mem", &memStorage{})
}

type memStorage struct{}

func (o *memStorage) OpenURL(ctx context.Context, u *url.URL) (storage.Storage, error) {
	return o, nil
}

type boltdb struct {
	db      *bbolt.DB
	service string
	tenant  string
}

func (s *memStorage) Provides(conn any) bool {
	if _, ok := conn.(*bbolt.DB); ok {
		return true
	}

	return false
}

func (s *memStorage) GetConn(str string) (storage.Conn, error) {
	return nil, nil
}

func (s *memStorage) Register(conn any, tenant string, service string) {
}

func (s *memStorage) Get(ctx context.Context, out interface{}) bool {
	if v, ok := out.(*storage.Conn); ok {
		*v = &boltItem{}
		return true
	}
	return false
}

type boltItem struct{}

func (i *boltItem) Name() string {
	return "mem"
}

func (i *boltItem) ID() string {
	return ""
}

func (i *boltItem) Metadata() map[string]string {
	return map[string]string{}
}

func (i *boltItem) As(i2 interface{}) bool {
	return false
}

func (i *boltItem) Driver() string {
	return "mem"
}

func (i *boltItem) DSN() string {
	return ""
}
