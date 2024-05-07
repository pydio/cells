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
	"context"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common/proto/service"

	_ "github.com/doug-martin/goqu/v9/dialect/mysql"
)

type Collector[T any] interface {
	Or(query interface{}, args ...interface{}) T
	Where(query interface{}, args ...interface{}) T
	Offset(offset int) T
	Limit(limit int) T
}

// Builder provides the Build function
type Builder[T Collector[T]] interface {
	Build(ctx context.Context, in T) (out T, e error)
}

// Converter passes the convert function
type Converter[T Collector[T]] interface {
	Convert(ctx context.Context, sub *anypb.Any, in T) (out T, ok bool, err error)
}

type queryBuilder[T Collector[T]] struct {
	enquirer   Enquirer
	converters []Converter[T]
	isRoot     bool
}

func subQueryBuilder[T Collector[T]](e Enquirer, c ...Converter[T]) Builder[T] {
	return &queryBuilder[T]{
		enquirer: e,
		converters: append(c, &wrapConverter[T]{
			enquirer:   e,
			converters: c,
		}),
	}
}

// NewQueryBuilder generates SQL request from object
func NewQueryBuilder[T Collector[T]](e Enquirer, c ...Converter[T]) Builder[T] {
	return &queryBuilder[T]{
		isRoot:   true,
		enquirer: e,
		converters: append(c, &wrapConverter[T]{
			enquirer:   e,
			converters: c,
		}),
	}
}

type wrapConverter[T Collector[T]] struct {
	enquirer   Enquirer
	converters []Converter[T]
}

func (gc *wrapConverter[T]) Convert(ctx context.Context, val *anypb.Any, in T) (out T, ok bool, err error) {
	out = in

	sub := new(service.Query)

	if e := anypb.UnmarshalTo(val, sub, proto.UnmarshalOptions{}); e == nil {
		if subQuery, er := subQueryBuilder(sub, gc.converters...).Build(ctx, in); er == nil {
			if gc.enquirer.GetOperation() == service.OperationType_OR {
				out = out.Or(subQuery)
			} else {
				out = out.Where(subQuery)
			}
			ok = true
		} else {
			return in, false, er
		}
	}

	return
}

func (qb *queryBuilder[T]) Build(ctx context.Context, in T) (out T, e error) {

	var subDBs []Collector[T]
	for _, subQ := range qb.enquirer.GetSubQueries() {
		for _, converter := range qb.converters {
			ou, ok, er := converter.Convert(ctx, subQ, in)
			if er != nil {
				return in, er
			}
			if ok {
				subDBs = append(subDBs, ou)
			}
		}
	}

	out = in
	for i, subDB := range subDBs {
		if i > 0 && qb.enquirer.GetOperation() == service.OperationType_OR {
			out = out.Or(subDB)
		} else {
			out = out.Where(subDB)
		}
	}

	// Apply offset/limit on root builder only
	if qb.isRoot {
		if qb.enquirer.GetOffset() > 0 {
			out = out.Offset(int(qb.enquirer.GetOffset()))
		}
		if qb.enquirer.GetLimit() > 0 {
			out = out.Limit(int(qb.enquirer.GetLimit()))
		}
	}

	return out, nil
}
