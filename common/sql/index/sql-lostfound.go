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
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package index

import (
	sql2 "database/sql"
	"fmt"
	"strings"

	"github.com/pydio/cells/v4/common/utils/mtree"

	"github.com/pydio/cells/v4/common/sql"
)

func init() {
	queries["deleteNodeUuid"] = func(dao sql.DAO, args ...string) string {
		return `delete from %%PREFIX%%_idx_tree where uuid = ?`
	}

	queries["findDuplicates"] = func(dao sql.DAO, args ...string) string {
		cc := dao.Concat("mpath1", "mpath2", "mpath3", "mpath4")
		return fmt.Sprintf(`
				select
					concat(name, "_") safename,
					SUBSTRING_INDEX(` + cc + `,'.',level - 1) as pmpath,
					min(` + cc + `)
				from
					%%PREFIX%%_idx_tree
				group by safename, pmpath
				having count(pmpath) > 1`)
	}

	queries["findLostChildren"] = func(dao sql.DAO, args ...string) string {
		//cc1 := dao.Concat("t1.mpath1", "t1.mpath2", "t1.mpath3", "t1.mpath4")
		//cc2 := dao.Concat("t2.mpath1", "t2.mpath2", "t2.mpath3", "t2.mpath4")
		return fmt.Sprintf(`
				select
					t1.uuid,
					t1.name,
					t1.leaf,
					t1.mpath1
				from
					%%PREFIX%%_idx_tree t1
				where
					t1.level > 1
				and 
					t1.mpath2 = ''
				and
					NOT EXISTS (SELECT 1 FROM %%PREFIX%%_idx_tree t2 WHERE t2.mpath1=SUBSTRING_INDEX(t1.mpath1,'.',t1.level - 1)) 
		`)
	}

	queries["findDuplicatesForMPath"] = func(dao sql.DAO, args ...string) string {
		cc := dao.Concat("mpath1", "mpath2", "mpath3", "mpath4")
		return fmt.Sprintf(`
				select
					uuid,
					name,
					leaf,
					` + cc + `
				from
					%%PREFIX%%_idx_tree
				where
					name = ?
				and SUBSTRING_INDEX(` + cc + `, '.', level - 1) = ?
				order by char_length(` + cc + `), ` + cc + `
		`)
	}

	queries["fixRandHash2"] = func(dao sql.DAO, args ...string) string {
		hash2 := dao.HashParent("name", "mpath1", "mpath2", "mpath3", "mpath4")
		return `
				update
					%%PREFIX%%_idx_tree
				set 
					hash2 = ` + hash2 + `
				where 
					hash2 like 'random-%'
		`
	}

	queries["fixRandHash2WithExcludes"] = func(dao sql.DAO, args ...string) string {
		hash2 := dao.HashParent("name", "mpath1", "mpath2", "mpath3", "mpath4")
		var marks []string
		for range args {
			marks = append(marks, "?")
		}
		return `
				update
					%%PREFIX%%_idx_tree
				set 
					hash2 = ` + hash2 + `
				where 
					hash2 like 'random-%'
					and
					uuid not in (` + strings.Join(marks, ", ") + `)
		`
	}
}

type lostFoundImpl struct {
	uuids     []string
	lostMPath string
	leaf      bool
}

func (l *lostFoundImpl) String() string {
	if l.IsDuplicate() {
		return "Duplicates : " + strings.Join(l.uuids, ", ")
	} else {
		return "Lost parent for node : " + l.uuids[0] + "(" + l.lostMPath + ")"
	}
}

func (l *lostFoundImpl) IsDir() bool {
	return l.leaf
}

func (l *lostFoundImpl) IsDuplicate() bool {
	return len(l.lostMPath) == 0
}

func (l *lostFoundImpl) IsLostParent() bool {
	return len(l.lostMPath) > 0
}

func (l *lostFoundImpl) GetUUIDs() []string {
	return l.uuids
}

func (l *lostFoundImpl) MarkForDeletion(uuids []string) {
	l.uuids = uuids
}

