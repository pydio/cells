/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */
package index

import (
	"bytes"
	"context"
	"crypto/md5"
	databasesql "database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/big"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/pydio/cells/common/utils/mtree"

	"github.com/gobuffalo/packr"
	"github.com/pborman/uuid"
	"github.com/rubenv/sql-migrate"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sql"
)

var (
	queries   = map[string]interface{}{}
	mu        atomic.Value
	inserting atomic.Value
	cond      *sync.Cond
)

const (
	batchLen = 20
	indexLen = 767
)

var (
	//	queries = map[string]string{}
	batch = "?" + strings.Repeat(", ?", batchLen-1)
)

// BatchSend sql structure
type BatchSend struct {
	in  chan *mtree.TreeNode
	out chan error
}

func init() {

	inserting.Store(make(map[string]bool))
	cond = sync.NewCond(&sync.Mutex{})

	queries["insertTree"] = func(args ...interface{}) string {
		var num int
		if len(args) == 1 {
			num = args[0].(int)
		}

		str := `insert into %%PREFIX%%_idx_tree (uuid, level, hash, mpath1, mpath2, mpath3, mpath4, rat) values `

		str = str + `(?, ?, ?, ?, ?, ?, ?, ?)`

		for i := 1; i < num; i++ {
			str = str + `, (?, ?, ?, ?, ?, ?, ?, ?)`
		}

		return str
	}
	queries["insertNode"] = func(args ...interface{}) string {
		var num int
		if len(args) == 1 {
			num = args[0].(int)
		}

		str := `insert into %%PREFIX%%_idx_nodes (uuid, name, leaf, mtime, etag, size, mode) values  `

		str = str + `(?, ?, ?, ?, ?, ?, ?)`

		for i := 1; i < num; i++ {
			str = str + `, (?, ?, ?, ?, ?, ?, ?)`
		}

		return str
	}
	queries["insertCommit"] = func(mpathes ...string) string {
		return `
		insert into %%PREFIX%%_idx_commits (uuid, etag, mtime, size)
		values (?, ?, ?, ?)`
	}
	queries["insertCommitWithData"] = func(mpathes ...string) string {
		return `
		insert into %%PREFIX%%_idx_commits (uuid, etag, mtime, size, data)
		values (?, ?, ?, ?, ?)`
	}
	queries["updateTree"] = func(mpathes ...string) string {
		return `
		update %%PREFIX%%_idx_tree set level = ?, hash = ?, mpath1 = ?, mpath2 = ?, mpath3 = ?, mpath4 = ?,  rat = ?
		where uuid = ?`
	}
	queries["updateNode"] = func(mpathes ...string) string {
		return `
		update %%PREFIX%%_idx_nodes set name = ?, leaf = ?, mtime = ?, etag = ?, size = ?, mode = ?
		where uuid = ?`
	}
	queries["deleteCommits"] = func(mpathes ...string) string {
		return `
		delete from %%PREFIX%%_idx_commits where uuid = ?`
	}
	queries["selectCommits"] = func(mpathes ...string) string {
		return `
		select etag, mtime, size, data from %%PREFIX%%_idx_commits where uuid = ? ORDER BY id DESC
	`
	}
	queries["selectNodeUuid"] = func(mpathes ...string) string {
		return `
		select t.uuid, t.level, t.rat, n.name, n.leaf, n.mtime, n.etag, n.size, n.mode
        from %%PREFIX%%_idx_tree t, %%PREFIX%%_idx_nodes n
		where t.uuid = ?
		and n.uuid = t.uuid`
	}
	queries["printTree"] = func(mpathes ...string) string {
		return `SELECT uuid, level, mpath1, rat FROM %%PREFIX%%_idx_tree`
	}
	queries["printNodes"] = func(mpathes ...string) string {
		return `SELECT uuid, name, leaf, mtime, etag, size, mode FROM %%PREFIX%%_idx_nodes`
	}
	queries["integrity1"] = func(mpathes ...string) string {
		return `select count(uuid) from %%PREFIX%%_idx_tree where uuid not in (select uuid from %%PREFIX%%_idx_nodes)`
	}

	queries["integrity2"] = func(mpathes ...string) string {
		return `select count(uuid) from %%PREFIX%%_idx_nodes where uuid not in (select uuid from %%PREFIX%%_idx_tree)`
	}

	queries["updateNodes"] = func(mpathes ...string) (string, []interface{}) {
		sub, args := getMPathesIn("", mpathes...)

		return fmt.Sprintf(`
			update %%PREFIX%%_idx_nodes set mtime = ?, etag = ?, size = size + ?
			where uuid in (
				select uuid from %%PREFIX%%_idx_tree where (%s)
			)`, sub), args
	}

	queries["deleteTree"] = func(mpathes ...string) (string, []interface{}) {
		sub, args := getMPathEqualsOrLike("", []byte(mpathes[0]))

		return fmt.Sprintf(`
			delete from %%PREFIX%%_idx_tree
			where (%s)`, sub), args
	}

	queries["deleteNode"] = func(mpathes ...string) (string, []interface{}) {
		sub, args := getMPathEqualsOrLike("", []byte(mpathes[0]))

		return fmt.Sprintf(`
		delete from %%PREFIX%%_idx_nodes
		where uuid in (
			select uuid
			from %%PREFIX%%_idx_tree
			where (%s)
		)`, sub), args
	}

	queries["selectNode"] = func(mpathes ...string) (string, []interface{}) {
		sub, args := getMPathEquals("t", []byte(mpathes[0]))

		return fmt.Sprintf(`
		select t.uuid, t.level, t.rat, n.name, n.leaf, n.mtime, n.etag, n.size, n.mode
		from %%PREFIX%%_idx_tree t, %%PREFIX%%_idx_nodes n
		where %s
		and n.uuid = t.uuid`, sub), args
	}

	queries["selectNodes"] = func(mpathes ...string) (string, []interface{}) {
		sub, args := getMPathesIn("t", mpathes...)

		return fmt.Sprintf(`
			select t.uuid, t.level, t.rat, n.name, n.leaf, n.mtime, n.etag, n.size, n.mode
			from %%PREFIX%%_idx_tree t, %%PREFIX%%_idx_nodes n
			where (%s)
			and n.uuid = t.uuid
			order by t.mpath1, t.mpath2, t.mpath3, t.mpath4`, sub), args
	}

	queries["tree"] = func(mpathes ...string) (string, []interface{}) {
		sub, args := getMPathLike("t", []byte(mpathes[0]))

		return fmt.Sprintf(`
			select t.uuid, t.level, t.rat, n.name, n.leaf, n.mtime, n.etag, n.size, n.mode
			from %%PREFIX%%_idx_tree t, %%PREFIX%%_idx_nodes n
			where %s
			and t.uuid = n.uuid
			and t.level >= ?
			order by t.mpath1, t.mpath2, t.mpath3, t.mpath4`, sub), args
	}

	queries["children"] = func(mpathes ...string) (string, []interface{}) {
		sub, args := getMPathLike("t", []byte(mpathes[0]))
		return fmt.Sprintf(`
			select t.uuid, t.level, t.rat, n.name, n.leaf, n.mtime, n.etag, n.size, n.mode
			from %%PREFIX%%_idx_tree t, %%PREFIX%%_idx_nodes n
			where %s
			and t.uuid = n.uuid
			and t.level = ?
			order by n.name`, sub), args
	}

	queries["child"] = func(mpathes ...string) (string, []interface{}) {
		sub, args := getMPathLike("t", []byte(mpathes[0]))
		return fmt.Sprintf(`
			select t.uuid, t.level, t.rat, n.name, n.leaf, n.mtime, n.etag, n.size, n.mode
			from %%PREFIX%%_idx_tree t, %%PREFIX%%_idx_nodes n
			where %s
			and t.uuid = n.uuid
			and t.level = ?
			and n.name like ?`, sub), args
	}

	queries["lastChild"] = func(mpathes ...string) (string, []interface{}) {
		sub, args := getMPathLike("t", []byte(mpathes[0]))
		return fmt.Sprintf(`
			select t.uuid, t.level, t.rat, n.name, n.leaf, n.mtime, n.etag, n.size, n.mode
			from %%PREFIX%%_idx_tree t, %%PREFIX%%_idx_nodes n
			where %s
			and t.uuid = n.uuid
			and t.level = ?
			order by t.mpath4, t.mpath3, t.mpath2, t.mpath1 desc limit 1`, sub), args
	}

	queries["childrenEtags"] = func(mpathes ...string) (string, []interface{}) {
		sub, args := getMPathLike("t", []byte(mpathes[0]))
		return fmt.Sprintf(`
			select n.etag
			from %%PREFIX%%_idx_tree t, %%PREFIX%%_idx_nodes n
			where %s
			and t.uuid = n.uuid
			and t.level = ?
			order by n.name`, sub), args
	}

	queries["dirtyEtags"] = func(mpathes ...string) (string, []interface{}) {
		sub, args := getMPathEqualsOrLike("t", []byte(mpathes[0]))
		return fmt.Sprintf(`
			select t.uuid, t.level, t.rat, n.name, n.leaf, n.mtime, n.etag, n.size, n.mode
			from %%PREFIX%%_idx_tree t, %%PREFIX%%_idx_nodes n
			where n.etag = '-1'
			and (%s)
		    and t.uuid = n.uuid
		    and t.level >= ?
			order by t.level DESC`, sub), args
	}

	queries["childrenCount"] = func(mpathes ...string) (string, []interface{}) {
		sub, args := getMPathLike("t", []byte(mpathes[0]))
		return fmt.Sprintf(`
			select count(t.uuid)
			from %%PREFIX%%_idx_tree t, %%PREFIX%%_idx_nodes n
			where %s
			and t.uuid = n.uuid
			and t.level = ?
			order by n.name`, sub), args
	}

}

