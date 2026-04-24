package config

import (
	"context"
	"strings"
	"sync"

	"github.com/pydio/cells/v5/common/utils/kv"
)

type ProxySetter func(Store, interface{}, ...string) error

type ProxyGetter func(Store, ...string) kv.Values

type ProxyDeleter func(Store, ...string) error

var (
	proxiesSetters  = map[string]ProxySetter{}
	proxiesGetters  = map[string]ProxyGetter{}
	proxiesDeleters = map[string]ProxyDeleter{}
	proxiesLocker   *sync.RWMutex
)

func init() {
	proxiesLocker = &sync.RWMutex{}
}

func RegisterProxy(key string, interceptors ...interface{}) {
	proxiesLocker.Lock()
	defer proxiesLocker.Unlock()

	for _, interceptor := range interceptors {
		switch v := interceptor.(type) {
		case ProxySetter:
			proxiesSetters[key] = v
		case ProxyGetter:
			proxiesGetters[key] = v
		case ProxyDeleter:
			proxiesDeleters[key] = v
		}
	}
}

type proxy struct {
	Store
}

type proxyValues struct {
	kv.Values
	setter  ProxySetter
	getter  ProxyGetter
	deleter ProxyDeleter
	store   Store
	path    []string
}

func Proxy(store Store) Store {
	return &proxy{Store: store}
}

func (p *proxy) Context(ctx context.Context) kv.Values {
	return &proxyValues{Values: p.Store.Context(ctx), store: p.Store}
}

func (p *proxy) Default(d any) kv.Values {
	return &proxyValues{Values: p.Store.Default(d), store: p.Store}
}

func (p *proxy) Val(path ...string) kv.Values {
	return wrapProxyValue(p.Store.Val(path...), p.Store, path)
}

func wrapProxyValue(values kv.Values, store Store, path []string) kv.Values {
	key := strings.Join(path, "/")
	pVal := &proxyValues{Values: values, store: store, path: path}

	proxiesLocker.RLock()
	defer proxiesLocker.RUnlock()

	if setter, ok := proxiesSetters[key]; ok {
		pVal.setter = setter
	}
	if getter, ok := proxiesGetters[key]; ok {
		pVal.getter = getter
	}
	if deleter, ok := proxiesDeleters[key]; ok {
		pVal.deleter = deleter
	}
	return pVal
}

func (p *proxyValues) Context(ctx context.Context) kv.Values {
	return &proxyValues{Values: p.Values.Context(ctx), store: p.store, path: p.path, setter: p.setter, getter: p.getter, deleter: p.deleter}
}

func (p *proxyValues) Default(d any) kv.Values {
	return &proxyValues{Values: p.Values.Default(d), store: p.store, path: p.path, setter: p.setter, getter: p.getter, deleter: p.deleter}
}

func (p *proxyValues) Val(path ...string) kv.Values {
	nextPath := append(append([]string{}, p.path...), path...)
	return wrapProxyValue(p.Values.Val(path...), p.store, nextPath)
}

func (p *proxyValues) Set(value interface{}) error {
	if p.setter != nil {
		return p.setter(p.store, value, p.path...)
	}
	return p.Values.Set(value)
}

func (p *proxyValues) Get() any {
	if p.getter != nil {
		return p.getter(p.store, p.path...)
	}
	return p.Values.Get()
}

func (p *proxyValues) Del() error {
	if p.deleter != nil {
		return p.deleter(p.store, p.path...)
	}
	return p.Values.Del()
}
