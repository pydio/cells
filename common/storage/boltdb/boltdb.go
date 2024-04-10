package boltdb

import (
	"context"
	"net/url"
	"strings"
	"text/template"
	"time"

	"go.etcd.io/bbolt"

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
	template *template.Template
	dbs      []*boltdb
}

func (o *boltdbStorage) OpenURL(ctx context.Context, urlstr string) (storage.Storage, error) {
	t, err := template.New("storage").Parse(urlstr)
	if err != nil {
		return nil, err
	}

	return &boltdbStorage{
		template: t,
	}, nil
}

type boltdb struct {
	path string
	db   *bbolt.DB
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
}

func (s *boltdbStorage) Get(ctx context.Context, out interface{}) bool {
	if v, ok := out.(**bbolt.DB); ok {
		pathBuilder := &strings.Builder{}
		if err := s.template.Execute(pathBuilder, ctx); err != nil {
			return false
		}

		path := pathBuilder.String()

		u, err := url.Parse(path)
		if err != nil {
			return false
		}

		for _, db := range s.dbs {
			if db.path == path {
				*v = db.db
				return true
			}
		}

		// If not found, create one
		options := bbolt.DefaultOptions
		options.Timeout = 5 * time.Second

		q := u.Query()
		if q.Has("timeout") {
			if timeout, err := time.ParseDuration(q.Get("timeout")); err != nil {
				options.Timeout = timeout
			}
		}

		conn, err := bbolt.Open(strings.TrimPrefix(path, "boltdb://"), 0644, options)
		if err != nil {
			return false
		}

		*v = conn

		s.dbs = append(s.dbs, &boltdb{
			db:   conn,
			path: path,
		})

		return true

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
