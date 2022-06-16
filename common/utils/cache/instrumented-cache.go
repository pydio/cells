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
