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

package sql

import (
	"crypto/sha1"
	"database/sql"
	"database/sql/driver"
	"encoding/hex"
	"fmt"
	"regexp"
	"strings"

	sqlite "github.com/glebarez/go-sqlite"
	"gorm.io/gorm"

	_ "github.com/glebarez/sqlite"
)

const (
	SqliteDriver = "sqlite"
	SharedMemDSN = "file::memory:?mode=memory&cache=shared"
)

func init() {

	regex := func(s, re string) (bool, error) {
		ok, err := regexp.MatchString(re, s)
		return ok, err
	}
	_ = regex
	scalar := func(ctx *sqlite.FunctionContext, args []driver.Value) (driver.Value, error) {
		s := args[0].(string)
		re := args[1].(string)
		ok, err := regexp.MatchString(re, s)
		return ok, err
	}

	e := sqlite.RegisterScalarFunction("regexp_like", 2, scalar)
	if e != nil {
		panic(e)
	}
	e = sqlite.RegisterScalarFunction("REGEXP_LIKE", 2, scalar)
	if e != nil {
		panic(e)
	}

	e = sqlite.RegisterScalarFunction("hex_sha1", 1, func(ctx *sqlite.FunctionContext, args []driver.Value) (driver.Value, error) {
		input, ok := args[0].(string)
		if !ok {
			// If the argument isn't a string, return an empty string or handle the error accordingly
			return "", fmt.Errorf("invalid argument type, string expected")
		}
		hash := sha1.New()                            // Create a new SHA1 hash instance
		hash.Write([]byte(input))                     // Compute SHA1 hash
		sha1Hash := hex.EncodeToString(hash.Sum(nil)) // Encode the hash as hex
		return sha1Hash, nil
	})

	e = sqlite.RegisterScalarFunction("substring_index", 3, func(ctx *sqlite.FunctionContext, args []driver.Value) (driver.Value, error) {
		input, ok1 := args[0].(string)
		delimiter, ok2 := args[1].(string)
		count, ok3 := args[2].(int64)
		if !ok1 || !ok2 || !ok3 {
			return "", fmt.Errorf("invalid argument types")
		}

		// Call the substringIndex function
		parts := strings.Split(input, delimiter)
		if count > int64(len(parts)) {
			count = int64(len(parts))
		} else if count < 0 {
			count = 0
		}
		return strings.Join(parts[:count], delimiter), nil
	})
}

type sqliteHelper struct{}

func (p *sqliteHelper) Concat(s ...string) string {
	return strings.Join(s, " || ")
}

func (p *sqliteHelper) Hash(s ...string) string {
	return `hex_sha1(` + p.Concat(s...) + `)`
}

func (p *sqliteHelper) ParentMPath(levelKey string, mpathes ...string) string {
	return `substring_index(` + p.Concat(mpathes...) + `, '.', ` + levelKey + `-1)`
}

func (p *sqliteHelper) HashParent(nameKey string, levelKey string, mpathes ...string) string {
	return p.Hash(nameKey, "'__###PARENT_HASH###__'", p.ParentMPath(levelKey, mpathes...))
}

/*
WITH updated_nodes AS (
    UPDATE data_index_s3_tree_nodes
    SET
        mpath1 = '1.3' || SUBSTR(mpath1, 7) || SUBSTR(mpath2, 1, 3),
        mpath2 = SUBSTR(mpath2, 4) || SUBSTR(mpath3, 1, 3),
        mpath3 = SUBSTR(mpath3, 4) || SUBSTR(mpath4, 1, 3),
        mpath4 = SUBSTR(mpath4, 4),
        level = level - 1
    WHERE mpath1 LIKE '1.11.8.%' AND level >= 3
    RETURNING id, mpath1, mpath2, mpath3, mpath4, name, level
)
UPDATE data_index_s3_tree_nodes
SET
    hash = HASH
    hash2 = HASH_PARENT
FROM updated_nodes
WHERE data_index_s3_tree_nodes.id = updated_nodes.id;

*/

func (p *sqliteHelper) MPathOrdering(mm ...string) string {
	return strings.Join(mm, ", ")
}

func (p *sqliteHelper) ApplyOrderedUpdates(db *gorm.DB, tableName string, sets []OrderedUpdate, wheres []sql.NamedArg) (int64, error) {

	var namedSets1 []string
	var namedSets2 []string
	var namedWheres []string
	var args []interface{}

	for _, w := range wheres {
		namedWheres = append(namedWheres, "@"+w.Name)
		args = append(args, w)
	}

	var returning []string

	returning = append(returning, "uuid")
	for _, u := range sets {
		if u.Key == "hash" || u.Key == "hash2" {
			namedSets2 = append(namedSets2, fmt.Sprintf("%s=@%s", u.Key, u.Key))
		} else {
			returning = append(returning, u.Key)
			namedSets1 = append(namedSets1, fmt.Sprintf("%s=@%s", u.Key, u.Key))
		}
		args = append(args, sql.Named(u.Key, u.Value))

	}

	q := fmt.Sprintf("UPDATE `%s` SET %s WHERE %s RETURNING uuid", tableName, strings.Join(namedSets1, ", "), strings.Join(namedWheres, " AND "))
	tx := db.Raw(q, args...)
	if tx.Error != nil {
		return 0, tx.Error
	}
	var updated []string
	tx.Scan(&updated)
	if len(updated) == 0 {
		return 0, nil
	}

	q2 := fmt.Sprintf("UPDATE `%s` SET %s WHERE uuid IN @uuids", tableName, strings.Join(namedSets2, ", "))
	args = append(args, sql.Named("uuids", updated))
	tx2 := db.Exec(q2, args...)
	return tx2.RowsAffected, tx2.Error
}
