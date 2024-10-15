package index

import (
	"context"
	"errors"
	"sort"
	"strconv"
	"strings"

	"github.com/go-gorm/caches"
	"google.golang.org/protobuf/proto"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/cache"
	cache_helper "github.com/pydio/cells/v4/common/utils/cache/helper"
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

type daocache struct {
	DAO
	cacheConf   cache.Config
	concurrency int
}

var (
	_         DAO = (*daocache)(nil)
	cacheConf     = cache.Config{
		Prefix:      "index",
		Eviction:    "10m",
		CleanWindow: "3m",
	}
)

// NewDAOCache wraps a cache around the dao
func NewDAOCache(session string, concurrency int, d DAO) DAO {
	c := &daocache{
		DAO: d,
		cacheConf: cache.Config{
			Eviction:    cacheConf.Eviction,
			CleanWindow: cacheConf.CleanWindow,
			Prefix:      "index-" + session,
		},
		concurrency: concurrency,
	}

	return c
}

func (d *daocache) getCache(ctx context.Context) cache.Cache {
	return cache_helper.MustResolveCache(ctx, "short", cacheConf)
}

func (d *daocache) AddNode(ctx context.Context, node tree.ITreeNode) error {

	clone := proto.Clone(node).(tree.ITreeNode)

	mpathStr := clone.GetMPath().ToString()
	parentMpathStr := clone.GetMPath().Parent().ToString()

	if d.getCache(ctx).Exists(getKey("add_", mpathStr)) {
		return gorm.ErrDuplicatedKey
	}

	// Adding to list
	if err := d.getCache(ctx).Set(getKey("add_", mpathStr), node); err != nil {
		return err
	}

	// Saving GetNodeChild
	if err := d.getCache(ctx).Set(getKey("nc_", parentMpathStr, "_", clone.GetName()), node); err != nil {
		return err
	}

	// Saving AvailableChildIndex
	if err := d.getCache(ctx).Set(getKey("ac_", mpathStr), []int{0}); err != nil {
		return err
	}

	// Set Parent AvailableChildIndex List
	var all []int
	if ok := d.getCache(ctx).Get(getKey("ac_", parentMpathStr), &all); ok {
		i, _ := strconv.Atoi(mpathStr[len(parentMpathStr)+1:])
		all = append(all, i)
	}

	d.getCache(ctx).Set(getKey("ac_", parentMpathStr), all)

	return nil
}

func (d *daocache) GetNode(ctx context.Context, mPath *tree.MPath) (tree.ITreeNode, error) {
	key := getKey("add_", mPath.ToString())

	// Check if we have something in the cache
	var node tree.ITreeNode
	err := tree.NewITreeNode(&node)
	if err != nil {
		return node, err
	}
	if ok := d.getCache(ctx).Get(key, &node); ok {
		return node, nil
	}

	return d.DAO.GetNode(nil, mPath)
}

func (d *daocache) GetNodeChild(ctx context.Context, mPath *tree.MPath, name string) (tree.ITreeNode, error) {

	// Check if we have something in the cache
	key := getKey("nc_", mPath.ToString(), "_", name)

	var node tree.ITreeNode
	if err := tree.NewITreeNode(&node); err != nil {
		return node, err
	}

	if ok := d.getCache(ctx).Get(key, &node); ok {
		return node, nil
	}

	// Check if the parent has just been added
	pkey := getKey("add_", mPath.Parent().ToString())
	var pnode tree.ITreeNode

	if err := tree.NewITreeNode(&pnode); err != nil {
		return node, err
	}
	if ok := d.getCache(ctx).Get(pkey, &pnode); ok {
		return node, errors.New("not found")
	}

	// Nothing, retrieve from the db and save in cache
	node, err := d.DAO.GetNodeChild(nil, mPath, name)
	if err != nil {
		return node, err
	}

	return node, d.getCache(ctx).Set(key, node)
}

func getKey(parts ...string) string {
	var b strings.Builder

	for _, v := range parts {
		b.WriteString(v)
	}

	return b.String()
}

// GetNodeFirstAvailableChildIndex from path
func (d *daocache) GetNodeFirstAvailableChildIndex(ctx context.Context, mPath *tree.MPath) (available uint64, e error) {

	var all []int
	if ok := d.getCache(ctx).Get(getKey("ac_", mPath.ToString()), &all); ok {
		sort.Ints(all)

		max := all[len(all)-1]

		// No missing numbers : jump directly to the end
		if max == len(all)-1 {
			available = uint64(max + 1)
			return
		}

		// Look for available slot - binary search first missing number
		padStart := false
		for {
			slot, has, _ := firstAvailableSlot(all, padStart)
			if !has {
				break
			}
			padStart = true

			available = uint64(slot)

			return
		}
	}

	return d.DAO.GetNodeFirstAvailableChildIndex(nil, mPath)
}

func (d *daocache) Flush(ctx context.Context, b bool) error {

	ic, ec := d.DAO.AddNodeStream(ctx, d.concurrency)

	var count = 0
	if err := d.getCache(ctx).Iterate(func(key string, value interface{}) {
		if strings.HasPrefix(key, "add_") {
			count++
			ic <- value.(tree.ITreeNode)
		}
	}); err != nil {
		return err
	}

	if err := d.getCache(ctx).Reset(); err != nil {
		return err
	}

	close(ic)

	if err, ok := <-ec; ok && err != nil {
		return err
	}

	return nil
}

func (dao *daocache) ResolveMPath(ctx context.Context, create bool, node *tree.ITreeNode, rootNode ...tree.ITreeNode) (mpath *tree.MPath, nodeTree []tree.ITreeNode, err error) {
	initial := proto.Clone(*node).(tree.ITreeNode)
	initial.SetMPath(nil)
	initial.GetNode().SetPath("")

	mpath, nodeTree, err = toMPath(ctx, dao, *node, initial, create)

	return
}