// IndexSQL implementation
type IndexSQL struct {
	*sql.Handler

	rootNodeId string
}

// Init handles the db version migration and prepare the statements
func (dao *IndexSQL) Init(options common.ConfigValues) error {

	migrations := &sql.PackrMigrationSource{
		Box:         packr.NewBox("../../../common/sql/index/migrations"),
		Dir:         "./" + dao.Driver(),
		TablePrefix: dao.Prefix() + "_idx",
	}

	_, err := sql.ExecMigration(dao.DB(), dao.Driver(), migrations, migrate.Up, dao.Prefix()+"_idx_")
	if err != nil {
		return err
	}

	if prepare, ok := options.Get("prepare").(bool); !ok || prepare {
		for key, query := range queries {
			if err := dao.Prepare(key, query); err != nil {
				return err
			}
		}
	}

	return nil
}

// CleanResourcesOnDeletion revert the creation of the table for a datasource
func (dao *IndexSQL) CleanResourcesOnDeletion() (error, string) {

	migrations := &sql.PackrMigrationSource{
		Box:         packr.NewBox("../../../common/sql/index/migrations"),
		Dir:         "./" + dao.Driver(),
		TablePrefix: dao.Prefix() + "_idx",
	}

	_, err := sql.ExecMigration(dao.DB(), dao.Driver(), migrations, migrate.Down, dao.Prefix()+"_idx_")
	if err != nil {
		return err, ""
	}

	return nil, "Removed tables for index"
}

