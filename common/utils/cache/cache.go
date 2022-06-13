package cache

import "time"

type Cache interface {
	Get(key string) (value interface{}, ok bool)
	GetBytes(key string) (value []byte, ok bool)
	Set(key string, value interface{}) error
	SetWithExpiry(key string, value interface{}, duration time.Duration) error
	Delete(k string) error
	Reset() error
	KeysByPrefix(prefix string) ([]string, error)
	Iterate(it func(key string, val interface{})) error
	Close() error
}
