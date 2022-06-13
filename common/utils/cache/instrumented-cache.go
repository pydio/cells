package cache

import (
	"fmt"
	"github.com/uber-go/tally/v4"
	"time"
)

var _ Cache = (*InstrumentedCache)(nil)

// InstrumentedCache wraps BigCache with metrics
type InstrumentedCache struct {
	Cache
	scope  tally.Scope
	ticker *time.Ticker
}

func (i *InstrumentedCache) Delete(key string) error {
	return i.Cache.Delete(key)
}

func (i *InstrumentedCache) Reset() error {
	return i.Cache.Reset()
}

func (i *InstrumentedCache) KeysByPrefix(prefix string) (res []string, e error) {
	return i.Cache.KeysByPrefix(prefix)
}

// Close stops internal timer for reporting statistics
func (i *InstrumentedCache) Close() error {
	i.ticker.Stop()
	return i.Cache.Close()
}

// Set adds a key/value to the cache.
func (i *InstrumentedCache) Set(key string, entry interface{}) error {
	data, ok := entry.([]byte)
	if !ok {
		return fmt.Errorf("not byte format")
	}
	i.scope.Counter("bigcache_add").Inc(int64(len(data)))
	return i.Cache.Set(key, data)
}
