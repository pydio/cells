/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package bigcache

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/service/metrics"
	"github.com/uber-go/tally/v4"
	"net/url"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/allegro/bigcache/v3"

	"github.com/pydio/cells/v4/common/utils/cache"
)

var (
	_ cache.Cache = (*bigCache)(nil)

	scheme = "bigcache"

	defaultConfig bigcache.Config
	o             = sync.Once{}
)

type bigCache struct {
	*bigcache.BigCache
	closed bool
	scope  tally.Scope
	ticker *time.Ticker
}

type URLOpener struct{}

func init() {
	o := &URLOpener{}
	cache.DefaultURLMux().Register(scheme, o)
}

func (o *URLOpener) OpenURL(ctx context.Context, u *url.URL) (cache.Cache, error) {
	conf := DefaultBigCacheConfig()
	if v := u.Query().Get("evictionTime"); v != "" {
		if i, err := time.ParseDuration(v); err != nil {
			return nil, err
		} else {
			conf.LifeWindow = i
		}
	}
	if v := u.Query().Get("cleanWindow"); v != "" {
		if i, err := time.ParseDuration(v); err != nil {
			return nil, err
		} else {
			conf.CleanWindow = i
		}
	}

	bc, err := bigcache.NewBigCache(conf)
	if err != nil {
		return nil, err
	}

	cac := &bigCache{
		BigCache: bc,
		ticker:   time.NewTicker(30 * time.Second),
		scope:    metrics.GetMetricsForService(u.Path),
	}
	go func() {
		for range cac.ticker.C {
			cac.metrics()
		}
	}()
	return cac, nil
}

func (b *bigCache) Get(key string, value interface{}) (ok bool) {
	ret, err := b.BigCache.Get(key)
	if err != nil {
		return false
	}

	v, ok := value.(*[]byte)
	if !ok {
		return false
	}

	*v = ret

	return true
}

func (b *bigCache) GetBytes(key string) (value []byte, ok bool) {
	if ret, err := b.BigCache.Get(key); err == nil {
		return ret, true
	}

	return nil, false
}

func (b *bigCache) Set(key string, value interface{}) error {
	data, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("not a byte value")
	}
	return b.BigCache.Set(key, data)
}

func (b *bigCache) SetWithExpiry(key string, value interface{}, duration time.Duration) error {
	return fmt.Errorf("not implemented")
}

func (b *bigCache) Delete(key string) error {
	return b.BigCache.Delete(key)
}

func (b *bigCache) KeysByPrefix(prefix string) ([]string, error) {
	var res []string

	it := b.BigCache.Iterator()
	for {
		if !it.SetNext() {
			break
		}
		info, err := it.Value()
		if err != nil {
			return nil, err
		}
		if strings.HasPrefix(info.Key(), prefix) {
			res = append(res, info.Key())
		}
	}

	return res, nil
}

func (b *bigCache) Iterate(f func(key string, val interface{})) error {
	it := b.BigCache.Iterator()
	for {
		if !it.SetNext() {
			break
		}
		info, err := it.Value()
		if err != nil {
			return err
		}

		f(info.Key(), info.Value())
	}

	return nil
}

func (b *bigCache) Close() error {
	if !b.closed {
		if b.ticker != nil {
			b.ticker.Stop()
		}
		if err := b.BigCache.Close(); err != nil {
			return err
		}
		b.closed = true
	}
	return nil
}

func (b *bigCache) metrics() {
	s := b.Stats()
	b.scope.Gauge("bigcache_capacity").Update(float64(b.Capacity()))
	b.scope.Gauge("bigcache_hits").Update(float64(s.Hits))
	b.scope.Gauge("bigcache_collisions").Update(float64(s.Collisions))
	b.scope.Gauge("bigcache_delHits").Update(float64(s.DelHits))
	b.scope.Gauge("bigcache_delMisses").Update(float64(s.DelMisses))
	b.scope.Gauge("bigcache_misses").Update(float64(s.Misses))

}

func DefaultBigCacheConfig() bigcache.Config {
	// Todo : pass this via Cache URL
	o.Do(func() {
		defaultConfig = bigcache.DefaultConfig(30 * time.Minute)
		defaultConfig.Verbose = false
		defaultConfig.Shards = 64
		defaultConfig.MaxEntriesInWindow = 10 * 60 * 64
		defaultConfig.MaxEntrySize = 200
		defaultConfig.HardMaxCacheSize = 8
		if limit := os.Getenv("CELLS_CACHES_HARD_LIMIT"); limit != "" {
			if l, e := strconv.ParseInt(limit, 10, 64); e == nil {
				if l < 8 {
					fmt.Println("[ENV] ## WARNING ## CELLS_CACHES_HARD_LIMIT cannot use a value lower than 8 (MB).")
				} else {
					defaultConfig.HardMaxCacheSize = int(l)
				}
			}
		}
		// Disabled as cleanUp may seem to be able to lock the cache
		// c.CleanWindow = 10 * time.Minute
	})
	return defaultConfig
}
