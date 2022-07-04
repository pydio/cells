package redis

import (
	"context"
	"net/url"
	"strings"
	"time"

	standard "github.com/pydio/cells/v4/common/utils/std"

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
		namespace = standard.Randkey(16)
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
		Cache:           mycache,
		namespace:       namespace + ":",
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
		TTL:   time.Hour,
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
	iter := q.UniversalClient.Scan(context.TODO(), 0, "prefix:"+q.namespace+"*", 0).Iterator()
	for iter.Next(context.TODO()) {
		if err := q.Cache.Delete(context.TODO(), iter.Val()); err != nil {
			return err
		}
	}
	return nil
}

func (q *redisCache) KeysByPrefix(prefix string) (res []string, e error) {
	cmd := q.UniversalClient.Keys(context.TODO(), "prefix:"+q.namespace+prefix+"*")
	return cmd.Result()
}

func (q *redisCache) Iterate(it func(key string, val interface{})) error {
	iter := q.UniversalClient.Scan(context.TODO(), 0, "prefix:"+q.namespace+"*", 0).Iterator()
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
	return q.UniversalClient.Close()
}
