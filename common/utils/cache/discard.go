package cache

import (
	"context"
	"net/url"
	"time"
)

var (
	_ Cache = (*discard)(nil)
)

func init() {
	defaultURLMux.Register("discard", &discardOpener{})
}

type discardOpener struct{}

func (d *discardOpener) OpenURL(ctx context.Context, u *url.URL) (Cache, error) {
	return &discard{}, nil
}

// discard is a "dev>null" cache, that can be used to disable a specific cache
type discard struct {
}

func (d *discard) Get(key string, value interface{}) (ok bool) {
	return false
}

func (d *discard) GetBytes(key string) (value []byte, ok bool) {
	return
}

func (d *discard) Set(key string, value interface{}) error {
	return nil
}

func (d *discard) SetWithExpiry(key string, value interface{}, duration time.Duration) error {
	return nil
}

func (d *discard) Delete(k string) error {
	return nil
}

func (d *discard) Reset() error {
	return nil
}

func (d *discard) Exists(key string) (ok bool) {
	return false
}

func (d *discard) KeysByPrefix(prefix string) ([]string, error) {
	return []string{}, nil
}

func (d *discard) Iterate(it func(key string, val interface{})) error {
	return nil
}

func (d *discard) Close() error {
	return nil
}
