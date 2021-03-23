package index

import (
	"fmt"
	"strings"

	"github.com/pydio/cells/common/sql"
)

func init() {
	queries["deleteNodeUuid"] = func(dao sql.DAO, args ...string) string {
		return `delete from %%PREFIX%%_idx_tree where uuid = ?`
	}

	queries["findDuplicates"] = func(dao sql.DAO, args ...string) string {
		cc := dao.Concat("mpath1", "mpath2", "mpath3", "mpath4")
		return fmt.Sprintf(`
				select
					name,
					SUBSTRING_INDEX(` + cc + `,'.',level - 1) as pmpath,
					min(` + cc + `)
				from
					%%PREFIX%%_idx_tree
				group by concat(name, "_"), pmpath
				having count(pmpath) > 1`)
	}

	queries["findLostChildren"] = func(dao sql.DAO, args ...string) string {
		cc1 := dao.Concat("t1.mpath1", "t1.mpath2", "t1.mpath3", "t1.mpath4")
		cc2 := dao.Concat("t2.mpath1", "t2.mpath2", "t2.mpath3", "t2.mpath4")
		return fmt.Sprintf(`
				select
					t1.uuid,
					t1.name,
					t1.leaf,
					` + cc1 + `
				from
					%%PREFIX%%_idx_tree t1
				where
					t1.level > 1 
				and
					NOT EXISTS (SELECT 1 FROM %%PREFIX%%_idx_tree t2 WHERE ` + cc2 + `=SUBSTRING_INDEX(` + cc1 + `,'.',t1.level - 1)) 
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
					name like ?
				and SUBSTRING_INDEX(` + cc + `, '.', level - 1) = ?
				order by char_length(` + cc + `), ` + cc + `
		`)
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
	rows, er := stmt.Query()
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
		var name, pmpath, mpath string
		if err := rows.Scan(&name, &pmpath, &mpath); err != nil {
			return nil, err
		}
		duplicates = append(duplicates, duplicate{name, pmpath})
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
		rows.Close()
		output = append(output, lf)
	}

	{
		stmt2, er2 := dao.GetStmt("findLostChildren")
		if er2 != nil {
			return nil, er2
		}
		rows2, er2 := stmt2.Query()
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
					output = append(output, &lostFoundImpl{uuids: []string{c.Uuid}, lostMPath: c.MPath.String()})
				}
			}

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
