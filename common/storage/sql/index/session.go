package index

import (
	"context"
	"sort"
	"strconv"
	"strings"

	"google.golang.org/protobuf/proto"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/cache"
	cache_helper "github.com/pydio/cells/v4/common/utils/cache/helper"
)

type sessionDAO struct {
	DAO
	cacheConf   cache.Config
	concurrency int
}

var (
	_             DAO = (*sessionDAO)(nil)
	cacheEviction     = "10m"
	cacheWindow       = "3m"
)

// NewSessionDAO wraps a cache around the dao
func NewSessionDAO(session string, concurrency int, d DAO) DAO {
	c := &sessionDAO{
		DAO: d,
		cacheConf: cache.Config{
			Eviction:    cacheEviction,
			CleanWindow: cacheWindow,
			Prefix:      "index-" + session,
		},
		concurrency: concurrency,
	}

	return c
}

func (d *sessionDAO) getCache(ctx context.Context) cache.Cache {
	return cache_helper.MustResolveCache(ctx, "short", d.cacheConf)
}

func (d *sessionDAO) insertNode(ctx context.Context, node tree.ITreeNode) error {

	clone := proto.Clone(node).(tree.ITreeNode)

	mpathStr := clone.GetMPath().ToString()
	parentMpathStr := clone.GetMPath().Parent().ToString()

	ca := d.getCache(ctx)
	if ca.Exists(getKey("add_", mpathStr)) {
		return gorm.ErrDuplicatedKey
	}

	// Adding to list
	if err := ca.Set(getKey("add_", mpathStr), node); err != nil {
		return err
	}
	if err := ca.Set(getKey("pa_", node.GetNode().GetPath()), node); err != nil {
		return err
	}

	// Saving getNodeChild
	if err := ca.Set(getKey("nc_", parentMpathStr, "_", clone.GetName()), node); err != nil {
		return err
	}

	// Saving AvailableChildIndex
	if err := ca.Set(getKey("ac_", mpathStr), []int{0}); err != nil {
		return err
	}

	// Set Parent AvailableChildIndex List
	var all []int
	if ok := ca.Get(getKey("ac_", parentMpathStr), &all); ok {
		i, _ := strconv.Atoi(mpathStr[len(parentMpathStr)+1:])
		all = append(all, i)
	}

	_ = ca.Set(getKey("ac_", parentMpathStr), all)

	return nil
}

func (d *sessionDAO) GetNodeByMPath(ctx context.Context, mPath *tree.MPath) (tree.ITreeNode, error) {
	key := getKey("add_", mPath.ToString())

	// Check if we have something in the cache
	var node tree.ITreeNode
	err := tree.NewITreeNode(&node)
	if err != nil {
		return node, err
	}
	ca := d.getCache(ctx)
	if ok := ca.Get(key, &node); ok {
		return node, nil
	}

	return d.DAO.GetNodeByMPath(ctx, mPath)
}

func (d *sessionDAO) getNodeChild(ctx context.Context, mPath *tree.MPath, name string) (tree.ITreeNode, error) {

	// Check if we have something in the cache
	key := getKey("nc_", mPath.ToString(), "_", name)

	var node tree.ITreeNode
	if err := tree.NewITreeNode(&node); err != nil {
		return node, err
	}
	ca := d.getCache(ctx)
	if ok := ca.Get(key, &node); ok {
		return node, nil
	}

	// Check if the parent has just been added
	pkey := getKey("add_", mPath.Parent().ToString())
	var pnode tree.ITreeNode

	if err := tree.NewITreeNode(&pnode); err != nil {
		return node, err
	}
	if ok := ca.Get(pkey, &pnode); ok {
		return node, nil
	}

	// Nothing, retrieve from the db and save in cache
	node, err := d.DAO.getNodeChild(nil, mPath, name)
	if err != nil {
		return node, err
	}

	return node, ca.Set(key, node)
}

func getKey(parts ...string) string {
	var b strings.Builder

	for _, v := range parts {
		b.WriteString(v)
	}

	return b.String()
}

// GetNodeFirstAvailableChildIndex from path
func (d *sessionDAO) getNodeFirstAvailableChildIndex(ctx context.Context, mPath *tree.MPath) (available uint64, e error) {

	var all []int
	if ok := d.getCache(ctx).Get(getKey("ac_", mPath.ToString()), &all); ok {
		sort.Ints(all)

		maxIdx := all[len(all)-1]

		// No missing numbers : jump directly to the end
		if maxIdx == len(all)-1 {
			available = uint64(maxIdx + 1)
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

	return d.DAO.getNodeFirstAvailableChildIndex(ctx, mPath)
}

func (d *sessionDAO) Flush(ctx context.Context, b bool) error {

	ic, ec := d.DAO.AddNodeStream(ctx, d.concurrency)
	ca := d.getCache(ctx)
	var count = 0
	if err := ca.Iterate(func(key string, value interface{}) {
		if strings.HasPrefix(key, "add_") {
			count++
			ic <- value.(tree.ITreeNode)
		}
	}); err != nil {
		return err
	}

	log.Logger(ctx).Infof("Flushed DAOSession with %d creates", count)

	if err := ca.Reset(); err != nil {
		return err
	}

	close(ic)

	if err, ok := <-ec; ok && err != nil {
		return err
	}

	return nil
}

func (d *sessionDAO) GetNodeByPath(ctx context.Context, nodePath string) (tree.ITreeNode, error) {
	var caNode tree.ITreeNode
	if d.getCache(ctx).Get(getKey("pa_", nodePath), &caNode) {
		return caNode, nil
	}
	clone := *d
	lookup := tree.EmptyTreeNode()
	lookup.SetNode(&tree.Node{Path: nodePath})
	foundNode, _, er := toMPath(ctx, &clone, lookup, nil, false)
	if er == nil {
		foundNode.GetNode().SetPath(nodePath)
	}
	return foundNode, er
}

func (d *sessionDAO) GetOrCreateNodeByPath(ctx context.Context, nodePath string, info *tree.Node, rootInfo ...*tree.Node) (newNode tree.ITreeNode, allCreated []tree.ITreeNode, err error) {

	var caNode tree.ITreeNode
	if d.getCache(ctx).Get(getKey("pa_", nodePath), &caNode) {
		return caNode, nil, nil
	}

	clone := *d
	lookup := tree.EmptyTreeNode()
	if info == nil {
		info = &tree.Node{}
	}
	info.SetPath(nodePath)
	lookup.SetNode(info)

	root := tree.EmptyTreeNode()
	if len(rootInfo) > 0 {
		root.SetNode(rootInfo[0])
	}

	foundNode, cc, er := toMPath(ctx, &clone, lookup, root, true)
	if er == nil {
		foundNode.GetNode().SetPath(nodePath)
	}
	return foundNode, cc, er

}
