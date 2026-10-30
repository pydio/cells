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

package redis

import (
	"context"
	"crypto/tls"
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	redisc "github.com/go-redis/cache/v9"
	redis "github.com/redis/go-redis/v9"

	"github.com/pydio/cells/v5/common/crypto"
	cache "github.com/pydio/cells/v5/common/utils/cache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
	standard "github.com/pydio/cells/v5/common/utils/std"
)

var (
	_ cache.Cache = (*redisCache)(nil)

	scheme = "redis"
)

type redisCache struct {
	redis.UniversalClient
	*redisc.Cache
	namespace string
	options   *Options
}

type URLOpener struct{}

type Options struct {
	EvictionTime time.Duration
	CleanWindow  time.Duration
}

func init() {
	o := &URLOpener{}
	cache_helper.RegisterCachePool(scheme, o)
	cache_helper.RegisterCachePool(scheme+"+tls", o)
}

func (o *URLOpener) Open(ctx context.Context, u *url.URL) (cache.Cache, error) {
	opt := &Options{
		EvictionTime: time.Minute,
		CleanWindow:  10 * time.Minute,
	}
	if v := u.Query().Get("evictionTime"); v != "" {
		if i, err := time.ParseDuration(v); err != nil {
			return nil, err
		} else {
			opt.EvictionTime = i
			if opt.EvictionTime < time.Second {
				// Redis does not support TTL shorter than one second
				opt.EvictionTime = time.Second
			}
		}
	}
	if v := u.Query().Get("cleanWindow"); v != "" {
		if i, err := time.ParseDuration(u.Query().Get("cleanWindow")); err != nil {
			return nil, err
		} else {
			opt.CleanWindow = i
		}
	}

	namespace := strings.Join(strings.Split(strings.Trim(u.Path, "/"), "/"), ":")
	if namespace == "" {
		namespace = standard.Randkey(16)
	}

	var tc *tls.Config
	if u.Scheme == "redis+tls" {
		if tlsConfig, er := crypto.TLSConfigFromURL(u); er == nil {
			tc = tlsConfig
		} else {
			return nil, fmt.Errorf("error while loading tls config for redis cache %v", er)
		}
	}

	cli, err := NewClient(ctx, u, tc)
	if err != nil {
		return nil, err
	}

	// Size the local TinyLFU using CELLS_CACHES_HARD_LIMIT (MB) when set.
	// The env var was previously only wired to bigcache; honour it here too.
	// Default: 1000 items. With the env var: limit_MB × 100 items (≈ 10 KB
	// average item assumption), clamped to [100, 50000].
	localSize := 1000
	if limitStr := os.Getenv("CELLS_CACHES_HARD_LIMIT"); limitStr != "" {
		if limitMB, e := strconv.ParseInt(limitStr, 10, 64); e == nil && limitMB > 0 {
			localSize = int(limitMB * 100)
			if localSize < 100 {
				localSize = 100
			} else if localSize > 50000 {
				localSize = 50000
			}
		}
	}

	// Derive the local TTL from the configured Redis eviction time so the
	// TinyLFU doesn't expire entries far more aggressively than Redis does.
	// Cap between 1 minute (minimum useful) and 10 minutes (avoid stale reads
	// when a key is mutated between the Redis TTL refresh and local expiry).
	localTTL := opt.EvictionTime / 4
	if localTTL < time.Minute {
		localTTL = time.Minute
	} else if localTTL > 10*time.Minute {
		localTTL = 10 * time.Minute
	}

	mycache := redisc.New(&redisc.Options{
		Redis:      cli,
		LocalCache: redisc.NewTinyLFU(localSize, localTTL),
	})

	c := &redisCache{
		UniversalClient: cli,
		Cache:           mycache,
		namespace:       namespace + ":",
		options:         opt,
	}

	return c, nil
}

func (q *redisCache) Get(key string, value interface{}) (ok bool) {
	// fmt.Println("We are in here get ", key)
	if err := q.Cache.Get(context.TODO(), q.namespace+key, value); err != nil {
		return false
	}

	return true
}

func (q *redisCache) GetBytes(key string) (value []byte, ok bool) {
	if q.Get(key, &value) {
		return value, true
	}
	return nil, false
}

func (q *redisCache) Set(key string, value interface{}) error {
	if err := q.Cache.Set(&redisc.Item{
		Ctx:   context.TODO(),
		Key:   q.namespace + key,
		Value: value,
		TTL:   q.options.EvictionTime,
	}); err != nil {
		return err
	}
	return nil
}

func (q *redisCache) SetWithExpiry(key string, value interface{}, duration time.Duration) error {
	if err := q.Cache.Set(&redisc.Item{
		Ctx:   context.TODO(),
		Key:   q.namespace + key,
		Value: value,
		TTL:   duration,
	}); err != nil {
		return err
	}
	return nil
}

func (q *redisCache) Delete(key string) error {
	if err := q.Cache.Delete(
		context.TODO(),
		q.namespace+key,
	); err != nil {
		return err
	}
	return nil
}

func (q *redisCache) Reset() error {
	iter := q.UniversalClient.Scan(context.TODO(), 0, q.namespace+"*", 0).Iterator()
	for iter.Next(context.TODO()) {
		if err := q.Cache.Delete(context.TODO(), iter.Val()); err != nil {
			return err
		}
	}
	return nil
}

func (q *redisCache) Exists(key string) (ok bool) {
	return q.Cache.Exists(context.TODO(), key)
}

func (q *redisCache) KeysByPrefix(prefix string) ([]string, error) {
	var res []string
	cmd := q.UniversalClient.Keys(context.TODO(), q.namespace+prefix+"*")
	vv, err := cmd.Result()
	if err != nil {
		return nil, err
	}
	for _, v := range vv {
		res = append(res, strings.TrimPrefix(v, q.namespace))
	}
	return res, nil
}

func (q *redisCache) Iterate(it func(key string, val interface{})) error {
	iter := q.UniversalClient.Scan(context.TODO(), 0, q.namespace+"*", 0).Iterator()
	for iter.Next(context.TODO()) {
		key := iter.Val()
		var val interface{}
		if err := q.Cache.Get(context.TODO(), key, &val); err != nil {
			return err
		}
		it(strings.TrimPrefix(key, q.namespace), val)
	}

	return nil
}

func (q *redisCache) Close(_ context.Context) error {
	return q.UniversalClient.Close()
}
