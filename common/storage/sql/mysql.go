/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package sql

import (
	"database/sql"
	"fmt"
	"strings"

	"gorm.io/gorm"

	"github.com/pydio/cells/v5/common/proto/tree"
)

type mysqlHelper struct{}

func (m *mysqlHelper) Concat(s ...string) string {
	if len(s) == 1 {
		return s[0]
	}

	return `CONCAT(` + strings.Join(s, ", ") + `)`
}

func (m *mysqlHelper) ParentMPath(levelKey string, mpathes ...string) string {
	return `SUBSTRING_INDEX(` + m.Concat(mpathes...) + `, '.', ` + levelKey + `-1)`
}

func (m *mysqlHelper) Hash(s ...string) string {
	return `SHA1(` + m.Concat(s...) + `)`
}

func (m *mysqlHelper) HashParent(nameKey string, levelKey string, mpathes ...string) string {
	return m.Hash(nameKey, "'__###PARENT_HASH###__'", m.ParentMPath(levelKey, mpathes...))
}

func (m *mysqlHelper) ApplyOrderedUpdates(db *gorm.DB, tableName string, sets []OrderedUpdate, wheres []sql.NamedArg) (int64, error) {
	var namedSets []string
	var namedWheres []string
	var args []interface{}

	for _, w := range wheres {
		namedWheres = append(namedWheres, "@"+w.Name)
		args = append(args, w)
	}

	for _, u := range sets {
		namedSets = append(namedSets, fmt.Sprintf("%s=@%s", u.Key, u.Key))
		args = append(args, sql.Named(u.Key, u.Value))
	}

	q := fmt.Sprintf("UPDATE `%s` SET %s WHERE %s", tableName, strings.Join(namedSets, ", "), strings.Join(namedWheres, " AND "))
	tx := db.Exec(q, args...)
	return tx.RowsAffected, tx.Error
}

func (m *mysqlHelper) MPathOrdering(mm ...string) string {
	return strings.Join(mm, ", ")
}

func (m *mysqlHelper) FirstAvailableSlot(tableName string, mpath *tree.MPath, levelKey string, mpathes ...string) (string, []any, int64, bool) {
	// Not performant, linearly growing
	/*
			var args []any
			q := `
		SELECT MIN(num + 1) AS first_missing
		FROM (
		         SELECT
		             CAST(SUBSTRING_INDEX(` + m.Concat(mpathes...) + `, '.', -1) AS UNSIGNED) AS num
		         FROM ` + tableName + `
		         WHERE ? AND level = ?
		     ) t
		WHERE NOT EXISTS (
		    SELECT 1
		    FROM ` + tableName + `
		    WHERE ? AND level = ?
		      AND CAST(SUBSTRING_INDEX(` + m.Concat(mpathes...) + `, '.', -1) AS UNSIGNED) = t.num + 1
		);
		`
			level := mpath.Length() + 1
			args = append(args, tree.MPathLike{Value: mpath})
			args = append(args, level)
			args = append(args, tree.MPathLike{Value: mpath})
			args = append(args, level)

			return q, args, 3000, true

	*/
	return "", nil, 0, false
}

const (
	MySQLDriver = "mysql"
)
