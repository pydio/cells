package etcd

import (
	"context"
	"fmt"
	"net/url"

	clientv3 "go.etcd.io/etcd/client/v3"

	"github.com/pydio/cells/v5/common/config"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/kv"
)

const (
	etcdScheme = "etcd"
)

func init() {
	config.DefaultURLMux().Register(etcdScheme, &EtcdOpener{})
}

type EtcdOpener struct{}

func (o *EtcdOpener) Open(ctx context.Context, urlstr string) (config.Store, error) {
	u, err := url.Parse(urlstr)
	if err != nil {
		return nil, err
	}

	st := kv.NewStore()

	cli, err := clientv3.New(clientv3.Config{
		Endpoints: []string{u.Host},
	})

	if err != nil {
		return nil, err
	}

	return &etcdStore{
		cli:   cli,
		path:  u.Path,
		Store: st,
	}, nil
}

type etcdStore struct {
	cli  *clientv3.Client
	path string
	config.Store
}

func (s *etcdStore) Save(a string, b string) error {
	v := s.Store.Val().Get()

	// TODO - encoder here
	c, err := json.Marshal(v)
	if err != nil {
		return err
	}

	if resp, err := s.cli.Put(context.Background(), s.path, string(c)); err != nil {
		return err
	} else {
		fmt.Println(resp.PrevKv)
	}

	return nil
}