// AddNode to the mysql database
func (dao *IndexSQL) AddNode(node *mtree.TreeNode) error {

	dao.Lock()
	defer dao.Unlock()

	db := dao.DB()

	var err error

	// Starting a transaction
	tx, err := db.BeginTx(context.Background(), nil)
	if err != nil {
		return err
	}

	// Checking transaction went fine
	defer func() {
		if err != nil {
			tx.Rollback()
		} else {
			tx.Commit()
		}
	}()

	mTime := node.GetMTime()
	if mTime == 0 {
		mTime = time.Now().Unix()
	}

	insertNode := dao.GetStmt("insertNode")
	if insertNode == nil {
		return fmt.Errorf("Unknown statement")
	}
	defer insertNode.Close()

	insertTree := dao.GetStmt("insertTree")
	if insertTree == nil {
		return fmt.Errorf("Unknown statement")
	}
	defer insertTree.Close()

	if stmt := tx.Stmt(insertNode); stmt != nil {
		defer stmt.Close()

		if _, err = stmt.Exec(
			node.Uuid,
			node.Name(),
			node.IsLeafInt(),
			mTime,
			node.GetEtag(),
			node.GetSize(),
			node.GetMode(),
		); err != nil {
			return err
		}
	} else {
		return fmt.Errorf("Empty statement")
	}

	mpath := make([]byte, indexLen*4)
	copy(mpath, []byte(node.MPath.String()))
	mpath1 := string(bytes.Trim(mpath[(indexLen*0):(indexLen*1-1)], "\x00"))
	mpath2 := string(bytes.Trim(mpath[(indexLen*1):(indexLen*2-1)], "\x00"))
	mpath3 := string(bytes.Trim(mpath[(indexLen*2):(indexLen*3-1)], "\x00"))
	mpath4 := string(bytes.Trim(mpath[(indexLen*3):(indexLen*4-1)], "\x00"))

	if stmt := tx.Stmt(insertTree); stmt != nil {
		defer stmt.Close()

		if _, err = stmt.Exec(
			node.Uuid,
			node.Level,
			node.MPath.Hash(),
			mpath1,
			mpath2,
			mpath3,
			mpath4,
			node.Bytes(),
		); err != nil {
			return err
		}
	} else {
		return fmt.Errorf("Empty statement")
	}

	if err := dao.checkIntegrity("AddNode"); err != nil {
		return err
	}

	return nil
}

// AddNodeStream creates a channel to write to the database to the mysql database
func (dao *IndexSQL) AddNodeStream(max int) (chan *mtree.TreeNode, chan error) {

	c := make(chan *mtree.TreeNode)
	e := make(chan error)

	go func() {

		defer close(e)
		// defer close(b)

		insert := func(num int, valsInsertNodes []interface{}, valsInsertTree []interface{}) error {
			dao.Lock()
			defer dao.Unlock()

			db := dao.DB()

			// Starting a transaction
			tx, err := db.BeginTx(context.Background(), nil)
			if err != nil {
				return err
			}

			// Checking transaction went fine
			defer func() {
				if err != nil {
					fmt.Println("We have an error before committing", err)
					tx.Rollback()
				} else {
					tx.Commit()
				}
			}()

			insertNode := dao.GetStmt("insertNode", num)
			if insertNode == nil {
				return fmt.Errorf("Unknown statement")
			}
			defer insertNode.Close()

			insertTree := dao.GetStmt("insertTree", num)
			if insertTree == nil {
				return fmt.Errorf("Unknown statement")
			}
			defer insertTree.Close()

			if stmt := tx.Stmt(insertNode); stmt != nil {
				defer stmt.Close()

				if _, err = stmt.Exec(valsInsertNodes...); err != nil {
					return err
				}
			} else {
				return fmt.Errorf("Empty statement")
			}

			if stmt := tx.Stmt(insertTree); stmt != nil {
				defer stmt.Close()

				if _, err = stmt.Exec(valsInsertTree...); err != nil {
					return err
				}
			} else {
				return fmt.Errorf("Empty statement")
			}

			return nil
		}

		valsInsertNodes := []interface{}{}
		valsInsertTree := []interface{}{}

		var count int
		for node := range c {

			mTime := node.GetMTime()
			if mTime == 0 {
				mTime = time.Now().Unix()
			}

			mpath := make([]byte, indexLen*4)
			copy(mpath, []byte(node.MPath.String()))
			mpath1 := string(bytes.Trim(mpath[(indexLen*0):(indexLen*1-1)], "\x00"))
			mpath2 := string(bytes.Trim(mpath[(indexLen*1):(indexLen*2-1)], "\x00"))
			mpath3 := string(bytes.Trim(mpath[(indexLen*2):(indexLen*3-1)], "\x00"))
			mpath4 := string(bytes.Trim(mpath[(indexLen*3):(indexLen*4-1)], "\x00"))

			valsInsertNodes = append(valsInsertNodes, node.Uuid, node.Name(), node.IsLeafInt(), mTime, node.GetEtag(), node.GetSize(), node.GetMode())
			valsInsertTree = append(valsInsertTree, node.Uuid, node.Level, node.MPath.Hash(), mpath1, mpath2, mpath3, mpath4, node.Bytes())

			count = count + 1

			if count >= max {

				if err := insert(max, valsInsertNodes, valsInsertTree); err != nil {
					e <- err
				}

				count = 0
				valsInsertNodes = []interface{}{}
				valsInsertTree = []interface{}{}

			}
		}

		if count > 0 {
			if err := insert(count, valsInsertNodes, valsInsertTree); err != nil {
				e <- err
			}
		}
	}()

	return c, e
}

// Flush the database in case of cached inserts
func (dao *IndexSQL) Flush(final bool) error {
	return nil
}

