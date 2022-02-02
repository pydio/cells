package cache

import (
	"strings"
	"time"

	pm "github.com/patrickmn/go-cache"
)

type Short interface {
	Get(key string) (value interface{}, ok bool)
	Set(key string, value interface{})
	SetWithExpiry(key string, value interface{}, duration time.Duration)
	Delete(k string)
	Reset() error
	KeysByPrefix(prefix string) ([]string, error)
	Iterate(it func(key string, val interface{}))
	Close() error
}

func NewShort(opts ...Option) Short {
	opt := &Options{
		EvictionTime: time.Minute,
		CleanWindow:  10 * time.Minute,
	}
	for _, o := range opts {
		o(opt)
	}
	pc := pm.New(opt.EvictionTime, opt.CleanWindow)
	c := &pmCache{
		Cache: *pc,
	}
	return c
}

type pmCache struct {
	pm.Cache
}

func (q *pmCache) Get(key string) (value interface{}, ok bool) {
	return q.Cache.Get(key)
}

func (q *pmCache) Set(key string, value interface{}) {
	q.Cache.Set(key, value, pm.DefaultExpiration)
}

func (q *pmCache) SetWithExpiry(key string, value interface{}, duration time.Duration) {
	q.Cache.Set(key, value, duration)
}

func (q *pmCache) Delete(k string) {
	q.Cache.Delete(k)
}

func (q *pmCache) Reset() error {
	q.Cache.Flush()
	return nil
}

func (q *pmCache) KeysByPrefix(prefix string) (res []string, e error) {
	for k := range q.Cache.Items() {
		if strings.HasPrefix(k, prefix) {
			res = append(res, k)
		}
	}
	return
}

func (q *pmCache) Iterate(it func(key string, val interface{})) {
	for k, i := range q.Cache.Items() {
		it(k, i.Object)
	}
}

func (q *pmCache) Close() error {
	return nil
}
