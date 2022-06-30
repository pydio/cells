package redis

import (
	"context"
	"net/url"
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

	cli := redis.NewClient(&redis.Options{
		Addr: u.Host,
	})

	mycache := redisc.New(&redisc.Options{
		Redis:      cli,
		LocalCache: redisc.NewTinyLFU(1000, time.Minute),
	})

	c := &redisCache{
		UniversalClient: cli,
		Cache: mycache,
	}

	return c, nil
}

func (q *redisCache) Get(key string) (value interface{}, ok bool) {
	if err := q.Cache.Get(context.TODO(), key, &value); err != nil {
		return nil, false
	}

	return value, true
}

func (q *redisCache) GetBytes(key string) (value []byte, ok bool) {
	ret, ok := q.Get(key)
	if ok {
		b, ok := ret.([]byte)
		return b, ok
	}
	return nil, false
}

func (q *redisCache) Set(key string, value interface{}) error {
	if err := q.Cache.Set(&redisc.Item{
		Ctx:   context.TODO(),
		Key:   key,
		Value: value,
		TTL:   time.Hour,
	}); err != nil {
		return err
	}
	return nil
}

func (q *redisCache) SetWithExpiry(key string, value interface{}, duration time.Duration) error {
	if err := q.Cache.Set(&redisc.Item{
		Ctx:   context.TODO(),
		Key:   key,
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
		key,
	); err != nil {
		return err
	}
	return nil
}

func (q *redisCache) Reset() error {
	q.UniversalClient.FlushAll(context.TODO())
	return nil
}

func (q *redisCache) KeysByPrefix(prefix string) (res []string, e error) {
	cmd := q.UniversalClient.Keys(context.TODO(), prefix)
	return cmd.Result()
}

func (q *redisCache) Iterate(it func(key string, val interface{})) error {
	iter := q.UniversalClient.Scan(context.TODO(), 0, "prefix:*", 0).Iterator()
	for iter.Next(context.TODO()) {
		key := iter.Val()
		var val interface{}
		if err := q.Cache.Get(context.TODO(), key, &val); err != nil {
			return err
		}
		it(key, val)
	}

	return nil
}

func (q *redisCache) Close() error {
	q.UniversalClient.Shutdown(context.TODO())
	return nil
}