// SetNode in replacement of previous node
func (dao *IndexSQL) SetNode(node *mtree.TreeNode) error {

	dao.Lock()
	defer dao.Unlock()

	db := dao.DB()

	var err error

	tx, err := db.BeginTx(context.Background(), nil)
	if err != nil {
		return err
	}

	defer func() {
		if err != nil {
			tx.Rollback()
		} else {
			tx.Commit()
		}
	}()

	mpath := make([]byte, indexLen*4)
	copy(mpath, []byte(node.MPath.String()))
	mpath1 := string(bytes.Trim(mpath[(indexLen*0):(indexLen*1-1)], "\x00"))
	mpath2 := string(bytes.Trim(mpath[(indexLen*1):(indexLen*2-1)], "\x00"))
	mpath3 := string(bytes.Trim(mpath[(indexLen*2):(indexLen*3-1)], "\x00"))
	mpath4 := string(bytes.Trim(mpath[(indexLen*3):(indexLen*4-1)], "\x00"))

	// TODO : Transaction is not really used here as stmts are taken from dao.
	// It is disabled as it can create locks when updating nodes in batch
	updateTree := dao.GetStmt("updateTree")
	if updateTree == nil {
		return fmt.Errorf("Unknown statement")
	}
	defer updateTree.Close()

	updateNode := dao.GetStmt("updateNode")
	if updateNode == nil {
		return fmt.Errorf("Unknown statement")
	}
	defer updateNode.Close()

	if stmt := tx.Stmt(updateTree); stmt != nil {
		defer stmt.Close()

		if _, err = stmt.Exec(
			node.Level,
			node.MPath.Hash(),
			mpath1,
			mpath2,
			mpath3,
			mpath4,
			node.Bytes(),
			node.Uuid,
		); err != nil {
			return err
		}
	} else {
		return fmt.Errorf("Empty statement")
	}

	if stmt := tx.Stmt(updateNode); stmt != nil {
		defer stmt.Close()

		if _, err = stmt.Exec(
			node.Name(),
			node.IsLeafInt(),
			node.MTime,
			node.Etag,
			node.Size,
			node.Mode,
			node.Uuid,
		); err != nil {
			return err
		}
	} else {
		return fmt.Errorf("Empty statement")
	}

	if checkErr := dao.checkIntegrity("SetNode End"); checkErr != nil {
		return checkErr
	}

	return nil
}

// PushCommit adds a commit version to the node
func (dao *IndexSQL) PushCommit(node *mtree.TreeNode) error {

	dao.Lock()
	defer dao.Unlock()

	db := dao.DB()

	// Starting a transaction
	tx, err := db.BeginTx(context.Background(), nil)
	if err != nil {
		return err
	}

	defer func() {
		if err != nil {
			tx.Rollback()
		} else {
			tx.Commit()
		}
	}()

	mTime := node.MTime
	if mTime == 0 {
		mTime = time.Now().Unix()
	}
	if stmt := dao.GetStmt("insertCommit"); stmt != nil {
		defer stmt.Close()

		if _, err = stmt.Exec(
			node.Uuid,
			node.Etag,
			mTime,
			node.Size,
		); err != nil {
			return err
		}
	} else {
		return fmt.Errorf("Empty statement")
	}

	return nil
}

// DeleteCommits removes the commit versions of the node
func (dao *IndexSQL) DeleteCommits(node *mtree.TreeNode) error {

	dao.Lock()
	defer dao.Unlock()
	if stmt := dao.GetStmt("deleteCommits"); stmt != nil {
		defer stmt.Close()

		_, err := stmt.Exec(node.Uuid)
		if err != nil {
			return err
		}
	} else {
		return fmt.Errorf("Empty statement")
	}

	return nil
}

// ListCommits returns a list of all commit versions for a node
func (dao *IndexSQL) ListCommits(node *mtree.TreeNode) (commits []*tree.ChangeLog, err error) {

	dao.Lock()

	var rows *databasesql.Rows
	defer func() {
		if rows != nil {
			rows.Close()
		}
		dao.Unlock()
	}()

	// First we check if we already have an object with the same key
	if stmt := dao.GetStmt("selectCommits"); stmt != nil {
		defer stmt.Close()

		rows, err = stmt.Query(node.Uuid)
		if err != nil {
			return commits, err
		}
	} else {
		return commits, fmt.Errorf("Empty statement")
	}
	for rows.Next() {
		var uid string
		var mtime int64
		var size int64
		var data []byte
		e := rows.Scan(
			&uid,
			&mtime,
			&size,
			&data,
		)
		if e != nil {
			return commits, e
		}
		changeLog := &tree.ChangeLog{
			Uuid:  uid,
			MTime: mtime,
			Size:  size,
			Data:  data,
		}
		commits = append(commits, changeLog)
	}

	return commits, err
}

func (dao *IndexSQL) etagFromChildren(node *mtree.TreeNode) (string, error) {

	SEPARATOR := "."
	hasher := md5.New()
	dao.Lock()

	var rows *databasesql.Rows
	var err error
	defer func() {
		if rows != nil {
			rows.Close()
		}
		dao.Unlock()
	}()

	mpath := node.MPath

	// First we check if we already have an object with the same key
	if stmt, args := dao.GetStmtWithArgs("childrenEtags", mpath.String()); stmt != nil {
		defer stmt.Close()

		rows, err = stmt.Query(append(args, len(mpath)+1)...)
		if err != nil {
			return "", err
		}
	} else {
		return "", fmt.Errorf("Empty statement")
	}

	first := true
	for rows.Next() {
		var etag string
		rows.Scan(&etag)
		if !first {
			hasher.Write([]byte(SEPARATOR))
		}
		hasher.Write([]byte(etag))
		first = false
	}

	return hex.EncodeToString(hasher.Sum(nil)), nil
}

