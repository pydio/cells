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

package gocache

import (
	"context"
	pm "github.com/patrickmn/go-cache"
	"github.com/pydio/cells/v4/common/utils/cache"
	"net/url"
	"strings"
	"time"
)

var (
	_ cache.Cache = (*pmCache)(nil)

	scheme = "pm"
)

type pmCache struct {
	pm.Cache
}

type URLOpener struct {}

type Options struct {
	EvictionTime time.Duration
	CleanWindow  time.Duration
}

func init() {
	o := &URLOpener{}
	cache.DefaultURLMux().Register(scheme, o)
}

func (o *URLOpener) OpenURL(ctx context.Context, u *url.URL) (cache.Cache, error) {
	opt := &Options{
		EvictionTime: time.Minute,
		CleanWindow:  10 * time.Minute,
	}
	if u.Query().Has("evictionTime") {
		if i, err := time.ParseDuration(u.Query().Get("evictionTime")); err != nil {
			return nil, err
		} else {
			opt.EvictionTime = i
		}
	}
	if u.Query().Has("cleanWindow") {
		if i, err := time.ParseDuration(u.Query().Get("cleanWindow")); err != nil {
			return nil, err
		} else {
			opt.CleanWindow = i
		}
	}

	pc := pm.New(opt.EvictionTime, opt.CleanWindow)
	c := &pmCache{
		Cache: *pc,
	}

	return c, nil
}

func (q *pmCache) Get(key string) (value interface{}, ok bool) {
	return q.Cache.Get(key)
}

func (q *pmCache) GetBytes(key string) (value []byte, ok bool) {
	ret, ok := q.Cache.Get(key)
	if ok {
		b, ok := ret.([]byte)
		return b, ok
	}
	return nil, false
}

func (q *pmCache) Set(key string, value interface{}) error {
	q.Cache.Set(key, value, pm.DefaultExpiration)
	return nil
}

func (q *pmCache) SetWithExpiry(key string, value interface{}, duration time.Duration) error {
	q.Cache.Set(key, value, duration)
	return nil
}

func (q *pmCache) Delete(k string) error {
	q.Cache.Delete(k)
	return nil
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

func (q *pmCache) Iterate(it func(key string, val interface{})) error {
	for k, i := range q.Cache.Items() {
		it(k, i.Object)
	}

	return nil
}

func (q *pmCache) Close() error {
	return nil
}
