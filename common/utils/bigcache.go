package utils

import (
	"time"

	"github.com/allegro/bigcache"
)

//DefaultBigCacheConfig returns a bigcache default config with an
// eviction time of 30minutes and a HadMaxCachesize of 20MB
func DefaultBigCacheConfig() bigcache.Config {

	c := bigcache.DefaultConfig(30 * time.Minute)
	c.CleanWindow = 10 * time.Minute
	c.Shards = 256
	c.MaxEntriesInWindow = 10 * 60 * 128
	c.MaxEntrySize = 500
	c.HardMaxCacheSize = 20

	return c
}
