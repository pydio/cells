package cache

import (
	"time"

	pm "github.com/patrickmn/go-cache"
)

func NewShort(opts ...Option) Cache {
	opt := &Options{
		EvictionTime: time.Minute,
		CleanWindow:  10 * time.Minute,
	}
	for _, o := range opts {
		o(opt)
	}
	pc := pm.New(opt.EvictionTime, opt.CleanWindow)
	c := &pmCache{
		Cache: *pc,
	}
	return c
}


