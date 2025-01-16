package etcd

import (
	"context"
	"errors"
	"net/url"
	"strconv"
	"strings"

	clientv3 "go.etcd.io/etcd/client/v3"

	"github.com/pydio/cells/v5/common/config"
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
	u, err := url.Parse(urlstr)
	if err != nil {
		return nil, err
	}

	cli, err := clientv3.New(clientv3.Config{
		Endpoints: []string{u.Host},
	})

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

	return m, nil
}
