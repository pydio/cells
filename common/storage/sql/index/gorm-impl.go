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
	"context"
	"crypto/md5"
	"database/sql"
	"encoding/hex"
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
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/options/orm"
	"github.com/pydio/cells/v4/common/proto/tree"
	storagesql "github.com/pydio/cells/v4/common/storage/sql"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var (
	inserting atomic.Value
	cond      *sync.Cond

	batchLen = 20
	indexLen = 255
)

func init() {
	inserting.Store(make(map[string]bool))
	cond = sync.NewCond(&sync.Mutex{})
}

func RegisterIndexLen(len int) {
	indexLen = len
}

var _ DAO = (*gormImpl[*tree.TreeNode])(nil)

// gormImpl implementation
type gormImpl[T tree.ITreeNode] struct {
	DB      *gorm.DB
	factory Factory[T]
}

func (dao *gormImpl[T]) instance(ctx context.Context) *gorm.DB {

	cachesPlugin := &caches.Caches{Conf: &caches.Config{
		// Easer: true, // TODO - disabled that at super-fact calls to GetNodeChild() randomly return results
		// Cacher: NewCacher(c),
	}}

	dao.DB.Use(cachesPlugin)

	t := dao.factory.Struct()
	msg := proto.GetExtension(t.ProtoReflect().Descriptor().Options(), orm.E_OrmPolicy).(*orm.ORMMessagePolicy)

	for _, options := range msg.GetOptions() {
		if options.GetType() == dao.DB.Dialector.Name() {
			dao.DB.Set("gorm:table_options", options.GetValue())
		}
	}

	return dao.DB.WithContext(ctx)
}

func (dao *gormImpl[T]) Migrate(ctx context.Context) error {
	t := dao.factory.Struct()
	db := dao.instance(ctx)

	if db.Name() == storagesql.MySQLDriver {
		db = db.Set("gorm:table_options", "CHARSET=ascii")
	}

	if er := db.AutoMigrate(t); er != nil {
		return er
	}

	if db.Name() == storagesql.MySQLDriver {
		tName := storagesql.TableNameFromModel(db, t)
		var schemaName, collation string
		db.Raw("SELECT DATABASE()").Scan(&schemaName)
		if schemaName != "" {
			// Check current collation
			db.Raw(`SELECT COLLATION_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = 'name'`, schemaName, tName).Scan(&collation)
			if !strings.Contains(strings.ToLower(collation), "utf8mb4") {
				tx := db.Exec("ALTER TABLE `" + tName + "` MODIFY COLUMN name VARCHAR(255) COLLATE utf8mb4_bin")
				return tx.Error
			}
		}
	}
	return nil
}

// AddNode to the underlying SQL DB.
func (dao *gormImpl[T]) AddNode(ctx context.Context, node tree.ITreeNode) error {
	mTime := node.GetNode().GetMTime()
	if mTime <= 0 {
		node.GetNode().SetMTime(mTime)
	}

	return dao.instance(ctx).Create(node).Error
}

