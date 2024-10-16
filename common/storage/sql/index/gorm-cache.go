package index

import (
	"github.com/go-gorm/caches"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/cache"
)

var _ caches.Cacher = (*Cacher)(nil)

type Cacher struct {
	store cache.Cache
}

func NewCacher(store cache.Cache) *Cacher {
	return &Cacher{
		store: store,
	}
}

func (c *Cacher) Get(key string) interface{} {
	var val interface{}

	if !c.store.Get(key, &val) {
		return nil
	}

	return val
}

func (c *Cacher) Store(key string, val interface{}) error {
	return c.store.Set(key, val)
}

// NewDAOWithCache for the common sql index
func NewDAOWithCache[T tree.ITreeNode](db *gorm.DB, ca cache.Cache) DAO {

	cachesPlugin := &caches.Caches{Conf: &caches.Config{
		//Easer: true, // Cannot enable that, it mixes up GetNodeChild results
		Cacher: NewCacher(ca),
	}}
	db.Use(cachesPlugin)

	return &gormImpl[T]{DB: db, factory: &treeNodeFactory[T]{}}
}