func (dao *IndexSQL) LostAndFounds() (output []LostAndFound, err error) {
	dao.Lock()
	defer dao.Unlock()

	stmt, er := dao.GetStmt("findDuplicates")
	if er != nil {
		return nil, er
	}
	rows, ca, er := stmt.LongQuery()
	defer ca()
	if er != nil {
		return nil, er
	}
	defer rows.Close()

	type duplicate struct {
		name   string
		pmpath string
	}

	var duplicates []duplicate

	for rows.Next() {
		var safename, pmpath, mpath string
		if err := rows.Scan(&safename, &pmpath, &mpath); err != nil {
			return nil, err
		}
		duplicates = append(duplicates, duplicate{strings.TrimSuffix(safename, "_"), pmpath})
	}
	if e := rows.Err(); e != nil {
		return nil, e
	}

	for _, t := range duplicates {
		stmt, err := dao.GetStmt("findDuplicatesForMPath")
		if err != nil {
			return nil, err
		}

		rows, err := stmt.Query(t.name, t.pmpath)
		if err != nil {
			return nil, err
		}
		lf := &lostFoundImpl{}
		for rows.Next() {
			var uid, name, mpath string
			var leaf bool
			if err := rows.Scan(&uid, &name, &leaf, &mpath); err != nil {
				rows.Close()
				return nil, err
			}
			lf.leaf = leaf
			lf.uuids = append(lf.uuids, uid)
		}
		rE := rows.Err()
		rows.Close()
		if rE != nil {
			return nil, rE
		}
		output = append(output, lf)
	}

	{
		stmt2, er2 := dao.GetStmt("findLostChildren")
		if er2 != nil {
			return nil, er2
		}
		rows2, ca, er2 := stmt2.LongQuery()
		defer ca()
		if er2 != nil {
			return nil, er2
		}
		defer rows2.Close()
		for rows2.Next() {
			var uid, name, mpath string
			var leaf bool
			if err := rows2.Scan(&uid, &name, &leaf, &mpath); err != nil {
				rows2.Close()
				return nil, err
			}
			output = append(output, &lostFoundImpl{
				uuids:     []string{uid},
				leaf:      leaf,
				lostMPath: mpath,
			})
			// Load all children as well
			if !leaf {
				t, _ := dao.GetNodeByUUID(uid)
				for c := range dao.GetNodeTree(t.MPath) {
					if n, o := c.(*mtree.TreeNode); o {
						output = append(output, &lostFoundImpl{uuids: []string{n.Uuid}, lostMPath: n.MPath.String()})
					}
				}
			}

		}
		if e := rows2.Err(); e != nil {
			return nil, e
		}
	}

	return
}

// FixLostAndFound receives LostAndFound that are ready for deletion
func (dao *IndexSQL) FixLostAndFound(lost LostAndFound) error {
	dao.Lock()
	defer dao.Unlock()
	s, e := dao.GetStmt("deleteNodeUuid")
	if e != nil {
		return e
	}
	for _, id := range lost.GetUUIDs() {
		if _, e := s.Exec(id); e != nil {
			return e
		}
	}
	return nil
}

// FixRandHash2 looks up for hash2 in the form 'random-%' and recompute them
// as proper has of parents + name
func (dao *IndexSQL) FixRandHash2(excludes ...LostAndFound) (int64, error) {
	dao.Lock()
	defer dao.Unlock()
	var xUuid []interface{}
	for _, l := range excludes {
		for _, uid := range l.GetUUIDs() {
			xUuid = append(xUuid, uid)
		}
	}

	var s sql.Stmt
	var e error
	if len(xUuid) > 0 {
		s, e = dao.GetStmt("fixRandHash2WithExcludes", xUuid...)
	} else {
		s, e = dao.GetStmt("fixRandHash2")
	}
	if e != nil {
		return 0, e
	}
	var r sql2.Result
	if len(xUuid) > 0 {
		r, e = s.Exec(xUuid...)
	} else {
		r, e = s.Exec()
	}
	var affected int64
	if e == nil {
		if a, e2 := r.RowsAffected(); e2 == nil {
			affected = a
		}
	} else if strings.Contains(e.Error(), "duplicate") { // Replace duplicate by dup, to avoid auto-retry
		return 0, fmt.Errorf(strings.ReplaceAll(e.Error(), "duplicate", "dup"))
	}
	return affected, e
}
