package viper

import (
	"context"
	"net/url"

	"github.com/spf13/viper"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/crypto"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/kv"
	"github.com/pydio/cells/v5/common/utils/watch"
)

const (
	memScheme = "mem"
)

func init() {
	config.DefaultURLMux().Register(memScheme, &MemOpener{})
}

type MemOpener struct{}

func (o *MemOpener) Open(ctx context.Context, urlstr string) (config.Store, error) {

	u, err := url.Parse(urlstr)
	if err != nil {
		return nil, err
	}

	var opts []configx.Option

	encode := u.Query().Get("encode")
	switch encode {
	case "string":
		opts = append(opts, configx.WithString())
	case "yaml":
		opts = append(opts, configx.WithYAML())
	case "json":
		opts = append(opts, configx.WithJSON())
	default:
		opts = append(opts, configx.WithJSON())
	}

	if master := u.Query().Get("masterKey"); master != "" {
		enc, err := crypto.NewVaultCipher(master)
		if err != nil {
			return nil, err
		}
		opts = append(opts, configx.WithEncrypt(enc), configx.WithDecrypt(enc))
	}

	//if data := u.Query().Get("data"); data != "" {
	//	opts = append(opts, configx.WithInitData([]byte(data)))
	//}

	store := kv.NewStore()
	//store := newViper(viper.NewWithOptions(viper.KeyDelimiter(delimiter)), opts...)

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

	options := &configx.Options{}
	for _, opt := range opts {
		opt(options)
	}

	store = &storeWithEncoder{Store: store, Unmarshaler: options.Unmarshaler}

	return &memStore{
		Store: store,
		clone: func(store config.Store) config.Store {
			return store
		},
	}, nil
}

type memStore struct {
	config.Store

	clone func(config.Store) config.Store
}

func (m *memStore) Save(string, string) error {
	return nil
}

func (m *memStore) Watch(opts ...watch.WatchOption) (watch.Receiver, error) {
	wo := &watch.WatchOptions{}
	for _, o := range opts {
		o(wo)
	}

	r, err := m.Store.Watch(opts...)
	if err != nil {
		return nil, err
	}

	if wo.ChangesOnly {
		return &receiverWithStoreChangesOnly{
			Receiver: r,
			Values:   m.clone(newViper(viper.NewWithOptions(viper.KeyDelimiter(delimiter)))).Val(),
			level:    len(wo.Path),
		}, nil
	} else {
		return &receiverWithStore{
			Receiver: r,
			Values:   m.clone(newViper(viper.NewWithOptions(viper.KeyDelimiter(delimiter)))).Val(),
		}, nil
	}
}
