/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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

package cache

import (
	"time"

	"github.com/allegro/bigcache"
	"github.com/uber-go/tally"

	"github.com/pydio/cells/common/service/metrics"
)

// NewInstrumentedCache creates a BigCache instance with a regular report of statistics
func NewInstrumentedCache(serviceName string) *InstrumentedCache {
	scope := metrics.GetMetricsForService(serviceName)
	c, _ := bigcache.NewBigCache(DefaultBigCacheConfig())
	i := &InstrumentedCache{}
	i.BigCache = *c
	i.scope = scope
	i.ticker = time.NewTicker(30 * time.Second)
	go func() {
		for range i.ticker.C {
			s := c.Stats()
			i.scope.Gauge("bigcache_capacity").Update(float64(i.Capacity()))
			i.scope.Gauge("bigcache_hits").Update(float64(s.Hits))
			i.scope.Gauge("bigcache_collisions").Update(float64(s.Collisions))
			i.scope.Gauge("bigcache_delHits").Update(float64(s.DelHits))
			i.scope.Gauge("bigcache_delMisses").Update(float64(s.DelMisses))
			i.scope.Gauge("bigcache_misses").Update(float64(s.Misses))
		}
	}()
	return i
}

// InstrumentCache wraps BigCache with metrics
type InstrumentedCache struct {
	bigcache.BigCache
	scope  tally.Scope
	ticker *time.Ticker
}

// Close stops internal timer for reporting statistics
func (i *InstrumentedCache) Close() {
	i.ticker.Stop()
}

// Set adds a key/value to the cache.
func (i *InstrumentedCache) Set(key string, entry []byte) error {
	i.scope.Counter("bigcache_add").Inc(int64(len(entry)))
	return i.BigCache.Set(key, entry)
}

//DefaultBigCacheConfig returns a bigcache default config with an
// eviction time of 30minutes and a HadMaxCachesize of 20MB
func DefaultBigCacheConfig() bigcache.Config {
	c := bigcache.DefaultConfig(30 * time.Minute)
	c.CleanWindow = 10 * time.Minute
	c.Shards = 64
	c.MaxEntriesInWindow = 10 * 60 * 64
	c.MaxEntrySize = 200
	c.HardMaxCacheSize = 8
	return c
}