// AddNodeStream creates a channel to write to the SQL database
func (dao *gormImpl[T]) AddNodeStream(ctx context.Context, max int) (chan tree.ITreeNode, chan error) {

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
func (dao *gormImpl[T]) Flush(ctx context.Context, final bool) error {
	return nil
}

// SetNode in replacement of previous node
func (dao *gormImpl[T]) SetNode(ctx context.Context, node tree.ITreeNode) error {
	return dao.instance(ctx).Model(node).Updates(node).Error
}

// SetNodeMeta in replacement of previous node
func (dao *gormImpl[T]) SetNodeMeta(ctx context.Context, node tree.ITreeNode) error {
	return dao.SetNode(ctx, node)
}

// ResyncDirtyEtags ensures that etags are rightly calculated
func (dao *gormImpl[T]) ResyncDirtyEtags(ctx context.Context, rootNode tree.ITreeNode) error {

	dirtyNodes := dao.factory.Slice()
	node := dao.factory.Struct()

	tx := dao.instance(ctx).
		Model(node).
		Where(tree.MPathEqualsOrLike{Value: rootNode.GetMPath()}).
		Where("level >= ?", rootNode.GetLevel()).
		Where("etag = '-1'").
		Order("level desc").
		FindInBatches(&dirtyNodes, 100, func(tx *gorm.DB, batch int) error {
			for _, dirtyNode := range dirtyNodes {
				etagNodes := dao.factory.Slice()
				dao.instance(ctx).
					Model(&node).
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
func (dao *gormImpl[T]) SetNodes(ctx context.Context, etag string, deltaSize int64) BatchSender {

	b := NewBatchSend()
	model := dao.factory.Struct()

	go func() {
		defer func() {
			close(b.out)
		}()

		insert := func(mpathes ...*tree.MPath) {
			tx := dao.instance(ctx).
				Model(model).
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
func (dao *gormImpl[T]) DelNode(ctx context.Context, node tree.ITreeNode) error {
	return dao.instance(ctx).
		Where(tree.MPathEqualsOrLike{Value: node.GetMPath()}).
		Delete(&node).Error
}

// GetNode from path
func (dao *gormImpl[T]) GetNode(ctx context.Context, path *tree.MPath) (tree.ITreeNode, error) {
	node := dao.factory.Struct()

	tx := dao.instance(ctx).Where(tree.MPathEquals{Value: path}).Find(&node)
	if err := tx.Error; err != nil {
		return nil, err
	}

	if tx.RowsAffected == 0 {
		return nil, errors.WithStack(errors.NodeNotFound)
	}

	return node, nil
}

// GetNodeByUUID returns the node stored with the unique uuid
func (dao *gormImpl[T]) GetNodeByUUID(ctx context.Context, uuid string) (tree.ITreeNode, error) {

	node := dao.factory.Struct()

	tx := dao.instance(ctx).Where("uuid = ?", uuid).Find(&node)
	if err := tx.Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.Tag(err, errors.NodeNotFound)
		}
		return nil, err
	}

	if tx.RowsAffected == 0 {
		return nil, errors.WithMessage(errors.NodeNotFound, "node not found for UUID "+uuid)
	}

	return node, nil
}

// GetNodes Find Nodes for a list of MPaths - If MPaths is empty it returns zero nodes
func (dao *gormImpl[T]) GetNodes(ctx context.Context, mpathes ...*tree.MPath) chan tree.ITreeNode {

	c := make(chan tree.ITreeNode)

	go func() {
		defer close(c)

		if len(mpathes) == 0 {
			return
		}

		nodes := dao.factory.Slice()

		tx := dao.instance(ctx)
		helper := tx.Dialector.(storagesql.Helper)

		if len(mpathes) > 0 {
			tx = tx.Where(tree.MPathsEquals{Values: mpathes})
		}

		sorting := helper.MPathOrdering(strings.Split(tree.MetaSortMPath, ",")...)
		tx = tx.
			Order(sorting).
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
func (dao *gormImpl[T]) GetNodeChild(ctx context.Context, mPath *tree.MPath, name string) (tree.ITreeNode, error) {
	node := dao.factory.Struct()

	tx := dao.instance(ctx)

	if mPath.Length() > 0 {
		tx = tx.Where(tree.MPathLike{Value: mPath})
	}
	tx = tx.Where("level = ?", mPath.Length()+1)
	tx = tx.Where("name = ?", name)

	//tx = tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&node)
	// Try without Locking
	tx = tx.First(&node)

	if err := tx.Error; err != nil {
		return nil, err
	}

	if tx.RowsAffected == 0 {
		return nil, gorm.ErrRecordNotFound
	}

	return node, nil
}

// GetNodeLastChild from path
func (dao *gormImpl[T]) GetNodeLastChild(ctx context.Context, mPath *tree.MPath) (tree.ITreeNode, error) {
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
		return nil, errors.WithStack(errors.NodeNotFound)
	}

	return node, nil
}

// GetNodeFirstAvailableChildIndex from path
func (dao *gormImpl[T]) GetNodeFirstAvailableChildIndex(ctx context.Context, mPath *tree.MPath) (available uint64, e error) {

	node := dao.factory.Struct()
	tx := dao.instance(ctx).Model(node)
	helper := tx.Dialector.(storagesql.Helper)
	tx = tx.
		Where(tree.MPathLike{Value: mPath}).
		Where("level = ?", mPath.Length()+1)

	query, args, limit, supports := helper.FirstAvailableSlot(storagesql.TableNameFromModel(tx, node), mPath, "level", "mpath1", "mpath2", "mpath3", "mpath4")

	if supports {
		var c int64
		if limit > 0 {
			tx.Count(&c)
		}
		if limit == 0 || c > limit {
			tx = tx.Raw(query, args...).Scan(&available)
			if tx.Error != nil {
				return 0, tx.Error
			}
			return available, nil
		}
	}

	var all []int
	var mpathes []struct {
		Mpath1 string
		Mpath2 string
		Mpath3 string
		Mpath4 string
	}

	tx = tx.
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

	maxIdx := all[len(all)-1]
	// No missing numbers : jump directly to the end
	if maxIdx == len(all)-1 {
		available = uint64(maxIdx + 1)
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
	available = uint64(maxIdx + 1)

	return
}

// GetNodeChildrenCounts List
func (dao *gormImpl[T]) GetNodeChildrenCounts(ctx context.Context, mPath *tree.MPath, recursive bool) (int, int) {

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
func (dao *gormImpl[T]) GetNodeChildrenSize(ctx context.Context, mPath *tree.MPath) (int, error) {

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
// TODO - FILTER
func (dao *gormImpl[T]) GetNodeChildren(ctx context.Context, mPath *tree.MPath, filter ...*tree.MetaFilter) chan interface{} {
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
				_ = tx.AddError(func(fcTx *gorm.DB, batch int) error {
					for _, node := range nodes {
						c <- node
					}

					// returns error will stop future batches
					return nil
				}(fcTx, batch))
			} else if result.Error != nil {
				_ = tx.AddError(result.Error)
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
func (dao *gormImpl[T]) GetNodeTree(ctx context.Context, mPath *tree.MPath, filter ...*tree.MetaFilter) chan interface{} {
	c := make(chan interface{})

	// Retrieving tree

	go func() {
		defer func() {
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

		sortSet := false
		helper := tx.Dialector.(storagesql.Helper)

		if len(filter) > 0 {
			mfWhere, mfArgs := filter[0].Where()

			if mfWhere != "" {
				tx = tx.Where(mfWhere, mfArgs)
			}

			if filter[0].HasSort() {
				sField, sDir := filter[0].OrderBy()
				if sField == tree.MetaSortMPath {
					sField = helper.MPathOrdering(strings.Split(tree.MetaSortMPath, ",")...)
				}
				tx = tx.Order(sField + " " + sDir)
				sortSet = true
			}
		}

		if !sortSet {
			sorting := helper.MPathOrdering(strings.Split(tree.MetaSortMPath, ",")...)
			tx = tx.Order(sorting)
		}

		for {
			//result := queryDB.Limit(batchSize).Offset(int(rowsAffected)).Find(&results)
			result := tx.Find(&nodes)
			rowsAffected += result.RowsAffected
			batch++

			if result.Error == nil && result.RowsAffected != 0 {
				fcTx := result.Session(&gorm.Session{NewDB: true})
				fcTx.RowsAffected = result.RowsAffected
				_ = tx.AddError(func(fcTx *gorm.DB, batch int) error {
					for _, node := range nodes {
						c <- node
					}

					// returns error will stop future batches
					return nil
				}(fcTx, batch))
			} else if result.Error != nil {
				_ = tx.AddError(result.Error)
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
func (dao *gormImpl[T]) MoveNodeTree(ctx context.Context, nodeFrom tree.ITreeNode, nodeTo tree.ITreeNode) error {

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
		updates    []storagesql.OrderedUpdate
	)

	// rows before
	for i := 0; i < quoMPathTo; i++ {
		updates = append(updates, storagesql.OrderedUpdate{Key: fmt.Sprintf("mpath%d", i+1), Value: mpathTo[i]})
	}

	// for the final rows, we do some clever concatenations based on the length of the origin and the target
	maxLen := indexLen * 4
	curIndexFrom := totalMPathFrom
	curIndexTo := totalMPathTo
	helper := dao.instance(ctx).Dialector.(storagesql.Helper)

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

		updates = append(updates, storagesql.OrderedUpdate{Key: fmt.Sprintf("mpath%d", cnt+1), Value: gorm.Expr(helper.Concat(concat...))})

		curIndexFrom = tarIndexFrom
		curIndexTo = curIndexTo + incr
	}

	updates = append(updates, storagesql.OrderedUpdate{Key: "level", Value: gorm.Expr("level + ?", levelDiff)})

	if hash := helper.Hash("mpath1", "mpath2", "mpath3", "mpath4"); hash != "" {
		updates = append(updates, storagesql.OrderedUpdate{Key: "hash", Value: gorm.Expr(hash)})
	}
	if hash2 := helper.HashParent("name", "level", "mpath1", "mpath2", "mpath3", "mpath4"); hash2 != "" {
		updates = append(updates, storagesql.OrderedUpdate{Key: "hash2", Value: gorm.Expr(hash2)})
	}

	db := dao.instance(ctx)
	tableName := storagesql.TableNameFromModel(db, model)
	var wheres []sql.NamedArg
	wheres = append(wheres, sql.Named("wTreeLike", tree.MPathLike{Value: nodeFromMPath}))
	wheres = append(wheres, sql.Named("wLevel", gorm.Expr("level >= ?", mpathFromLevel)))
	rows, er := helper.ApplyOrderedUpdates(db, tableName, updates, wheres)
	log.Logger(ctx).Debug("Children rows affected by MoveNodeTree", zap.Int64("rows", rows))
	return er

}

func (dao *gormImpl[T]) ResolveMPath(ctx context.Context, create bool, node *tree.ITreeNode, rootNode ...tree.ITreeNode) (mpath *tree.MPath, nodeTree []tree.ITreeNode, err error) {
	clone := *dao
	origN := (*node).GetNode().Clone()
	var root tree.ITreeNode
	if len(rootNode) > 0 {
		root = rootNode[0]
	} else {
		root = dao.factory.Struct() //tree.EmptyTreeNode()
	}

	mpath, nodeTree, err = toMPath(ctx, &clone, *node, root, create)
	// Retry on "Creation + DuplicateKey"
	if create && err != nil && errors.Is(err, gorm.ErrDuplicatedKey) {
		r := 0
		for {
			<-time.After(time.Duration((r+1)*50) * time.Millisecond)
			retryNode := dao.factory.Struct()
			retryNode.SetNode(origN.Clone())
			mpath, nodeTree, err = toMPath(ctx, &clone, retryNode, root, create)
			if err == nil || !errors.Is(err, gorm.ErrDuplicatedKey) || r >= 4 {
				*node = retryNode
				log.Logger(ctx).Debug("Created mpath after retry", (*node).GetNode().Zap())
				return
			}
			r++
		}
	}
	return
}

// Flatten removes all .pydio from index, at once
func (dao *gormImpl[T]) Flatten(ctx context.Context) (string, error) {

	model := dao.factory.Struct()
	model.SetName(common.PydioSyncHiddenFile)
	model.GetNode().SetType(tree.NodeType_LEAF)
	tx := dao.instance(ctx).Delete(model)
	if err := tx.Error; err != nil {
		return "", err
	}
	return fmt.Sprintf("Removed %d .pydio nodes", tx.RowsAffected), nil

}

// CleanResourcesOnDeletion revert the creation of the table for a datasource
func (dao *gormImpl[T]) CleanResourcesOnDeletion(context.Context) (string, error) {
	return "Removed tables for index", nil
}

// LostAndFounds performs a couple of issue detection routines (duplicates, lost-parents)
func (dao *gormImpl[T]) LostAndFounds(ctx context.Context) ([]LostAndFound, error) {
	var ll []LostAndFound

	// Find Duplicates
	tx := dao.instance(ctx)
	helper := tx.Dialector.(storagesql.Helper)
	model := dao.factory.Struct()

	type duplicate struct {
		Safename string
		Pmpath   string
		Minmpath string
	}
	var duplicates []duplicate

	mpaths := []string{"mpath1", "mpath2", "mpath3", "mpath4"}
	parentMPathExpr := helper.ParentMPath("level", mpaths...)

	selects := []string{
		helper.Concat("name", "'_'") + " as safename",
		parentMPathExpr + " as pmpath",
		"min(" + helper.Concat(mpaths...) + ") as minmpath",
	}
	tx = tx.Model(model).
		Select(strings.Join(selects, ", ")).
		Group("safename,pmpath").
		Having("count("+parentMPathExpr+") > ?", 1). //Pg does not support alias in Having
		Scan(&duplicates)
	if tx.Error != nil {
		return nil, tx.Error
	}
	for _, res := range duplicates {
		// Remove suffix
		res.Safename = strings.TrimSuffix(res.Safename, "_")
		nodes := dao.factory.Slice()
		tx2 := dao.instance(ctx).
			Model(model).
			Where("name = ?", res.Safename).
			Where(parentMPathExpr+"= ?", res.Pmpath).
			Order(helper.MPathOrdering(mpaths...)).
			Scan(&nodes)
		if tx2.Error != nil {
			return nil, tx2.Error
		}
		lf := &lostFoundImpl{}
		for _, node := range nodes {
			lf.leaf = node.GetNode().IsLeaf()
			lf.uuids = append(lf.uuids, node.GetNode().GetUuid())
		}
		ll = append(ll, lf)
	}

	// Now find lost children
	losts := dao.factory.Slice()
	txSub := dao.instance(ctx).Model(model)
	tName := storagesql.TableNameFromModel(txSub, model)
	tx3 := dao.instance(ctx).
		Table(txSub.Statement.Quote(tName)+" t1").
		Where("t1.level > ?", 1).
		Where("NOT EXISTS (?)",
			txSub.Table(txSub.Statement.Quote(tName)+" t2").
				Select("1").
				Where(helper.Concat("t2.mpath1", "t2.mpath2", "t2.mpath3", "t2.mpath4")+" = "+helper.ParentMPath("t1.level", "t1.mpath1", "t1.mpath2", "t1.mpath3", "t1.mpath4")),
		).
		Scan(&losts)
	if tx3.Error != nil {
		return nil, tx3.Error
	}
	for _, lost := range losts {
		ll = append(ll, &lostFoundImpl{
			uuids:     []string{lost.GetNode().GetUuid()},
			lostMPath: lost.GetMPath().ToString(),
			leaf:      lost.GetNode().IsLeaf(),
		})
		// load children if there are
		for c := range dao.GetNodeTree(ctx, lost.GetMPath()) {
			childNode := c.(tree.ITreeNode)
			ll = append(ll, &lostFoundImpl{
				uuids:     []string{childNode.GetNode().GetUuid()},
				lostMPath: childNode.GetMPath().ToString(),
				leaf:      childNode.GetNode().IsLeaf(),
			})
		}
	}

	return ll, nil
}

// FixLostAndFound simply gets a list of UUIDs to be deleted
func (dao *gormImpl[T]) FixLostAndFound(ctx context.Context, lost LostAndFound) error {

	model := dao.factory.Struct()
	tx := dao.instance(ctx)
	tx.Model(model).Where("uuid IN ?", lost.GetUUIDs()).Delete(model)
	return tx.Error

}

// UpdateNameInPlace in replacement of previous node
func (dao *gormImpl[T]) UpdateNameInPlace(ctx context.Context, oldName, newName string, knownUuid string, knownLevel int) (int64, error) {

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

func toMPath(ctx context.Context, dao DAO, targetNode tree.ITreeNode, parentNode tree.ITreeNode, create bool) (*tree.MPath, []tree.ITreeNode, error) {

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
			for _, f := range reflect.VisibleFields(val.Type()) {
				if f.IsExported() {
					nvField := nVal.FieldByName(f.Name)
					nvField.Set(val.FieldByName(f.Name))
				}
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
	if currentName == "" {
		currentName = targetNode.GetName()
	}

	// Trying to retrieve the node first
	if existingNode, err := dao.GetNodeChild(ctx, parentMPath, currentName); err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil, err
	} else if existingNode != nil && existingNode.GetMPath() != nil {
		return toMPath(ctx, dao, targetNode, existingNode, create)
	}

	if !create {
		return nil, nil, errors.WithStack(errors.NodeNotFound)
	}

	// We must insert
	if parentMPath == nil || parentMPath.Length() == 0 {
		// The current node is the root
		// We hardcode its values and add it

		currentNode.SetMPath(tree.NewMPath(1))
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

	if currentNode.GetNode() == nil {
		fmt.Println("Setting UUID HERE, Is it expected?", currentNode.GetMPath().ToString())
		currentNode.SetNode(&tree.Node{Uuid: uuid.New()})
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

	mpath, createdNodes, err := toMPath(ctx, dao, targetNode, currentNode, create)

	return mpath, append(createdNodes, currentNode), err
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
