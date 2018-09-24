package utils

import (
	"time"

	"github.com/allegro/bigcache"
)

//DefaultBigCacheConfig returns a bigcache default config with an
// eviction time of 30minutes and a HadMaxCachesize of 20MB
func DefaultBigCacheConfig() bigcache.Config {

	c := bigcache.DefaultConfig(30 * time.Minute)
	c.HardMaxCacheSize = 20 * 1024 * 1024

	return c
}
