package config

import (
	"context"
	"encoding/json"
	"net/url"
	"os"
	"strconv"
	"strings"

	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/openurl"
	"github.com/pydio/cells/v5/common/utils/watch"
)

// URLOpener represents types than can open Registries based on a URL.
// The opener must not modify the URL argument. OpenURL must be safe to
// call from multiple goroutines.
//
// This interface is generally implemented by types in driver packages.
type URLOpener interface {
	Open(ctx context.Context, urlstr string) (Store, error)
}

// URLMux is a URL opener multiplexer. It matches the scheme of the URLs
// against a set of registered schemes and calls the opener that matches the
// URL's scheme.
// See https://gocloud.dev/concepts/urls/ for more information.
//
// The zero value is a multiplexer with no registered schemes.
type URLMux struct {
	schemes openurl.SchemeMap
}

// Schemes returns a sorted slice of the registered schemes.
func (mux *URLMux) Schemes() []string { return mux.schemes.Schemes() }

// ValidScheme returns true if scheme has been registered.
func (mux *URLMux) ValidScheme(scheme string) bool { return mux.schemes.ValidScheme(scheme) }

// Register registers the opener with the given scheme. If an opener
// already exists for the scheme, Register panics.
func (mux *URLMux) Register(scheme string, opener URLOpener) {
	mux.schemes.Register("config", "Config", scheme, opener)
}

// OpenStore calls OpenURL with the URL parsed from urlstr.
// OpenStore is safe to call from multiple goroutines.
func (mux *URLMux) OpenStore(ctx context.Context, urlstr string) (Store, error) {
	opener, _, err := mux.schemes.FromString("Config", urlstr)
	if err != nil {
		return nil, err
	}
	return opener.(URLOpener).Open(ctx, urlstr)
}

var defaultURLMux = &URLMux{}

// DefaultURLMux returns the URLMux used by OpenTopic and OpenSubscription.
//
// Driver packages can use this to register their TopicURLOpener and/or
// SubscriptionURLOpener on the mux.
func DefaultURLMux() *URLMux {
	return defaultURLMux
}

// OpenStore opens the Store identified by the URL given.
// See the URLOpener documentation in driver subpackages for
// details on supported URL formats, and https://gocloud.dev/concepts/urls
// for more information.
func OpenStore(ctx context.Context, urlstr string) (Store, error) {
	u, err := url.Parse(urlstr)
	if err != nil {
		return nil, err
	}

	st, err := defaultURLMux.OpenStore(ctx, urlstr)
	if err != nil {
		return nil, err
	}

	//st = NewStoreWithReferencePool(st, PoolFromURL(ctx, u, OpenStore))

	opts := configx.Options{}

	encode := u.Query().Get("encode")
	switch encode {
	case "string":
		configx.WithString()(&opts)
	case "yaml":
		configx.WithYAML()(&opts)
	case "json":
		configx.WithJSON()(&opts)
	default:
		configx.WithJSON()(&opts)
	}

	if opts.Unmarshaler != nil {
		st = &storeWithEncoder{Store: st, Unmarshaler: opts.Unmarshaler, Marshaller: opts.Marshaller}
	}

	if data := u.Query().Get("data"); data != "" {
		if err := st.Set(data); err != nil {
			return nil, err
		}
	}

	envPrefix := u.Query().Get("env")
	if envPrefix != "" {
		envPrefixU := strings.ToUpper(envPrefix)
		env := os.Environ()
		for _, v := range env {
			if strings.HasPrefix(v, envPrefixU) {
				vv := strings.SplitN(v, "=", 2)
				if len(vv) == 2 {
					k := strings.TrimPrefix(vv[0], envPrefixU)
					//k = strings.ReplaceAll(k, "_", "/")
					//k = strings.ToLower(k)

					msg, err := strconv.Unquote(vv[1])
					if err != nil {
						msg = vv[1]
					}

					var m any
					if err := json.Unmarshal([]byte(msg), &m); err != nil {
						if err := st.Val(k).Set(msg); err != nil {
							return nil, err
						}
					} else {
						if err := st.Val(k).Set(m); err != nil {
							return nil, err
						}
					}
				}
			}
		}
	}

	return &store{
		Store: st,
	}, nil
}

type store struct {
	Store
}

func (s *store) Watch(opts ...watch.WatchOption) (watch.Receiver, error) {
	wo := &watch.WatchOptions{}
	for _, o := range opts {
		o(wo)
	}

	r, err := s.Store.Watch(opts...)
	if err != nil {
		return nil, err
	}

	if wo.ChangesOnly {
		return &receiverWithStoreChangesOnly{
			Receiver: r,
			Values:   s.Val(),
			level:    len(wo.Path),
		}, nil
	} else {
		return &receiverWithStore{
			Receiver: r,
			Values:   s.Val(),
		}, nil
	}
}
