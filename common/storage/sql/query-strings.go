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
	"strings"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// GormConvertString creates correct gorm.Queries for field + string value
func GormConvertString(db *gorm.DB, neq bool, field string, values ...string) *gorm.DB {

	if len(values) > 1 {
		var dedup []interface{}
		already := make(map[string]struct{})

		for _, s := range values {
			if _, f := already[s]; f {
				continue
			}
			dedup = append(dedup, s)
			already[s] = struct{}{}
		}

		if len(dedup) == 1 {
			if neq {
				db = db.Not(map[string]interface{}{field: dedup[0]})
			} else {
				db = db.Where(map[string]interface{}{field: dedup[0]})
			}
		} else {
			cl := clause.IN{Column: field, Values: dedup}
			if neq {
				db = db.Not(cl)
			} else {
				db = db.Where(cl)
			}
		}

	} else if len(values) == 1 {
		v := values[0]
		var cl interface{}
		if strings.Contains(v, "*") {
			val := strings.Replace(v, "*", "%", -1)
			if db.Name() == "postgres" {
				cl = ILike{Column: field, Value: val}
			} else {
				cl = clause.Like{Column: field, Value: val}
			}
		} else {
			cl = clause.Eq{Column: field, Value: v}
		}
		if neq {
			db = db.Not(cl)
		} else {
			db = db.Where(cl)
		}
	}

	return db
}

type ILike struct {
	Column interface{}
	Value  interface{}
}

func (eq ILike) Build(builder clause.Builder) {
	_, _ = builder.WriteString("LOWER(")
	builder.WriteQuoted(eq.Column)
	_, _ = builder.WriteString(") LIKE LOWER(")
	builder.AddVar(builder, eq.Value)
	_, _ = builder.WriteString(")")
}
