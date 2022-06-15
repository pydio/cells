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
	"strings"
	"time"

	"github.com/allegro/bigcache/v3"
)

var _ Cache = (*bigCache)(nil)

type bigCache struct {
	*bigcache.BigCache
}

func (b *bigCache) Get(key string) (value interface{}, ok bool) {
	if ret, err := b.BigCache.Get(key); err == nil {
		return ret, true
	}
	return nil, false
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
