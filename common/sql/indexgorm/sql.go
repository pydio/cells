/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/


 *
 * The latest code can be found at <https://pydio.com>.
 */

package index

import (
	"bytes"
	"context"
	"crypto/md5"
	"encoding/hex"
	"errors"
	"fmt"
	"path"
	"reflect"
	"sort"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/go-gorm/caches"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/pydio/cells/v4/common/proto/options/orm"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/sql"
	storagesql "github.com/pydio/cells/v4/common/storage/sql"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var (
	queries   = map[string]interface{}{}
	inserting atomic.Value
	cond      *sync.Cond

	ch     = map[string]chan string{}
	chLock = &sync.RWMutex{}

	batchLen = 20
	indexLen = 255
)

// BatchSend sql structure
type BatchSend struct {
	in  chan tree.ITreeNode
	out chan error
}

func init() {
	inserting.Store(make(map[string]bool))
	cond = sync.NewCond(&sync.Mutex{})
}

func RegisterIndexLen(len int) {
	indexLen = len
}

// var _ DAO = (*IndexSQL[*tree.TreeNode])(nil)

// IndexSQL implementation
type IndexSQL[T tree.ITreeNode] struct {
	DB *gorm.DB

	once *sync.Once

	sql.Helper

	factory Factory[T]
}

type Factory[T tree.ITreeNode] interface {
	Struct() T
	Slice() []T
	RootGroupProvider
}

type RootGroupProvider interface {
	RootGroup() string
}

type treeNodeFactory[T tree.ITreeNode] struct{}

func (*treeNodeFactory[T]) Struct() T {
	var t T
	tree.NewITreeNode(&t)
	return t
}

func (*treeNodeFactory[T]) Slice() []T {
	return []T{}
}

func (*treeNodeFactory[T]) RootGroup() string {
	var t T

	if r, ok := any(t).(RootGroupProvider); ok {
		return r.RootGroup()
	}

	return "ROOT"
}

func (s *IndexSQL[T]) instance(ctx context.Context) *gorm.DB {
	cachesPlugin := &caches.Caches{Conf: &caches.Config{
		Easer: true,
		// Cacher: NewCacher(c),
	}}

	s.DB.Use(cachesPlugin)

	t := s.factory.Struct()
	msg := proto.GetExtension(t.ProtoReflect().Descriptor().Options(), orm.E_OrmPolicy).(*orm.ORMMessagePolicy)

	for _, options := range msg.GetOptions() {
		if options.GetType() == s.DB.Dialector.Name() {
			s.DB.Set("gorm:table_options", options.GetValue())
		}
	}

	return s.DB
}

func (s *IndexSQL[T]) Migrate(ctx context.Context) error {
	t := s.factory.Struct()
	return s.instance(ctx).AutoMigrate(t)
}

// Init handles the db version migration and prepare the statements
//func (s *IndexSQL[T]) Init(ctx context.Context, options configx.Values) error {
//
//	cachesPlugin := &caches.Caches{Conf: &caches.Config{
//		Easer: true,
//		// Cacher: NewCacher(c),
//	}}
//
//	s.DB.Use(cachesPlugin)
//
//	db := s.DB
//
//	if s.DB.Dialector == nil {
//		return errors.New("wrong dialector")
//	}
//
//	t := s.factory.Struct()
//	msg := proto.GetExtension(t.ProtoReflect().Descriptor().Options(), orm.E_OrmPolicy).(*orm.ORMMessagePolicy)
//
//	for _, options := range msg.GetOptions() {
//		if options.GetType() == s.DB.Dialector.Name() {
//			db = s.DB.Set("gorm:table_options", options.GetValue())
//		}
//	}
//
//	db.AutoMigrate(t)
//
//	s.instance = func(ctx context.Context) *gorm.DB {
//		return db.WithContext(ctx).Model(s.factory.Struct())
//	}
//
//	return nil
//}

// CleanResourcesOnDeletion revert the creation of the table for a datasource
func (dao *IndexSQL[T]) CleanResourcesOnDeletion(context.Context) (string, error) {
	return "Removed tables for index", nil
}

// AddNode to the underlying SQL DB.
func (dao *IndexSQL[T]) AddNode(ctx context.Context, node tree.ITreeNode) error {
	mTime := node.GetNode().GetMTime()
	if mTime <= 0 {
		node.GetNode().SetMTime(mTime)
	}

	return dao.instance(ctx).Create(node).Error
}

// AddNodeStream creates a channel to write to the SQL database
func (dao *IndexSQL[T]) AddNodeStream(ctx context.Context, max int) (chan tree.ITreeNode, chan error) {

	c := make(chan tree.ITreeNode)
	e := make(chan error)

	go func() {

		defer close(e)

		nodes := dao.factory.Slice()

		for {
			select {
			case node, ok := <-c:
				if !ok {
					tx := dao.instance(ctx).CreateInBatches(nodes, max)

					//fmt.Println("Creating all nodes ", tx.Error)
					nodes = nil

					e <- tx.Error
					return
				}

				if len(nodes) >= max {
					// Need to insert
					tx := dao.instance(ctx).CreateInBatches(nodes, max)
					// fmt.Println("Creating all nodes by cap ", len(nodes), cap(c), tx.Error)

					nodes = nil

					if tx.Error != nil {
						e <- tx.Error
						return
					}
				}

				mTime := node.GetNode().GetMTime()
				if mTime <= 0 {
					node.GetNode().SetMTime(mTime)
				}

				nodes = append(nodes, node.(T))
			}
		}
	}()

	return c, e
}

// Flush the database in case of cached inserts
func (dao *IndexSQL[T]) Flush(ctx context.Context, final bool) error {
	return errNotImplemented
}

// SetNode in replacement of previous node
func (dao *IndexSQL[T]) SetNode(ctx context.Context, node tree.ITreeNode) error {
	return dao.instance(ctx).Model(node).Updates(node).Error
}

// SetNodeMeta in replacement of previous node
func (dao *IndexSQL[T]) SetNodeMeta(ctx context.Context, node tree.ITreeNode) error {
	return dao.SetNode(ctx, node)
}

// ResyncDirtyEtags ensures that etags are rightly calculated
func (dao *IndexSQL[T]) ResyncDirtyEtags(ctx context.Context, rootNode tree.ITreeNode) error {

	var dirtyNodes []tree.ITreeNode

	tx := dao.instance(ctx).
		Where(tree.MPathEqualsOrLike{Value: rootNode.GetMPath()}).
		Where("level >= ?", rootNode.GetLevel()).
		Where("etag = '-1'").
		Order("level desc").
		FindInBatches(&dirtyNodes, 100, func(tx *gorm.DB, batch int) error {
			for _, dirtyNode := range dirtyNodes {
				var etagNodes []tree.ITreeNode
				dao.instance(ctx).
					Where(tree.MPathLike{Value: dirtyNode.GetMPath()}).
					Where("level = ?", dirtyNode.GetLevel()+1).
					Order("name").
					Find(&etagNodes)

				SEPARATOR := "."
				hasher := md5.New()

				first := true
				for _, etagNode := range etagNodes {
					if !first {
						hasher.Write([]byte(SEPARATOR))
					}
					hasher.Write([]byte(etagNode.GetNode().GetEtag()))
					first = false
				}

				etag := hex.EncodeToString(hasher.Sum(nil))
				dirtyNode.GetNode().SetEtag(etag)

				updateTx := dao.instance(ctx).Updates(dirtyNode)
				if err := updateTx.Error; err != nil {
					return err
				}
			}

			// returns error will stop future batches
			return nil
		})

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

// SetNodes returns a channel and waits for arriving nodes before updating them in batch.
func (dao *IndexSQL[T]) SetNodes(ctx context.Context, etag string, deltaSize int64) sql.BatchSender {

	b := NewBatchSend()

	go func() {
		defer func() {
			close(b.out)
		}()

		insert := func(mpathes ...*tree.MPath) {
			tx := dao.instance(ctx).
				Model(&tree.TreeNode{}).
				Where(tree.MPathsEquals{Values: mpathes}).
				Updates(map[string]interface{}{
					"mtime": time.Now().Unix(),
					"etag":  etag,
					"size":  gorm.Expr("size + ?", deltaSize)})

			if err := tx.Error; err != nil {
				b.out <- err
			}
		}

		all := make([]*tree.MPath, 0, batchLen)

		for node := range b.in {
			all = append(all, node.GetMPath())
			if len(all) == cap(all) {
				insert(all...)
				all = all[:0]
			}
		}

		if len(all) > 0 {
			insert(all...)
		}

	}()

	return b
}

// DelNode from database
func (dao *IndexSQL[T]) DelNode(ctx context.Context, node tree.ITreeNode) error {
	return dao.instance(ctx).
		Where(tree.MPathEqualsOrLike{Value: node.GetMPath()}).
		Delete(&node).Error
}

// GetNode from path
func (dao *IndexSQL[T]) GetNode(ctx context.Context, path *tree.MPath) (tree.ITreeNode, error) {
	node := dao.factory.Struct()

	tx := dao.instance(ctx).Where(tree.MPathEquals{Value: path}).Find(&node)
	if err := tx.Error; err != nil {
		return nil, err
	}

	if tx.RowsAffected == 0 {
		return nil, errors.New("not found")
	}

	return node, nil
}

// GetNodeByUUID returns the node stored with the unique uuid
func (dao *IndexSQL[T]) GetNodeByUUID(ctx context.Context, uuid string) (tree.ITreeNode, error) {

	node := dao.factory.Struct()

	tx := dao.instance(ctx).Where("uuid = ?", uuid).Find(&node)
	if err := tx.Error; err != nil {
		return nil, err
	}

	if tx.RowsAffected == 0 {
		return nil, errors.New("not found")
	}

	return node, nil
}

// GetNodes List
func (dao *IndexSQL[T]) GetNodes(ctx context.Context, mpathes ...*tree.MPath) chan tree.ITreeNode {

	c := make(chan tree.ITreeNode)

	go func() {
		defer close(c)

		nodes := []T{}

		tx := dao.instance(ctx)

		if len(mpathes) > 0 {
			tx = tx.Where(tree.MPathsEquals{Values: mpathes})
		}

		tx = tx.
			Order("mpath1, mpath2, mpath3, mpath4").
			Find(&nodes)

		if err := tx.Error; err != nil {
			return
		}

		for _, node := range nodes {
			c <- node
		}
	}()

	return c
}

// GetNodeChild from node path whose name matches
func (dao *IndexSQL[T]) GetNodeChild(ctx context.Context, mPath *tree.MPath, name string) (tree.ITreeNode, error) {
	node := dao.factory.Struct()

	tx := dao.instance(ctx)

	tx = tx.Where(tree.MPathLike{Value: mPath})
	tx = tx.Where("level = ?", mPath.Length()+1)
	tx = tx.Where("name = ?", name)

	tx = tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&node)
	//tx = tx.Find(&idxNode)

	if err := tx.Error; err != nil {
		return nil, err
	}

	if tx.RowsAffected == 0 {
		return nil, errors.New("not found")
	}

	return node, nil
}

// GetNodeLastChild from path
func (dao *IndexSQL[T]) GetNodeLastChild(ctx context.Context, mPath *tree.MPath) (tree.ITreeNode, error) {
	node := dao.factory.Struct()

	tx := dao.instance(ctx).
		Where(tree.MPathLike{Value: mPath}).
		Where("level = ?", mPath.Length()+1).
		Order("mpath4, mpath3, mpath2, mpath1 desc").
		First(&node)

	if err := tx.Error; err != nil {
		return nil, err
	}

	if tx.RowsAffected == 0 {
		return nil, errors.New("not found")
	}

	return node, nil
}

// GetNodeFirstAvailableChildIndex from path
func (dao *IndexSQL[T]) GetNodeFirstAvailableChildIndex(ctx context.Context, mPath *tree.MPath) (available uint64, e error) {

	node := dao.factory.Struct()

	var all []int
	var mpathes []struct {
		Mpath1 string
		Mpath2 string
		Mpath3 string
		Mpath4 string
	}

	tx := dao.instance(ctx).
		Model(node).
		Where(tree.MPathLike{Value: mPath}).
		Where("level = ?", mPath.Length()+1).
		Order("mpath1 desc, mpath2 desc, mpath3 desc, mpath4 desc ").
		Find(&mpathes)

	if err := tx.Error; err != nil {
		return 0, err
	}

	all = append(all, 0)

	for _, idxMpath := range mpathes {
		var builder strings.Builder
		builder.WriteString(idxMpath.Mpath1)
		builder.WriteString(idxMpath.Mpath2)
		builder.WriteString(idxMpath.Mpath3)
		builder.WriteString(idxMpath.Mpath4)

		idxs := strings.Split(builder.String(), ".")

		idx, err := strconv.Atoi(idxs[len(idxs)-1])
		if err != nil {
			return 0, err
		}

		all = append(all, idx)
	}

	// All is just [0], return 1 or next ones
	if len(all) == 1 {
		available = 1
		return
	}

	sort.Ints(all)

	max := all[len(all)-1]
	// No missing numbers : jump directly to the end
	if max == len(all)-1 {
		available = uint64(max + 1)
		return
	}

	// Look for available slot - binary search first missing number
	for {
		slot, has, _ := firstAvailableSlot(all, false)
		if !has {
			break
		}

		available = uint64(slot)

		return
	}

	// We should not get here !
	available = uint64(max + 1)

	return
}

// GetNodeChildrenCounts List
func (dao *IndexSQL[T]) GetNodeChildrenCounts(ctx context.Context, mPath *tree.MPath, recursive bool) (int, int) {

	var leafCount, folderCount int
	var node *tree.TreeNode

	tx := dao.instance(ctx).
		Model(&node).
		Select("leaf, count(*) as count").
		Where(tree.MPathLike{Value: mPath})

	if recursive {
		tx = tx.Where("level > ?", mPath.Length())
	} else {
		tx = tx.Where("level = ?", mPath.Length()+1)
	}

	tx.Group("leaf")

	var counts []struct {
		Leaf  int
		Count int
	}

	tx = tx.Find(&counts)

	for _, count := range counts {
		if count.Leaf == int(tree.NodeType_LEAF) {
			leafCount += count.Count
		} else {
			folderCount += count.Count
		}
	}

	return folderCount, leafCount
}

// GetNodeChildrenSize List
func (dao *IndexSQL[T]) GetNodeChildrenSize(ctx context.Context, mPath *tree.MPath) (int, error) {

	var sum int

	node := dao.factory.Struct()

	tx := dao.instance(ctx).
		Model(&node).
		Select("sum(size)").
		Where(tree.MPathLike{Value: mPath}).
		Where("level > ?", mPath.Length()).
		Where("leaf = 1").
		Scan(&sum)

	if tx.Error != nil {
		return 0, tx.Error
	}

	return sum, nil
}

// GetNodeChildren List
func (dao *IndexSQL[T]) GetNodeChildren(ctx context.Context, mPath *tree.MPath, filter ...*tree.MetaFilter) chan interface{} {
	c := make(chan interface{})

	go func() {
		defer close(c)

		tx := dao.instance(ctx).
			Where(tree.MPathLike{Value: mPath}).
			Where("level = ?", mPath.Length()+1)

		nodes := dao.factory.Slice()
		var (
			rowsAffected int64
			batchSize    int = 10000
			batch        int
			totalSize    int
		)

		queryDB := tx.Session(&gorm.Session{})

		for {
			result := queryDB.Order("name").Limit(batchSize).Offset(int(rowsAffected)).Find(&nodes)
			rowsAffected += result.RowsAffected
			batch++

			if result.Error == nil && result.RowsAffected != 0 {
				fcTx := result.Session(&gorm.Session{NewDB: true})
				fcTx.RowsAffected = result.RowsAffected
				tx.AddError(func(fcTx *gorm.DB, batch int) error {
					for _, node := range nodes {
						c <- node
					}

					// returns error will stop future batches
					return nil
				}(fcTx, batch))
			} else if result.Error != nil {
				tx.AddError(result.Error)
			}

			if tx.Error != nil || int(result.RowsAffected) < batchSize {
				break
			}

			if totalSize > 0 {
				if totalSize <= int(rowsAffected) {
					break
				}
				if totalSize/batchSize == batch {
					batchSize = totalSize % batchSize
				}
			}
		}

		if err := tx.Error; err != nil {
			c <- err
		}
	}()

	return c
}

// GetNodeTree List from the path
func (dao *IndexSQL[T]) GetNodeTree(ctx context.Context, mPath *tree.MPath, filter ...*tree.MetaFilter) chan interface{} {
	c := make(chan interface{})

	// Retrieving tree

	go func() {
		defer func() {
			fmt.Println("Closing channel")
			close(c)
		}()

		tx := dao.instance(ctx).
			Where(tree.MPathLike{Value: mPath}).
			Where("level >= ?", mPath.Length())

		nodes := dao.factory.Slice()
		var (
			rowsAffected int64
			batchSize    int = 1000000
			batch        int
			totalSize    int
		)

		if len(filter) > 0 {
			mfWhere, mfArgs := filter[0].Where()

			if mfWhere != "" {
				tx = tx.Where(mfWhere, mfArgs)
			}

			if filter[0].HasSort() {
				tx = tx.Order(filter[0].OrderBy())
			}
		}

		queryDB := tx.Session(&gorm.Session{}).Order("mpath1, mpath2, mpath3, mpath4")

		for {
			//result := queryDB.Limit(batchSize).Offset(int(rowsAffected)).Find(&results)
			result := queryDB.Find(&nodes)
			rowsAffected += result.RowsAffected
			batch++

			fmt.Println(result.Error, result.RowsAffected)

			if result.Error == nil && result.RowsAffected != 0 {
				fcTx := result.Session(&gorm.Session{NewDB: true})
				fcTx.RowsAffected = result.RowsAffected
				tx.AddError(func(fcTx *gorm.DB, batch int) error {
					for _, node := range nodes {
						c <- node
					}

					// returns error will stop future batches
					return nil
				}(fcTx, batch))
			} else if result.Error != nil {
				tx.AddError(result.Error)
			}

			if tx.Error != nil || int(result.RowsAffected) < batchSize {
				break
			}

			if totalSize > 0 {
				if totalSize <= int(rowsAffected) {
					break
				}
				if totalSize/batchSize == batch {
					batchSize = totalSize % batchSize
				}
			}
		}

		if err := tx.Error; err != nil {
			c <- err
		}
	}()

	return c
}

// MoveNodeTree move all the nodes belonging to a tree by calculating the new mpathes
func (dao *IndexSQL[T]) MoveNodeTree(ctx context.Context, nodeFrom tree.ITreeNode, nodeTo tree.ITreeNode) error {

	model := dao.factory.Struct()

	nodeFromMPath := nodeFrom.GetMPath()
	nodeToMPath := nodeTo.GetMPath()
	mpathFromStr := nodeFromMPath.ToString()
	mpathToStr := nodeToMPath.ToString()
	mpathFromLevel := nodeFromMPath.Length()
	mpathToLevel := nodeToMPath.Length()
	levelDiff := mpathToLevel - mpathFromLevel

	mpathTo := []string{nodeToMPath.GetMPath1(), nodeToMPath.GetMPath2(), nodeToMPath.GetMPath3(), nodeToMPath.GetMPath4()}

	if tx := dao.instance(ctx).
		Model(model).
		Omit("uuid").
		Where(nodeFrom).
		Updates(nodeTo); tx.Error != nil {
		return tx.Error
	}

	// Getting the total index for mpath
	totalMPathFrom := len(mpathFromStr)
	totalMPathTo := len(mpathToStr)

	var (
		quoMPathTo = totalMPathTo / indexLen
		modMPathTo = totalMPathTo % indexLen
		mpathSub   = make(map[string]interface{})
	)

	// rows before
	for i := 0; i < quoMPathTo; i++ {
		mpathSub[fmt.Sprintf("mpath%d", i+1)] = mpathTo[i]
	}

	// for the final rows, we do some clever concatenations based on the length of the origin and the target
	maxLen := indexLen * 4
	curIndexFrom := totalMPathFrom
	curIndexTo := totalMPathTo

	for cnt := quoMPathTo; cnt < 4; cnt++ {
		if curIndexFrom >= maxLen || curIndexTo >= maxLen {
			break
		}

		var concat []string

		incr := indexLen
		if cnt == quoMPathTo {
			incr = indexLen - modMPathTo
			concat = append(concat, `'`+mpathTo[cnt]+`'`)
		}
		tarIndexFrom := curIndexFrom + incr
		if tarIndexFrom > maxLen {
			tarIndexFrom = maxLen
		}

		modParts := getModuloParts(curIndexFrom, tarIndexFrom, indexLen)

		for _, modPart := range modParts {
			concat = append(concat, fmt.Sprintf(`SUBSTR(mpath%d, %d, %d)`, modPart.quo+1, modPart.from+1, modPart.to-modPart.from))
		}

		helper := dao.instance(ctx).Dialector.(storagesql.Helper)

		mpathSub[fmt.Sprintf("mpath%d", cnt+1)] = gorm.Expr(helper.Concat(concat...))

		curIndexFrom = tarIndexFrom
		curIndexTo = curIndexTo + incr
	}

	mpathSub["level"] = gorm.Expr("level + ?", levelDiff)

	proto.Reset(model)

	tx := dao.instance(ctx).
		Model(model).
		Where(tree.MPathLike{Value: nodeFromMPath}).
		Where("level >= ?", mpathFromLevel).
		Updates(mpathSub)

	return tx.Error
}

func Path(ctx context.Context, dao DAO, targetNode tree.ITreeNode, parentNode tree.ITreeNode, create bool) (*tree.MPath, []tree.ITreeNode, error) {

	var parentMPath *tree.MPath
	var remainingPath []string
	var currentNode tree.ITreeNode

	targetPath := targetNode.GetNode().GetPath()

	if parentNode != nil {
		parentMPath = parentNode.GetMPath()

		// Making sure the path is sanitized
		remainingPath = getPathParts(targetPath)[parentMPath.Length():]

		if len(remainingPath) > 1 {
			// Cloning the current node
			clone := reflect.New(reflect.TypeOf(parentNode).Elem())

			val := reflect.ValueOf(parentNode).Elem()
			nVal := clone.Elem()
			for i := 0; i < val.NumField(); i++ {
				nvField := nVal.Field(i)
				nvField.Set(val.Field(i))
			}

			currentNode = clone.Interface().(tree.ITreeNode)
		} else {
			currentNode = targetNode
		}
	} else {
		// We're there !
		currentNode = targetNode

		remainingPath = getPathParts(targetPath)[:]
	}

	// We're done - ending the recursive
	if len(remainingPath) == 0 {
		return parentMPath, []tree.ITreeNode{}, nil
	}

	// The current node to be retrieved or created is the first item in the path
	currentName := remainingPath[0]

	// Trying to retrieve the node first
	if existingNode, err := dao.GetNodeChild(ctx, parentMPath, currentName); err != nil && err != gorm.ErrRecordNotFound {
		return nil, nil, err
	} else if existingNode != nil && existingNode.GetMPath() != nil {
		return Path(ctx, dao, targetNode, existingNode, create)
	}

	if !create {
		return nil, nil, errors.New("not found")
	}

	// We must insert
	if parentMPath.Length() == 0 {
		// The current node is the root
		// We hardcode its values and add it

		currentNode.SetMPath(tree.NewMPath(1))

		//currentNode.SetNode(&tree.Node{
		//	Uuid:  "ROOT",
		//	Type:  tree.NodeType_COLLECTION,
		//	Mode:  0777,
		//	MTime: time.Now().Unix(),
		//	Path:  "/",
		//})

		//currentNode.SetName("")
	} else {

		// And finally we create the path in the node
		idx, err := dao.GetNodeFirstAvailableChildIndex(ctx, parentMPath)
		if err != nil {
			return nil, nil, err
		}

		currentNode.SetMPath(parentMPath.Append(idx))
		currentNode.SetName(currentName)

		if len(remainingPath) > 1 {
			// First case, we are not at the last path, we create a folder for the current path
			currentNode.SetNode(&tree.Node{
				Type:  tree.NodeType_COLLECTION,
				Mode:  0777,
				MTime: time.Now().Unix(),
				Path:  path.Clean(path.Join(currentNode.GetNode().GetPath(), currentName)),
			})
		} else {
			currentNode.GetNode().SetMTime(time.Now().Unix())
		}

		if currentNode.GetNode().GetUuid() == "" {
			currentNode.GetNode().SetUuid(uuid.New())
		}

		if currentNode.GetNode().GetEtag() == "" {
			// Should only happen for folders - generate first Etag from uuid+mtime
			currentNode.GetNode().SetEtag(fmt.Sprintf("%x", md5.Sum([]byte(fmt.Sprintf("%s%d", currentNode.GetNode().GetUuid(), currentNode.GetNode().GetMTime())))))
		}
	}

	if err := dao.AddNode(ctx, currentNode); err != nil {
		return nil, nil, err
	}

	// Recursive
	currentMpath := currentNode.GetMPath().String()

	// Making sure we lock the parent node
	cond.L.Lock()
	for {
		current := inserting.Load().(map[string]bool)
		if _, ok := current[currentMpath]; !ok {
			current[currentMpath] = true
			inserting.Store(current)
			break
		}
		cond.Wait()
	}

	cond.L.Unlock()
	defer func() {
		cond.L.Lock()
		current := inserting.Load().(map[string]bool)
		delete(current, currentMpath)
		inserting.Store(current)
		cond.L.Unlock()
		cond.Signal()
	}()

	mpath, createdNodes, err := Path(ctx, dao, targetNode, currentNode, create)

	return mpath, append(createdNodes, currentNode), err
}

func (dao *IndexSQL[T]) Path(ctx context.Context, node tree.ITreeNode, rootNode tree.ITreeNode, create bool) (mpath *tree.MPath, nodeTree []tree.ITreeNode, err error) {
	//dao.instance(ctx).Transaction(func(tx *gorm.DB) error {
	clone := *dao

	mpath, nodeTree, err = Path(ctx, &clone, node, rootNode, create)

	//return nil
	//})

	return
}

// Flatten removes all .pydio from index, at once
func (dao *IndexSQL[T]) Flatten(context.Context) (string, error) {
	return "", errors.New("Not implemented")
}

func (d *IndexSQL[T]) LostAndFounds(ctx context.Context) ([]LostAndFound, error) {
	return nil, nil
}

func (d *IndexSQL[T]) FixLostAndFound(ctx context.Context, lost LostAndFound) error {
	return nil
}

func (dao *IndexSQL[T]) FixRandHash2(ctx context.Context, excludes ...LostAndFound) (int64, error) {
	return 0, nil
}

func (dao *IndexSQL[T]) Convert(val *anypb.Any, in any) (out any, ok bool) {
	return in, false
}

// UpdateNameInPlace in replacement of previous node
func (dao *IndexSQL[T]) UpdateNameInPlace(ctx context.Context, oldName, newName string, knownUuid string, knownLevel int) (int64, error) {

	tx := dao.instance(ctx)

	tx = tx.Where("name", oldName)

	if knownLevel > -1 {
		tx = tx.Where("level", knownLevel)
	} else if knownUuid != "" {
		tx = tx.Where("uuid", knownUuid)
	}

	tx = tx.Update("name", newName)
	if tx.Error != nil {
		return 0, tx.Error
	}

	return tx.RowsAffected, nil

}

// NewBatchSend Creation of the channels
func NewBatchSend() *BatchSend {
	b := new(BatchSend)
	b.in = make(chan tree.ITreeNode)
	b.out = make(chan error, 1)

	return b
}

// Send a node to the batch
func (b *BatchSend) Send(arg interface{}) {
	if node, ok := arg.(tree.ITreeNode); ok {
		b.in <- node
	}
}

// Close the Batch
func (b *BatchSend) Close() error {
	close(b.in)

	err := <-b.out

	return err
}

// Split node.MPath into 4 strings for storing in DB
func prepareMPathParts(str string) (string, string, string, string) {
	mPath := make([]byte, indexLen*4)
	copy(mPath, []byte(str))
	mPath1 := string(bytes.Trim(mPath[(indexLen*0):(indexLen*1)], "\x00"))
	mPath2 := string(bytes.Trim(mPath[(indexLen*1):(indexLen*2)], "\x00"))
	mPath3 := string(bytes.Trim(mPath[(indexLen*2):(indexLen*3)], "\x00"))
	mPath4 := string(bytes.Trim(mPath[(indexLen*3):(indexLen*4)], "\x00"))
	return mPath1, mPath2, mPath3, mPath4
}

func firstAvailableSlot(numbers []int, padStart bool) (missing int, has bool, rest []int) {

	if len(numbers) <= 0 {
		return
	}
	if numbers[0] > 0 {
		if padStart {
			pad := make([]int, numbers[0])
			for i := 0; i < numbers[0]; i++ {
				pad[i] = i
			}
			numbers = append(pad, numbers...)
		} else {
			numbers = append([]int{0}, numbers...)
		}
	}

	left := 0
	right := len(numbers) - 1

	for left <= right {
		middle := (right + left) >> 1
		if numbers[middle] != middle {
			if middle == 0 || numbers[middle-1] == middle-1 {
				return middle, true, numbers[middle:]
			}
			right = middle - 1
		} else {
			left = middle + 1
		}
	}
	return
}

type modPart struct {
	quo  int
	from int
	to   int
}

func getModuloParts(start, end, len int) []modPart {
	startQuo := start / len
	endQuo := end / len

	startMod := start % len
	endMod := end % len

	if startQuo == endQuo {
		return []modPart{{
			quo:  startQuo,
			from: startMod,
			to:   endMod,
		}}
	}

	var ret []modPart

	if startMod != len {
		ret = append(ret, modPart{
			quo:  startQuo,
			from: startMod,
			to:   len,
		})
	}

	for i := startQuo + 1; i < endQuo; i++ {
		ret = append(ret, modPart{
			quo:  i,
			from: 0,
			to:   len,
		})
	}

	if endMod != 0 {
		ret = append(ret, modPart{
			quo:  endQuo,
			from: 0,
			to:   endMod,
		})
	}

	return ret
}

func getPathParts(strpath string) (path []string) {
	if strpath == "" {
		return
	}

	for _, p := range strings.Split(strpath, "/") {
		if p != "" || len(path) == 0 {
			path = append(path, p)
		}
	}

	return
}
