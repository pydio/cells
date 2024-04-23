package config

import (
	"context"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

var (
	_ storage.Storage = (*configStorage)(nil)
)

func init() {
	st := &configStorage{}
	for _, scheme := range config.DefaultURLMux().Schemes() {
		storage.DefaultURLMux().Register(scheme, st)
	}
}

type configStorage struct {
	template openurl.Template
	dbs      []*storedb
}

type storedb struct {
	path string
	db   config.Store
}

func (o *configStorage) OpenURL(ctx context.Context, urlstr string) (storage.Storage, error) {
	t, err := openurl.URLTemplate(urlstr)
	if err != nil {
		return nil, err
	}

	return &configStorage{
		template: t,
	}, nil
}

type configStore struct {
	store   config.Store
	service string
	tenant  string
}

func (s *configStorage) Provides(conn any) bool {
	if _, ok := conn.(*config.Store); ok {
		return true
	}

	return false
}

func (s *configStorage) GetConn(str string) (storage.Conn, error) {
	return nil, nil
}

func (s *configStorage) Register(conn any, tenant string, service string) {

}

func (s *configStorage) Get(ctx context.Context, out interface{}) bool {
	if v, ok := out.(*config.Store); ok {
		u, err := s.template.ResolveURL(ctx)
		if err != nil {
			return false
		}
		path := u.String()

		for _, db := range s.dbs {
			if path == db.path {
				*v = db.db
				return true
			}
		}

		// Not found, opening
		db, err := config.OpenStore(ctx, path)
		if err != nil {
			return false
		}

		*v = db

		s.dbs = append(s.dbs, &storedb{
			db:   db,
			path: path,
		})

	}

	return false
}

//type configItem config.Store
//
//func (i *configItem) Name() string {
//	return "boltdb"
//}
//
//func (i *configItem) ID() string {
//	return uuid.New()
//}
//
//func (i *configItem) Metadata() map[string]string {
//	return map[string]string{}
//}
//
//func (i *configItem) As(i2 interface{}) bool {
//	return false
//}
//
//func (i *configItem) Driver() string {
//	return "boltdb"
//}
//
//func (i *configItem) DSN() string {
//	return (*bbolt.DB)(i).Path()
//}
