package config

import (
	"context"
	"os"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

var (
	_ storage.Storage = (*configStorage)(nil)
)

func init() {
	runtime.Register("system", func(ctx context.Context) {
		var mgr manager.Manager
		if runtimecontext.Get(ctx, manager.ContextKey, &mgr) {
			return
		}

		st := &configStorage{}
		for _, scheme := range config.DefaultURLMux().Schemes() {

			mgr.RegisterStorage(scheme, st)
		}
	})
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

func (s *configStorage) CloseConns(ctx context.Context, clean ...bool) error {
	for _, db := range s.dbs {
		if er := db.db.Close(); er != nil {
			return er
		}
		if len(clean) > 0 && clean[0] {
			if e := os.RemoveAll(db.path); e != nil {
				return e
			}
		}
	}
	return nil
}

func (s *configStorage) Get(ctx context.Context, out interface{}) (bool, error) {
	if v, ok := out.(*config.Store); ok {
		u, err := s.template.ResolveURL(ctx)
		if err != nil {
			return true, err
		}
		path := u.String()

		for _, db := range s.dbs {
			if path == db.path {
				*v = db.db
				return true, nil
			}
		}

		// Not found, opening
		db, err := config.OpenStore(ctx, path)
		if err != nil {
			return true, err
		}

		*v = db

		s.dbs = append(s.dbs, &storedb{
			db:   db,
			path: path,
		})

		return true, nil
	}

	return false, nil
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
