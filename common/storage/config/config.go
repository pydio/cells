package config

import (
	"context"
	"net/url"
	"sync"

	"go.etcd.io/bbolt"

	"github.com/pydio/cells/v4/common/config"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/storage"
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
	stores map[string]configStore
	once   sync.Once
}

func (o *configStorage) init() {
	o.once.Do(func() {
		o.stores = make(map[string]configStore)
	})
}

func (o *configStorage) OpenURL(ctx context.Context, u *url.URL) (storage.Storage, error) {
	o.init()

	// First we check if the connection is already used somewhere
	if store, ok := o.stores[u.Path]; ok {
		o.stores[u.Path] = configStore{
			store:   store.store,
			service: "",
			tenant:  "",
		}
	}

	conn, err := config.OpenStore(ctx, u.String())
	if err != nil {
		return nil, err
	}

	o.stores[u.Path] = configStore{
		store: conn.(config.Store),
	}

	return o, nil
}

type configStore struct {
	store   config.Store
	service string
	tenant  string
}

func (s *configStorage) Provides(conn any) bool {
	if _, ok := conn.(*bbolt.DB); ok {
		return true
	}

	return false
}

func (s *configStorage) GetConn(str string) (storage.Conn, error) {
	//if strings.HasPrefix(str, "boltdb") {
	//	options := bbolt.DefaultOptions
	//	options.Timeout = 5 * time.Second
	//
	//	conn, err := bbolt.Open(strings.TrimPrefix(str, "boltdb://"), 0644, options)
	//	if err != nil {
	//		return nil, err
	//	}
	//
	//	return nil, nil
	//}

	return nil, nil
}

func (s *configStorage) Register(conn any, tenant string, service string) {

}

func (s *configStorage) Get(ctx context.Context, out interface{}) bool {
	if v, ok := out.(*config.Store); ok {
		for _, db := range s.stores {
			if db.tenant == servercontext.GetTenant(ctx) && db.service == servicecontext.GetServiceName(ctx) {
				*v = db.store
				return true
			}
		}
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