// ResyncDirtyEtags ensures that etags are rightly calculated
func (dao *IndexSQL) ResyncDirtyEtags(rootNode *mtree.TreeNode) error {

	dao.Lock()

	var rows *databasesql.Rows
	var err error

	mpath := rootNode.MPath
	if stmt, args := dao.GetStmtWithArgs("dirtyEtags", mpath.String()); stmt != nil {
		defer stmt.Close()

		rows, err = stmt.Query(append(args, len(mpath))...) // Start at root level
		if err != nil {
			dao.Unlock()
			return err
		}
	} else {
		return fmt.Errorf("Empty statement")
	}
	var nodesToUpdate []*mtree.TreeNode
	for rows.Next() {
		node, e := dao.scanDbRowToTreeNode(rows)
		if e != nil {
			rows.Close()
			dao.Unlock()
			return e
		}
		nodesToUpdate = append(nodesToUpdate, node)
	}
	log.Logger(context.Background()).Info("Total Nodes Resynced", zap.Any("t", len(nodesToUpdate)))
	rows.Close()
	dao.Unlock()

	for _, node := range nodesToUpdate {
		log.Logger(context.Background()).Info("Resyncing Etag For Node", zap.Any("n", node))
		newEtag, eE := dao.etagFromChildren(node)
		if eE != nil {
			return eE
		}
		log.Logger(context.Background()).Info("Computed Etag For Node", zap.Any("etag", newEtag))
		if stmt := dao.GetStmt("updateNode"); stmt != nil {
			defer stmt.Close()

			if _, err = stmt.Exec(
				node.Name(),
				node.IsLeafInt(),
				node.MTime,
				newEtag,
				node.Size,
				node.Mode,
				node.Uuid,
			); err != nil {
				return err
			}
		} else {
			return fmt.Errorf("Empty statement")
		}
	}
	return nil

}

// SetNodes returns a channel and waits for arriving nodes before updating them in batch
func (dao *IndexSQL) SetNodes(etag string, deltaSize int64) sql.BatchSender {

	b := NewBatchSend()

	go func() {
		dao.Lock()
		defer dao.Unlock()

		db := dao.DB()

		defer func() {
			close(b.out)
		}()

		insert := func(mpathes ...interface{}) {
			// Starting a transaction
			tx, err := db.BeginTx(context.Background(), &databasesql.TxOptions{
				Isolation: databasesql.LevelReadUncommitted,
			})
			if err != nil {
				return
			}

			// Checking transaction went fine
			defer func() {
				if err != nil {
					tx.Rollback()
				} else {
					tx.Commit()
				}
			}()

			updateNodes, args := dao.GetStmtWithArgs("updateNodes", mpathes...)

			if stmt := tx.Stmt(updateNodes); stmt != nil {
				defer stmt.Close()

				if _, err = stmt.Exec(append([]interface{}{time.Now().Unix(), etag, deltaSize}, args...)...); err != nil {
					b.out <- err
				}
			} else {
				b.out <- fmt.Errorf("empty stmt")
			}
		}

		all := make([]interface{}, 0, batchLen)

		for node := range b.in {
			all = append(all, node.MPath.String())
			if len(all) == cap(all) {
				insert(all...)
				all = all[:0]
			}
		}

		if len(all) > 0 {
			// for len(all) < cap(all) {
			// 	all = append(all, "-1")
			// }
			insert(all...)
		}

	}()

	return b
}

// DelNode from database
func (dao *IndexSQL) DelNode(node *mtree.TreeNode) error {

	dao.Lock()
	defer dao.Unlock()

	db := dao.DB()

	var err error

	tx, err := db.BeginTx(context.Background(), nil)
	if err != nil {
		return err
	}

	defer func() {
		if err != nil {
			tx.Rollback()
		} else {
			tx.Commit()
		}
	}()

	// Node
	mpath := node.MPath.String()

	if stmt, args := dao.GetStmtWithArgs("deleteNode", mpath); stmt != nil {
		defer stmt.Close()

		if _, err = stmt.Exec(args...); err != nil {
			return err
		}
	} else {
		return fmt.Errorf("Empty statement")
	}

	if stmt, args := dao.GetStmtWithArgs("deleteTree", mpath); stmt != nil {
		defer stmt.Close()

		if _, err = stmt.Exec(args...); err != nil {
			return err
		}
	} else {
		return fmt.Errorf("Empty statement")
	}

	/*
		if len(dao.commitsTableName) > 0 {
			if _, err = dao.GetStmt("deleteCommits").Exec(
				mpath, mpathLike,
			); err != nil {
				return err
			}
		}
	*/

	if errCheck := dao.checkIntegrity("DelNodeEnd " + node.Path); errCheck != nil {
		return errCheck
	}

	return nil
}

// GetNode from path
func (dao *IndexSQL) GetNode(path mtree.MPath) (*mtree.TreeNode, error) {

	dao.Lock()
	defer dao.Unlock()

	if len(path) == 0 {
		return nil, fmt.Errorf("Empty path")
	}

	node := mtree.NewTreeNode()
	node.SetMPath(path...)

	mpath := node.MPath.String()

	if stmt, args := dao.GetStmtWithArgs("selectNode", mpath); stmt != nil {
		defer stmt.Close()

		row := stmt.QueryRow(args...)
		treeNode, err := dao.scanDbRowToTreeNode(row)
		if err != nil {
			return nil, err
		}
		return treeNode, nil
	} else {
		return nil, fmt.Errorf("Empty statement")
	}
}

// GetNodeByUUID returns the node stored with the unique uuid
func (dao *IndexSQL) GetNodeByUUID(uuid string) (*mtree.TreeNode, error) {

	dao.Lock()
	defer dao.Unlock()

	if stmt := dao.GetStmt("selectNodeUuid"); stmt != nil {
		defer stmt.Close()

		row := stmt.QueryRow(uuid)
		treeNode, err := dao.scanDbRowToTreeNode(row)
		if err != nil && err != sql.ErrNoRows {
			return nil, err
		}

		return treeNode, nil
	}

	return nil, fmt.Errorf("Empty statement")
}

