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
	"fmt"
	"strings"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/pydio/cells/common/service/proto"
	"gopkg.in/doug-martin/goqu.v4"
	_ "gopkg.in/doug-martin/goqu.v4/adapters/mysql"
)

// Expressioner ...
type Expressioner interface {
	Expression(driver string) goqu.Expression
}

// ExpressionConverter ...
type ExpressionConverter interface {
	Convert(sub *any.Any, driver string) (goqu.Expression, bool)
}

type queryBuilder struct {
	ex         goqu.Ex
	enquirer   Enquirer
	converters []ExpressionConverter
	wheres     []goqu.Expression
}

// NewQueryBuilder generates SQL request from object
func NewQueryBuilder(e Enquirer, c ...ExpressionConverter) Expressioner {
	return &queryBuilder{
		enquirer:   e,
		converters: c,
	}
}

// Expression recursively builds a goku.Expression using dedicated converters
func (qb *queryBuilder) Expression(driver string) (ex goqu.Expression) {

	for _, subQ := range qb.enquirer.GetSubQueries() {

		sub := new(service.Query)

		if ptypes.Is(subQ, sub) {

			ptypes.UnmarshalAny(subQ, sub)
			expression := NewQueryBuilder(sub, qb.converters...).Expression(driver)
			if expression != nil {
				qb.wheres = append(qb.wheres, expression)
			}

		} else {
			for _, converter := range qb.converters {
				if ex, ok := converter.Convert(subQ, driver); ok && ex != nil {
					qb.wheres = append(qb.wheres, ex)
				}
			}
		}
	}

	if len(qb.wheres) == 0 {
		return nil
	}

	if qb.enquirer.GetOperation() == service.OperationType_AND {
		return goqu.And(qb.wheres...)
	} else {
		return goqu.Or(qb.wheres...)
	}

}

// QueryStringFromExpression finally builds a full SELECT from a Goqu Expression
func QueryStringFromExpression(tableName string, driver string, e Enquirer, ex goqu.Expression, resourceExpression goqu.Expression, limit int64) (string, []interface{}, error) {

	var db *goqu.Database
	db = goqu.New(driver, nil)

	if resourceExpression != nil {
		if ex != nil {
			ex = goqu.And(ex, resourceExpression)
		} else {
			ex = resourceExpression
		}
	}
	dataset := db.From(tableName).Prepared(true)
	if ex != nil {
		dataset = dataset.Where(ex)
	}
	if e.GetLimit() > 0 {
		limit = e.GetLimit()
	}
	if limit > -1 {
		offset := int64(0)
		if e.GetOffset() > 0 {
			offset = e.GetOffset()
		}
		dataset = dataset.Offset(uint(offset)).Limit(uint(limit))
	}

	queryString, args, err := dataset.ToSql()
	return queryString, args, err

}

// QueryStringFromExpression finally builds a full SELECT from a Goqu Expression
func CountStringFromExpression(tableName string, columnCount string, driver string, e Enquirer, ex goqu.Expression, resourceExpression goqu.Expression) (string, []interface{}, error) {

	var db *goqu.Database
	db = goqu.New(driver, nil)

	if resourceExpression != nil {
		if ex != nil {
			ex = goqu.And(ex, resourceExpression)
		} else {
			ex = resourceExpression
		}
	}
	dataset := db.From(tableName).Select(goqu.COUNT(columnCount))
	if ex != nil {
		dataset = dataset.Where(ex)
	}

	queryString, args, err := dataset.ToSql()
	return queryString, args, err

}

// DeleteStringFromExpression creates sql for DELETE FROM expression
func DeleteStringFromExpression(tableName string, driver string, ex goqu.Expression) (string, []interface{}, error) {

	if ex == nil {
		return "", nil, fmt.Errorf("empty condition for delete, query is too broad")
	}

	var db *goqu.Database
	db = goqu.New(driver, nil)
	sql, args, e := db.From(tableName).Prepared(true).Where(ex).ToDeleteSql()
	return sql, args, e

}

// GetExpressionForString creates correct goqu.Expression for field + string value
func GetExpressionForString(neq bool, field string, values ...string) (expression goqu.Expression) {

	if len(values) > 1 {
		var dedup []string
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
				expression = goqu.I(field).Neq(dedup[0])
			} else {
				expression = goqu.I(field).Eq(dedup[0])
			}
		} else {
			if neq {
				expression = goqu.I(field).NotIn(dedup)
			} else {
				expression = goqu.I(field).In(dedup)
			}
		}

	} else if len(values) == 1 {
		v := values[0]
		if strings.Contains(v, "*") {
			if neq {
				expression = goqu.I(field).NotILike(strings.Replace(v, "*", "%", -1))
			} else {
				expression = goqu.I(field).ILike(strings.Replace(v, "*", "%", -1))
			}
		} else {
			if neq {
				expression = goqu.I(field).Neq(v)
			} else {
				expression = goqu.I(field).Eq(v)
			}
		}
	}

	return
}
