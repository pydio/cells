/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

// Package cache provides ready-to-use in-memory cache mechanisms
package cache

import (
	"fmt"
	"os"
	"strconv"
	"sync"
	"time"

	bigcache "github.com/allegro/bigcache/v3"
	pm "github.com/patrickmn/go-cache"

	"github.com/pydio/cells/v4/common/service/metrics"
	"github.com/pydio/cells/v4/common/utils/cache/gocache"
)

var (
	defaultConfig bigcache.Config
	o             = sync.Once{}
)

// NewSharded creates a cache instance instrumented with a regular report of statistics
func NewSharded(identifier string, opts ...Option) Cache {
	opt := &Options{}
	for _, o := range opts {
		o(opt)
	}
	pc := pm.New(opt.EvictionTime, opt.CleanWindow)
	return newInstrumentedCache(identifier, &gocache.pmCache{
		Cache: *pc,
	})
}

// newInstrumentedCache creates a BigCache instance with a regular report of statistics
func newInstrumentedCache(serviceName string, cache Cache) *InstrumentedCache {
	scope := metrics.GetMetricsForService(serviceName)
	i := &InstrumentedCache{}
	i.Cache = cache
	i.scope = scope
	i.ticker = time.NewTicker(30 * time.Second)

	return i
}

func DefaultBigCacheConfig() bigcache.Config {
	o.Do(func() {
		defaultConfig = bigcache.DefaultConfig(30 * time.Minute)
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