// GetNodes List
func (dao *IndexSQL) GetNodes(mpathes ...mtree.MPath) chan *mtree.TreeNode {

	dao.Lock()

	c := make(chan *mtree.TreeNode)

	go func() {

		defer func() {
			close(c)
			dao.Unlock()
		}()

		get := func(mpathes ...interface{}) {
			if stmt, args := dao.GetStmtWithArgs("selectNodes", mpathes...); stmt != nil {

				defer stmt.Close()

				rows, err := stmt.Query(args...)
				if err != nil {
					return
				}
				defer rows.Close()

				for rows.Next() {
					node, err := dao.scanDbRowToTreeNode(rows)
					if err != nil {
						break
					}

					c <- node
				}
			} else {
				fmt.Errorf("Unknown statement")
				return
			}
		}

		all := make([]interface{}, 0, batchLen)

		for _, mpath := range mpathes {
			all = append(all, mpath.String())
			if len(all) == cap(all) {
				get(all...)
				all = all[:0]
			}
		}

		if len(all) > 0 {
			get(all...)
		}
	}()

	return c
}

// GetNodeChild from node path whose name matches
func (dao *IndexSQL) GetNodeChild(reqPath mtree.MPath, reqName string) (*mtree.TreeNode, error) {

	dao.Lock()
	defer dao.Unlock()

	node := mtree.NewTreeNode()
	node.SetMPath(reqPath...)

	mpath := node.MPath

	if stmt, args := dao.GetStmtWithArgs("child", mpath.String()); stmt != nil {
		defer stmt.Close()

		row := stmt.QueryRow(append(args, len(reqPath)+1, reqName)...)
		treeNode, err := dao.scanDbRowToTreeNode(row)
		if err != nil {
			return nil, err
		}
		return treeNode, nil
	}

	return nil, fmt.Errorf("Empty statement")
}

// GetNodeLastChild from path
func (dao *IndexSQL) GetNodeLastChild(reqPath mtree.MPath) (*mtree.TreeNode, error) {

	dao.Lock()
	defer dao.Unlock()

	node := mtree.NewTreeNode()
	node.SetMPath(reqPath...)

	mpath := node.MPath

	if stmt, args := dao.GetStmtWithArgs("lastChild", mpath.String()); stmt != nil {
		defer stmt.Close()

		row := stmt.QueryRow(append(args, len(reqPath)+1)...)
		treeNode, err := dao.scanDbRowToTreeNode(row)
		if err != nil {
			return nil, err
		}
		return treeNode, nil
	}

	return nil, fmt.Errorf("Empty statement")
}

// GetNodeFirstAvailableChildIndex from path
func (dao *IndexSQL) GetNodeFirstAvailableChildIndex(reqPath mtree.MPath) (uint64, error) {

	all := []int{}

	for node := range dao.GetNodeChildren(reqPath) {
		all = append(all, int(node.MPath.Index()))
	}

	if len(all) == 0 {
		return 1, nil
	}

	sort.Ints(all)
	max := all[len(all)-1]

	for i := 1; i <= max; i++ {
		found := false
		for _, v := range all {
			if i == v {
				// We found the entry, so next one
				found = true
				break
			}
		}

		if !found {
			// This number is not present, returning it
			return uint64(i), nil
		}
	}

	return uint64(max + 1), nil
}

// GetNodeChildrenCount List
func (dao *IndexSQL) GetNodeChildrenCount(path mtree.MPath) int {

	dao.Lock()
	defer dao.Unlock()

	node := mtree.NewTreeNode()
	node.SetMPath(path...)

	mpath := node.MPath

	res := 0

	// First we check if we already have an object with the same key
	if stmt, args := dao.GetStmtWithArgs("childrenCount", mpath.String()); stmt != nil {
		defer stmt.Close()

		row := stmt.QueryRow(append(args, len(path)+1)...)
		if row == nil {
			return 0
		}

		row.Scan(&res)
	}

	return res
}

// GetNodeChildren List
func (dao *IndexSQL) GetNodeChildren(path mtree.MPath) chan *mtree.TreeNode {

	dao.Lock()

	c := make(chan *mtree.TreeNode)

	go func() {
		var rows *databasesql.Rows
		var err error

		defer func() {
			if rows != nil {
				rows.Close()
			}
			close(c)
			dao.Unlock()
		}()

		node := mtree.NewTreeNode()
		node.SetMPath(path...)

		mpath := node.MPath

		// First we check if we already have an object with the same key
		if stmt, args := dao.GetStmtWithArgs("children", mpath.String()); stmt != nil {
			defer stmt.Close()

			rows, err = stmt.Query(append(args, len(path)+1)...)
			if err != nil {
				return
			}

			for rows.Next() {
				treeNode, err := dao.scanDbRowToTreeNode(rows)
				if err != nil {
					break
				}
				c <- treeNode
			}
		}
	}()

	return c
}

// GetNodeTree List from the path
func (dao *IndexSQL) GetNodeTree(path mtree.MPath) chan *mtree.TreeNode {

	dao.Lock()

	c := make(chan *mtree.TreeNode)

	go func() {
		var rows *databasesql.Rows
		var err error

		defer func() {
			if rows != nil {
				rows.Close()
			}

			close(c)
			dao.Unlock()
		}()

		node := mtree.NewTreeNode()
		node.SetMPath(path...)

		mpath := node.MPath

		// First we check if we already have an object with the same key
		if stmt, args := dao.GetStmtWithArgs("tree", mpath.String()); stmt != nil {
			defer stmt.Close()

			rows, err = stmt.Query(append(args, len(mpath)+1)...)
			if err != nil {
				return
			}

			for rows.Next() {
				treeNode, err := dao.scanDbRowToTreeNode(rows)
				if err != nil {
					break
				}

				c <- treeNode
			}
		}
	}()

	return c
}

