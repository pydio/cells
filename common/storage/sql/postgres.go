package sql

import (
	"database/sql"
	"fmt"
	"strings"

	"gorm.io/gorm"

	"github.com/pydio/cells/v5/common/proto/tree"
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
	return `(string_to_array(` + p.Concat(mm...) + `,'.'))::int[]`
}

func (p *postgresHelper) SupportsAvailableSlot() bool {
	return true
}

func (p *postgresHelper) FirstAvailableSlot(tableName string, mpath *tree.MPath, levelKey string, mpathes ...string) (string, []any, int64, bool) {
	var args []any
	q := `
WITH parsed_data AS (
    SELECT
        SPLIT_PART(` + p.Concat(mpathes...) + `, '.', ?)::int AS numPart
    FROM "` + tableName + `" tr
    WHERE level = ? AND ?
)
SELECT numPart + 1 AS num
FROM parsed_data tr
WHERE NOT EXISTS (
    SELECT 1
    FROM parsed_data tr2
    WHERE tr2.numPart = tr.numPart + 1
)
ORDER BY num
LIMIT 1
`
	level := mpath.Length() + 1
	args = append(args, level)
	args = append(args, level)
	args = append(args, tree.MPathLike{Value: mpath})

	return q, args, 3000, true
}

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
	assigns = append(assigns, "uuid")
	for _, u := range sets {
		if u.Key == "hash" {
			u.Value = gorm.Expr(p.Hash("uv.new_mpath1", "uv.new_mpath2", "uv.new_mpath3", "uv.new_mpath4"))
			namedSets = append(namedSets, fmt.Sprintf("%s=@%s", u.Key, u.Key))
		} else if u.Key == "hash2" {
			u.Value = gorm.Expr(p.HashParent("name", "uv.new_level", "uv.new_mpath1", "uv.new_mpath2", "uv.new_mpath3", "uv.new_mpath4"))
			namedSets = append(namedSets, fmt.Sprintf("%s=@%s", u.Key, u.Key))
		} else {
			switch u.Value.(type) {
			case int, int8, int16, int32, int64:
				assigns = append(assigns, fmt.Sprintf("CAST(@%s AS SMALLINT) AS new_%s", u.Key, u.Key))
			default:
				assigns = append(assigns, fmt.Sprintf("@%s AS new_%s", u.Key, u.Key))
			}
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
