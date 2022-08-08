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
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/utils/std"
	"go.uber.org/zap"
	"net/url"
	"strings"
	"time"

	redisc "github.com/go-redis/cache/v8"
	"github.com/go-redis/redis/v8"

	cache "github.com/pydio/cells/v4/common/utils/cache"
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
	cache.DefaultURLMux().Register(scheme, o)
}

func (o *URLOpener) OpenURL(ctx context.Context, u *url.URL) (cache.Cache, error) {
	opt := &Options{
		EvictionTime: time.Minute,
		CleanWindow:  10 * time.Minute,
	}
	if v := u.Query().Get("evictionTime"); v != "" {
		if i, err := time.ParseDuration(v); err != nil {
			return nil, err
		} else {
			opt.EvictionTime = i
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
		namespace = std.Randkey(16)
	}

	var cli *redis.Client
	if err := std.Retry(ctx, func() error {
		c, err := NewClient(u)
		if err != nil {
			log.Logger(ctx).Warn("[redis] could not declare cache server, retrying in 10 seconds...", zap.Error(err))
			return err
		} else {
			cli = c
		}

		ping := cli.Ping(context.TODO())
		if res, err := ping.Result(); err != nil {
			log.Logger(ctx).Warn("[redis] could not reach cache server, retrying in 10 seconds...", zap.String("res", res), zap.Error(err))
			return err
		}
		return nil
	}, 10*time.Second, 10*time.Minute); err != nil {
		return nil, err
	}

	mycache := redisc.New(&redisc.Options{
		Redis:      cli,
		LocalCache: redisc.NewTinyLFU(1000, time.Minute),
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

func (q *redisCache) Close() error {
	return q.UniversalClient.Close()
}
