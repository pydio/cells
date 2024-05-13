package boltdb

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"go.etcd.io/bbolt"

	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var (
	_ storage.Storage = (*boltdbStorage)(nil)
)

func init() {
	storage.DefaultURLMux().Register("boltdb", &boltdbStorage{})
}

type boltdbStorage struct {
	template openurl.Template
	dbs      []*boltdb
}

func (s *boltdbStorage) OpenURL(ctx context.Context, urlstr string) (storage.Storage, error) {
	t, err := openurl.URLTemplate(urlstr)
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

func (s *boltdbStorage) Get(ctx context.Context, out interface{}) (bool, error) {
	if v, ok := out.(**bbolt.DB); ok {

		u, err := s.template.ResolveURL(ctx)
		if err != nil {
			return true, err
		}
		path := u.String()

		for _, db := range s.dbs {
			if db.path == path {
				*v = db.db
				return true, nil
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
			return true, err
		}

		*v = conn

		s.dbs = append(s.dbs, &boltdb{
			db:   conn,
			path: path,
		})

		return true, nil

	}

	return false, nil
}

func (s *boltdbStorage) CloseConns(ctx context.Context, clean ...bool) (er error) {
	for _, db := range s.dbs {
		fsPath := db.db.Path()
		fmt.Println("closing " + db.path)
		if er := db.db.Close(); er != nil {
			return er
		}
		if len(clean) > 0 && clean[0] {
			fmt.Println("removing " + fsPath)
			if e := os.RemoveAll(db.db.Path()); e != nil {
				return e
			}
		}
	}
	return nil
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
