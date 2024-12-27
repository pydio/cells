package viper

import (
	"context"
	"fmt"
	"net/url"

	"github.com/spf13/viper"
	clientv3 "go.etcd.io/etcd/client/v3"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/utils/configx"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
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

	var opts []configx.Option

	//encode := u.Query().Get("encode")
	//switch encode {
	//case "string":
	//	opts = append(opts, configx.WithString())
	//case "yaml":
	//	opts = append(opts, configx.WithYAML())
	//case "json":
	//	opts = append(opts, configx.WithJSON())
	//default:
	//	opts = append(opts, configx.WithJSON())
	//}
	//
	//if master := u.Query().Get("masterKey"); master != "" {
	//
	//	enc, err := crypto.NewVaultCipher(master)
	//	if err != nil {
	//		return nil, err
	//	}
	//	opts = append(opts, configx.WithEncrypt(enc), configx.WithDecrypt(enc))
	//}
	//
	//if data := u.Query().Get("data"); data != "" {
	//	opts = append(opts, configx.WithInitData([]byte(data)))
	//}

	v := viper.NewWithOptions(viper.KeyDelimiter(delimiter))
	//v.SetConfigFile(u.Path)
	//v.AddConfigPath(filepath.Dir(u.Path))
	//v.ReadInConfig()

	store := newViper(v, opts...)

	//envPrefix := u.Query().Get("env")
	//if envPrefix != "" {
	//	envPrefixU := strings.ToUpper(envPrefix)
	//	env := os.Environ()
	//	for _, v := range env {
	//		if strings.HasPrefix(v, envPrefixU) {
	//			vv := strings.SplitN(v, "=", 2)
	//			if len(vv) == 2 {
	//				k := strings.TrimPrefix(vv[0], envPrefixU)
	//				//k = strings.ReplaceAll(k, "_", "/")
	//				//k = strings.ToLower(k)
	//
	//				msg, err := strconv.Unquote(vv[1])
	//				if err != nil {
	//					msg = vv[1]
	//				}
	//
	//				var m any
	//				if err := json.Unmarshal([]byte(msg), &m); err != nil {
	//					store.Val(k).Set(msg)
	//				} else {
	//					store.Val(k).Set(m)
	//				}
	//			}
	//		}
	//	}
	//}

	//store = config.NewStoreWithReferencePool(store, config.ReferencePoolFromURL(ctx, u))

	cli, err := clientv3.New(clientv3.Config{
		Endpoints: []string{u.Host},
	})

	return &etcdStore{
		cli:   cli,
		path:  u.Path,
		Store: store,
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