// MoveNodeTree move all the nodes belonging to a tree by calculating the new mpathes
func (dao *IndexSQL) MoveNodeTree(nodeFrom *mtree.TreeNode, nodeTo *mtree.TreeNode) error {

	var err error
	var pathFrom, pathTo mtree.MPath
	pathFrom = nodeFrom.MPath
	pathTo = nodeTo.MPath

	ppf := pathFrom.Parent()
	if len(ppf) == 0 {
		return fmt.Errorf("Cannot move root")
	}

	ppt := pathTo.Parent()
	if len(ppt) == 0 {
		return fmt.Errorf("Cannot replace root")
	}

	pf0, psf0, pf1, psf1 := mtree.NewRat(), mtree.NewRat(), mtree.NewRat(), mtree.NewRat()
	pf0.SetMPath(ppf...)
	psf0.SetMPath(ppf.Sibling()...)

	pf1.SetMPath(ppt...)
	psf1.SetMPath(ppt.Sibling()...)

	var idx uint64
	m, n := new(big.Int), new(big.Int)

	if idx, err = dao.GetNodeFirstAvailableChildIndex(ppt); err != nil {
		return fmt.Errorf("Could not retrieve new materialized path " + nodeTo.Path)
	}

	m.SetUint64(idx)
	n.SetUint64(uint64(pathFrom[len(pathFrom)-1]))

	p0 := mtree.NewMatrix(pf0.Num(), psf0.Num(), pf0.Denom(), psf0.Denom())
	p1 := mtree.NewMatrix(pf1.Num(), psf1.Num(), pf1.Denom(), psf1.Denom())
	toPath := nodeTo.Path

	var updateErrors []error

	update := func(node *mtree.TreeNode) {
		M0 := mtree.NewMatrix(node.NV(), node.SNV(), node.DV(), node.SDV())
		M1 := mtree.MoveSubtree(p0, m, p1, n, M0)
		rat := mtree.NewRat()
		rat.SetFrac(M1.GetA11(), M1.GetA12())
		node.SetRat(rat)

		filenames := strings.Split(toPath, "/")

		// We only update the node name for the root node
		// Checking the level vs the filenames is one way to check we're at the root
		if node.Level <= len(filenames) {
			node.SetName(filenames[node.Level-1])
		}

		if e := dao.SetNode(node); e != nil {
			updateErrors = append(updateErrors, e)
		}
	}

	// Updating the original node
	update(nodeFrom)

	var nodes []*mtree.TreeNode

	for node := range dao.GetNodeTree(pathFrom) {
		nodes = append(nodes, node)
	}

	for _, node := range nodes {
		update(node)
	}

	if len(updateErrors) > 0 {
		return updateErrors[0]
	}

	return nil
}

func (dao *IndexSQL) scanDbRowToTreeNode(row sql.Scanner) (*mtree.TreeNode, error) {
	var (
		uuid  string
		rat   []byte
		level uint32
		name  string
		leaf  int32
		mtime int64
		etag  string
		size  int64
		mode  int32
	)

	if err := row.Scan(&uuid, &level, &rat, &name, &leaf, &mtime, &etag, &size, &mode); err != nil {
		return nil, err
	}
	nodeType := tree.NodeType_LEAF
	if leaf == 0 {
		nodeType = tree.NodeType_COLLECTION
	}

	node := mtree.NewTreeNode()
	node.SetBytes(rat)

	metaName, _ := json.Marshal(name)
	node.Node = &tree.Node{
		Uuid:      uuid,
		Type:      nodeType,
		MTime:     mtime,
		Etag:      etag,
		Size:      size,
		Mode:      mode,
		MetaStore: map[string]string{"name": string(metaName)},
	}

	return node, nil
}

func (dao *IndexSQL) Path(strpath string, create bool, reqNode ...*tree.Node) (mtree.MPath, []*mtree.TreeNode, error) {

	var path mtree.MPath
	var err error

	created := []*mtree.TreeNode{}

	if len(strpath) == 0 || strpath == "/" {
		return []uint64{1}, created, nil
	}

	names := strings.Split(fmt.Sprintf("/%s", strings.TrimLeft(strpath, "/")), "/")

	path = make([]uint64, len(names))
	path[0] = 1
	parents := make([]*mtree.TreeNode, len(names))

	// Reading root path
	node, err := dao.GetNode(path[0:1])
	if err != nil || node == nil {
		// Making sure we have a node in the database
		rootNodeId := "ROOT"
		if dao.rootNodeId != "" {
			rootNodeId = dao.rootNodeId
		}
		node = NewNode(&tree.Node{
			Uuid: rootNodeId,
			Type: tree.NodeType_COLLECTION,
		}, []uint64{1}, []string{""})

		if err = dao.AddNode(node); err != nil {
			// Has it been created elsewhere ?
			node, err = dao.GetNode(path[0:1])
			if err != nil || node == nil {
				return path, created, err
			}
		} else {
			created = append(created, node)
		}
	}

	parents[0] = node

	maxLevel := len(names) - 1

	for level := 1; level <= maxLevel; level++ {

		p := node

		if create {
			// Making sure we lock the parent node
			cond.L.Lock()
			for {
				current := inserting.Load().(map[string]bool)

				if _, ok := current[p.Uuid]; !ok {
					current[p.Uuid] = true
					inserting.Store(current)
					break
				}

				cond.Wait()
			}
			cond.L.Unlock()
		}

		node, _ = dao.GetNodeChild(path[0:level], names[level])

		if nil != node {
			res := new(big.Int)

			res.Sub(node.NV(), p.NV())
			res.Div(res, p.SNV())
			path[level] = res.Uint64()
			parents[level] = node

			node.Path = strings.Trim(strings.Join(names[0:level], "/"), "/")
		} else {
			if create {
				if path[level], err = dao.GetNodeFirstAvailableChildIndex(path[0:level]); err != nil {
					return nil, created, err
				}

				if level == len(names)-1 && len(reqNode) > 0 {
					node = NewNode(reqNode[0], path[0:level+1], names[0:level+1])
				} else {
					node = NewNode(&tree.Node{
						Type:  tree.NodeType_COLLECTION,
						Mode:  0777,
						MTime: time.Now().Unix(),
					}, path[0:level+1], names[0:level+1])
				}

				if node.Uuid == "" {
					node.Uuid = uuid.New()
				}

				if node.Etag == "" {
					// Should only happen for folders - generate first Etag from uuid+mtime
					node.Etag = fmt.Sprintf("%x", md5.Sum([]byte(fmt.Sprintf("%s%d", node.Uuid, node.MTime))))
				}

				err = dao.AddNode(node)

				cond.L.Lock()
				current := inserting.Load().(map[string]bool)
				delete(current, p.Uuid)
				inserting.Store(current)
				cond.L.Unlock()

				cond.Signal()

				if err != nil {
					return nil, created, err
				}

				created = append(created, node)

				parents[level] = node
			} else {
				return nil, created, nil
			}

		}

		if create {
			cond.L.Lock()
			current := inserting.Load().(map[string]bool)
			delete(current, p.Uuid)
			inserting.Store(current)
			cond.L.Unlock()

			cond.Signal()
		}
	}

	return path, created, err
}

