package config

import (
	"strings"
	"sync"

	"github.com/pydio/cells/v4/common/utils/configx"
)

type ProxySetter func(Store, interface{}, ...string) error

type ProxyGetter func(Store, ...string) configx.Values

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
	configx.Values
	setter  ProxySetter
	getter  ProxyGetter
	deleter ProxyDeleter
	store   Store
	path    []string
}

func Proxy(store Store) Store {
	return &proxy{Store: store}
}

func (p *proxy) Val(path ...string) configx.Values {
	key := strings.Join(path, "/")
	wrapped := false
	pVal := &proxyValues{Values: p.Store.Val(path...), store: p.Store, path: path}

	proxiesLocker.RLock()
	defer proxiesLocker.RUnlock()

	if setter, ok := proxiesSetters[key]; ok {
		pVal.setter = setter
		wrapped = true
	}
	if getter, ok := proxiesGetters[key]; ok {
		pVal.getter = getter
		wrapped = true
	}
	if deleter, ok := proxiesDeleters[key]; ok {
		pVal.deleter = deleter
		wrapped = true
	}
	if wrapped {
		return pVal
	}
	return p.Store.Val(path...)
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
