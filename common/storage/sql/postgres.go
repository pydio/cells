package sql

import (
	"database/sql"
	"fmt"
	"strings"

	"gorm.io/gorm"
)

type postgresHelper struct{}

func (p *postgresHelper) Concat(s ...string) string {
	if len(s) == 1 {
		return s[0]
	}

	return `CONCAT(` + strings.Join(s, ", ") + `)`
}

func (p *postgresHelper) ParentMPath(levelKey string, mpathes ...string) string {
	return `array_to_string(ARRAY(SELECT unnest(string_to_array(` + p.Concat(mpathes...) + `, '.')) LIMIT ` + levelKey + ` - 1), '.')`
}

func (p *postgresHelper) Hash(s ...string) string {
	return `ENCODE(DIGEST(` + p.Concat(s...) + `, 'sha1'), 'hex')`
}

func (p *postgresHelper) HashParent(nameKey string, levelKey string, mpathes ...string) string {
	return p.Hash(nameKey, "'__###PARENT_HASH###__'", p.ParentMPath(levelKey, mpathes...))
}

func (p *postgresHelper) MPathOrdering(mm ...string) string {
	for i, m := range mm {
		mm[i] = `(string_to_array("` + m + `", '.'))::int[]`
	}
	return strings.Join(mm, ", ")
}

/*
WITH updated_values AS (
    SELECT
        id,
        CONCAT('1.3', SUBSTR(mpath1, 7, 249), SUBSTR(mpath2, 1, 3)) AS new_mpath1,
        CONCAT(SUBSTR(mpath2, 4, 252), SUBSTR(mpath3, 1, 3)) AS new_mpath2,
        CONCAT(SUBSTR(mpath3, 4, 252), SUBSTR(mpath4, 1, 3)) AS new_mpath3,
        SUBSTR(mpath4, 4, 252) AS new_mpath4,
        level + -1 AS new_level
    FROM data_index_s3_tree_nodes
    WHERE mpath1 LIKE '1.11.8.%' AND level >= 3
)
UPDATE data_index_s3_tree_nodes
SET
    mpath1 = uv.new_mpath1,
    mpath2 = uv.new_mpath2,
    mpath3 = uv.new_mpath3,
    mpath4 = uv.new_mpath4,
    level = uv.new_level,
    hash = ENCODE(DIGEST(CONCAT(uv.new_mpath1, uv.new_mpath2, uv.new_mpath3, uv.new_mpath4), 'sha1'), 'hex'),
    hash2 = ENCODE(DIGEST(CONCAT(name, '__###PARENT_HASH###__', array_to_string(ARRAY(SELECT unnest(string_to_array(CONCAT(uv.new_mpath1, uv.new_mpath2, uv.new_mpath3, uv.new_mpath4), '.')) LIMIT uv.new_level - 1), '.')), 'sha1'), 'hex')
FROM updated_values uv
WHERE data_index_s3_tree_nodes.id = uv.id;

*/

func (p *postgresHelper) ApplyOrderedUpdates(db *gorm.DB, tableName string, sets []OrderedUpdate, wheres []sql.NamedArg) (int64, error) {

	tx1 := db.Exec("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
	if tx1.Error != nil {
		return 0, tx1.Error
	}

	var namedSets []string
	var namedWheres []string
	var args []interface{}

	for _, w := range wheres {
		namedWheres = append(namedWheres, "@"+w.Name)
		args = append(args, w)
	}

	var assigns []string
	//var assignsArgs []interface{}

	assigns = append(assigns, "uuid")
	for _, u := range sets {
		if u.Key == "hash" {
			u.Value = gorm.Expr(p.Hash("uv.new_mpath1", "uv.new_mpath2", "uv.new_mpath3", "uv.new_mpath4"))
			namedSets = append(namedSets, fmt.Sprintf("%s=@%s", u.Key, u.Key))
		} else if u.Key == "hash2" {
			u.Value = gorm.Expr(p.HashParent("name", "uv.new_level", "uv.new_mpath1", "uv.new_mpath2", "uv.new_mpath3", "uv.new_mpath4"))
			namedSets = append(namedSets, fmt.Sprintf("%s=@%s", u.Key, u.Key))
		} else {
			assigns = append(assigns, fmt.Sprintf("@%s AS new_%s", u.Key, u.Key))
			namedSets = append(namedSets, fmt.Sprintf("\"%s\"=uv.new_%s", u.Key, u.Key))
		}
		args = append(args, sql.Named(u.Key, u.Value))

	}

	q := fmt.Sprintf("WITH updated_values AS ( SELECT %s FROM \"%s\" WHERE %s )", strings.Join(assigns, ", "), tableName, strings.Join(namedWheres, " AND "))
	q += " " + fmt.Sprintf("UPDATE \"%s\" SET %s FROM updated_values AS uv WHERE \"%s\".uuid=uv.uuid", tableName, strings.Join(namedSets, ", "), tableName)
	tx := db.Exec(q, args...)
	return tx.RowsAffected, tx.Error
}

const (
	PostgreDriver = "postgres"
)