func (dao *IndexSQL) checkIntegrity(cat string) error {
	return nil

	ctx := context.Background()

	if stmt := dao.GetStmt("integrity1"); stmt != nil {
		defer stmt.Close()

		row := stmt.QueryRow()
		var count int
		row.Scan(&count)
		if count > 0 {
			log.Logger(ctx).Error(fmt.Sprintf("[%s] There are %d entries in tree that are not in nodes!", cat, count))
			return nil
		}
	} else {
		return fmt.Errorf("Empty statement")
	}

	if stmt := dao.GetStmt("integrity2"); stmt != nil {
		defer stmt.Close()

		row := stmt.QueryRow()
		var count int
		row.Scan(&count)
		if count > 0 {
			log.Logger(ctx).Debug(fmt.Sprintf("[%s] There are %d entries in tree that are not in tree!", cat, count))
			return nil
		}
	} else {
		return fmt.Errorf("Empty statement")
	}
	log.Logger(ctx).Debug(fmt.Sprintf("[%s] Integrity test PASSED", cat))
	return nil
}

func (dao *IndexSQL) lock() {
	if current, ok := mu.Load().(*sync.Mutex); ok {
		current.Lock()
	}
}

func (dao *IndexSQL) unlock() {
	if current, ok := mu.Load().(*sync.Mutex); ok {
		current.Unlock()
	}
}

// NewBatchSend Creation of the channels
func NewBatchSend() *BatchSend {
	b := new(BatchSend)
	b.in = make(chan *mtree.TreeNode)
	b.out = make(chan error, 1)

	return b
}

// Send a node to the batch
func (b *BatchSend) Send(arg interface{}) {
	if node, ok := arg.(*mtree.TreeNode); ok {
		b.in <- node
	}
}

// Close the Batch
func (b *BatchSend) Close() error {
	close(b.in)

	err := <-b.out

	return err
}

// where t.mpath = ?
func getMPathEquals(tableAlias string, mpath []byte) (string, []interface{}) {
	var res []string
	var args []interface{}

	if tableAlias != "" {
		tableAlias = tableAlias + "."
	}

	for {
		var cnt int
		cnt = (len(mpath) - 1) / indexLen
		res = append(res, fmt.Sprintf(`%smpath%d LIKE ?`, tableAlias, cnt+1))
		args = append(args, mpath[(cnt*indexLen):])

		if idx := cnt * indexLen; idx == 0 {
			break
		}

		mpath = mpath[0 : cnt*indexLen]
	}

	return strings.Join(res, " and "), args
}

// t.mpath LIKE ?
func getMPathLike(tableAlias string, mpath []byte) (string, []interface{}) {
	var res []string
	var args []interface{}

	if tableAlias != "" {
		tableAlias = tableAlias + "."
	}

	mpath = append(mpath, []byte(".%")...)

	done := false
	for {
		var cnt int
		cnt = (len(mpath) - 1) / indexLen

		if !done {
			res = append(res, fmt.Sprintf(`%smpath%d LIKE ?`, tableAlias, cnt+1))
			args = append(args, mpath[(cnt*indexLen):])
			done = true
		} else {
			res = append(res, fmt.Sprintf(`%smpath%d LIKE ?`, tableAlias, cnt+1))
			args = append(args, mpath[(cnt*indexLen):])
		}

		if idx := cnt * indexLen; idx == 0 {
			break
		}

		mpath = mpath[0 : cnt*indexLen]
	}

	return strings.Join(res, " and "), args
}

// and (t.mpath = ? OR t.mpath LIKE ?)
func getMPathEqualsOrLike(tableAlias string, mpath []byte) (string, []interface{}) {
	var res []string
	var args []interface{}

	if tableAlias != "" {
		tableAlias = tableAlias + "."
	}

	mpath = append(mpath, []byte(".%")...)

	done := false
	for {
		var cnt int
		cnt = (len(mpath) - 1) / indexLen

		if !done {
			res = append(res, fmt.Sprintf(`%smpath%d LIKE ?`, tableAlias, cnt+1))
			res = append(res, fmt.Sprintf(`%smpath%d LIKE ?`, tableAlias, cnt+1))

			args = append(args, mpath[(cnt*indexLen):len(mpath)-2], mpath[(cnt*indexLen):])

			done = true
		} else {
			res = append(res, fmt.Sprintf(`%smpath%d LIKE "%s"`, tableAlias, cnt+1, mpath[(cnt*indexLen):]))
		}

		if idx := cnt * indexLen; idx == 0 {
			break
		}

		mpath = mpath[0 : cnt*indexLen]
	}

	return strings.Join(res, " or "), args
}

// where t.mpath in (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
func getMPathesIn(tableAlias string, mpathes ...string) (string, []interface{}) {
	var res []string
	var args []interface{}

	for _, mpath := range mpathes {
		r, a := getMPathEquals(tableAlias, []byte(mpath))
		res = append(res, fmt.Sprintf(`(%s)`, r))
		args = append(args, a...)
	}

	return strings.Join(res, " or "), args
}
