package cache

import "time"

type Options struct {
	EvictionTime time.Duration
	CleanWindow  time.Duration
}
type Option func(o *Options)

func WithEviction(t time.Duration) Option {
	return func(o *Options) {
		o.EvictionTime = t
	}
}

func WithCleanWindow(t time.Duration) Option {
	return func(o *Options) {
		o.CleanWindow = t
	}
}
