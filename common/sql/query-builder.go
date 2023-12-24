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
	"github.com/doug-martin/goqu/v9/exp"
	"gorm.io/gorm"
	"strings"

	goqu "github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/mysql"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common/proto/service"
)

type Builder interface {
	Build(any, service.OperationType) (any, bool)
	Convert(any, *anypb.Any) (any, bool)
}

// Expressioner ...
type Expressioner interface {
	Build(in any) (out any)
	Expression(driver string) goqu.Expression
}

type Converter interface {
	Convert(sub *anypb.Any, in any) (out any, ok bool)
}

// ExpressionConverter ...
type ExpressionConverter interface {
	Convert(sub *anypb.Any, driver string) (goqu.Expression, bool)
}

type GormConverters interface {
	Convert(sub *anypb.Any, db *gorm.DB) (*gorm.DB, bool)
}

type queryBuilder struct {
	enquirer       Enquirer
	converters     []ExpressionConverter
	gormConverters []Converter
	wheres         []goqu.Expression
}

// NewQueryBuilder generates SQL request from object
func NewQueryBuilder(e Enquirer, c ...ExpressionConverter) Expressioner {
	return &queryBuilder{
		enquirer:   e,
		converters: c,
	}
}

// NewQueryBuilder generates SQL request from object
func NewGormQueryBuilder(e Enquirer, c ...Converter) Expressioner {
	return &queryBuilder{
		enquirer: e,
		gormConverters: append(c, &gormConverter{
			enquirer:   e,
			converters: c,
		}),
	}
}

type gormConverter struct {
	enquirer   Enquirer
	converters []Converter
}

func (gc *gormConverter) Convert(val *anypb.Any, in any) (out any, ok bool) {
	out = in

	db, ok := in.(*gorm.DB)
	if !ok {
		return
	}

	sub := new(service.Query)

	if e := anypb.UnmarshalTo(val, sub, proto.UnmarshalOptions{}); e == nil {
		expression := NewGormQueryBuilder(sub, gc.converters...).Build(db)
		if expression != nil {
			if gc.enquirer.GetOperation() == service.OperationType_OR {
				db = db.Or(expression)
			} else {
				db = db.Where(expression)
			}
		}
	}

	out = db

	return
}

func (qb *queryBuilder) Build(in any) (out any) {
	db, _ := in.(*gorm.DB)

	var subDBs []*gorm.DB
	for _, subQ := range qb.enquirer.GetSubQueries() {
		for _, converter := range qb.gormConverters {
			out, ok := converter.Convert(subQ, db)
			if ok {
				subDBs = append(subDBs, out.(*gorm.DB))
			}
		}
	}

	for i, subDB := range subDBs {
		if i > 0 || qb.enquirer.GetOperation() == service.OperationType_OR {
			db = db.Or(subDB)
		} else {
			db = db.Where(subDB)
		}
	}

	return db
}

// Expression recursively builds a goku.Expression using dedicated converters
func (qb *queryBuilder) Expression(driver string) (ex goqu.Expression) {

	for _, subQ := range qb.enquirer.GetSubQueries() {

		sub := new(service.Query)

		if e := anypb.UnmarshalTo(subQ, sub, proto.UnmarshalOptions{}); e == nil {

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

	db := goqu.New(driver, nil)

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

	queryString, args, err := dataset.ToSQL()
	return queryString, args, err

}

// CountStringFromExpression finally builds a full SELECT count(*) from a Goqu Expression
func CountStringFromExpression(tableName string, columnCount string, driver string, e Enquirer, ex goqu.Expression, resourceExpression goqu.Expression) (string, []interface{}, error) {

	db := goqu.New(driver, nil)

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

	queryString, args, err := dataset.ToSQL()
	return queryString, args, err

}

// DeleteStringFromExpression creates sql for DELETE FROM expression
func DeleteStringFromExpression(tableName string, driver string, ex goqu.Expression) (string, []interface{}, error) {

	if ex == nil {
		return "", nil, fmt.Errorf("empty condition for delete, query is too broad")
	}

	db := goqu.New(driver, nil)
	sql, args, e := db.From(tableName).Prepared(true).Where(ex).Delete().ToSQL()
	return sql, args, e

}

// GetExpressionForString creates correct goqu.Expression for field + string value
func GetExpressionForString(neq bool, field interface{}, values ...string) (expression goqu.Expression) {

	var gf exp.IdentifierExpression
	if i, o := field.(exp.IdentifierExpression); o {
		gf = i
	} else {
		gf = goqu.C(field.(string))
	}
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
				expression = gf.Neq(dedup[0])
			} else {
				expression = gf.Eq(dedup[0])
			}
		} else {
			if neq {
				expression = gf.NotIn(dedup)
			} else {
				expression = gf.In(dedup)
			}
		}

	} else if len(values) == 1 {
		v := values[0]
		if strings.Contains(v, "*") {
			if neq {
				expression = gf.NotILike(strings.Replace(v, "*", "%", -1))
			} else {
				expression = gf.ILike(strings.Replace(v, "*", "%", -1))
			}
		} else {
			if neq {
				expression = gf.Neq(v)
			} else {
				expression = gf.Eq(v)
			}
		}
	}

	return
}
