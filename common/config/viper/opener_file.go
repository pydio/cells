package viper

import (
	"context"
	"errors"
	"net/url"
	"os"
	"path/filepath"

	"github.com/spf13/afero"
	"github.com/spf13/viper"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/utils/filex"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/kv"
	"github.com/pydio/cells/v5/common/utils/watch"
)

const (
	fileScheme = "file"
)

func init() {
	config.DefaultURLMux().Register(fileScheme, &FileOpener{})
}

type FileOpener struct{}

func (o *FileOpener) Open(ctx context.Context, urlstr string) (config.Store, error) {

	u, err := url.Parse(urlstr)
	if err != nil {
		return nil, err
	}

	//var opts []configx.Option

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

	//v := viper.NewWithOptions(viper.KeyDelimiter(delimiter))
	//v.SetConfigFile(u.Path)
	//v.AddConfigPath(filepath.Dir(u.Path))
	//v.ReadInConfig()
	//
	//store := newViper(v, opts...)
	//
	//clone := func(store config.Store) config.Store {
	//	return newStoreWithRefPool(store, config.PoolFromURL(ctx, u, func(ctx context.Context, urlstr string) (config.Store, error) {
	//		u, err := url.Parse(urlstr)
	//		if err != nil {
	//			return nil, err
	//		}
	//
	//		var v Viper
	//		v = viper.NewWithOptions(viper.KeyDelimiter(delimiter))
	//		v.SetConfigFile(u.Path)
	//		v.AddConfigPath(filepath.Dir(u.Path))
	//		v.ReadInConfig()
	//
	//		return nil, nil
	//	}))
	//}
	//
	//store = clone(store)

	store := kv.NewStore()

	var a any
	b, err := filex.Read(u.Path)
	if err != nil {
		return nil, err
	}

	if len(b) > 0 {
		if err := json.Unmarshal(b, &a); err != nil {
			return nil, err
		}

		if err := store.Set(a); err != nil {
			return nil, err
		}
	}

	clone := func(config.Store) config.Store {
		return store
	}

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

	return &fileStore{
		fs:    afero.NewOsFs(),
		path:  u.Path,
		Store: store,
		clone: clone,
	}, nil
}

type fileStore struct {
	fs   afero.Fs
	path string
	config.Store

	clone func(config.Store) config.Store
}

func (f *fileStore) Watch(opts ...watch.WatchOption) (watch.Receiver, error) {
	wo := &watch.WatchOptions{}
	for _, o := range opts {
		o(wo)
	}

	r, err := f.Store.Watch(opts...)
	if err != nil {
		return nil, err
	}

	if wo.ChangesOnly {
		return &receiverWithStoreChangesOnly{
			Receiver: r,
			Values:   f.clone(newViper(viper.New())).Val(),
			level:    len(wo.Path),
		}, nil
	} else {
		return &receiverWithStore{
			Receiver: r,
			Values:   f.clone(newViper(viper.New())).Val(),
		}, nil
	}
}

func (f *fileStore) Save(a string, b string) error {
	v := f.Store.Val().Get()

	c, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return err
	}

	if err := f.fs.MkdirAll(filepath.Dir(f.path), os.ModePerm); err != nil {
		return err
	}

	fh, err := f.fs.OpenFile(f.path, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		return err
	}

	n, err := fh.Write(c)
	if err != nil {
		return err
	}

	if n == 0 {
		return errors.New("no bytes written")
	}

	return nil
}
