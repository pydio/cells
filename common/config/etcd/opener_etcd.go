package etcd

import (
	"context"
	"encoding/json"
	"errors"
	"net/url"
	"os"
	"strconv"
	"strings"

	clientv3 "go.etcd.io/etcd/client/v3"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/utils/kv"
	"github.com/pydio/cells/v5/common/utils/kv/etcd"
)

const (
	etcdScheme = "etcd"
)

func init() {
	config.DefaultURLMux().Register(etcdScheme, &EtcdOpener{})
}

type EtcdOpener struct{}

func (o *EtcdOpener) Open(ctx context.Context, urlstr string, base config.Store) (config.Store, error) {
	urlstr = os.ExpandEnv(urlstr)

	u, err := url.Parse(urlstr)
	if err != nil {
		return nil, err
	}

	config := clientv3.Config{
		Endpoints: []string{u.Host},
	}

	if u.User != nil {
		config.Username = u.User.Username()
		if pwd, ok := u.User.Password(); ok {
			config.Password = pwd
		}
	}

	cli, err := clientv3.New(config)
	if err != nil {
		return nil, err
	}

	sessionTTL := -1
	if u.Query().Has("ttl") {
		if s, err := strconv.Atoi(u.Query().Get("ttl")); err != nil {
			return nil, errors.New("not a valid time to live")
		} else {
			sessionTTL = s
		}
	}

	m, err := etcd.NewStore(ctx, base.Val(), cli, strings.TrimLeft(u.Path, "/"), sessionTTL)
	if err != nil {
		return nil, err
	}

	rcvr, err := m.Watch()
	if err != nil {
		return nil, err
	}

	st := kv.NewStore()
	//w := watcher.NewWatcher
	st.Set(m.Get())

	go func() {
		for {
			_, err := rcvr.Next()
			if err != nil {
				continue
			}

			st.Set(m.Get())
		}
	}()

	// Watching remote store

	return &etcdStore{
		Store: st,
		m:     m,
	}, nil
}

type etcdStore struct {
	kv.Store

	m config.Store
}

func (e *etcdStore) Save(key string, value string) error {
	str, err := json.Marshal(e.Store.Val().Get())
	if err != nil {
		return err
	}

	if err := e.m.Val("").Set(str); err != nil {
		return err
	}

	return e.m.Save(key, value)
}
