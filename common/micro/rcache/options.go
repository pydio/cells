package rcache

import (
	"time"
)

// WithTTL sets the cache TTL
func WithTTL(t time.Duration) Option {
	return func(o *Options) {
		o.TTL = t
	}
}
