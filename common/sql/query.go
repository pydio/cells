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

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/service/proto"
)

// Enquirer interface
type Enquirer interface {
	GetSubQueries() []*any.Any
	GetOperation() service.OperationType
	GetOffset() int64
	GetLimit() int64
	GetGroupBy() int32
	GetResourcePolicyQuery() *service.ResourcePolicyQuery

	fmt.Stringer
}

// Query redefinition for the DAO
type query struct {
	enquirer   Enquirer
	converters []common.Converter
}

// NewDAOQuery adds database functionality to a Query proto message
func NewDAOQuery(enquirer Enquirer, converters ...common.Converter) fmt.Stringer {
	return query{
		enquirer,
		converters,
	}
}

// Build a Query from a proto message and a list of converters
func (q query) String() string {

	var wheres []string
	var sqlString string

	for _, subQ := range q.enquirer.GetSubQueries() {

		sub := new(service.Query)

		if ptypes.Is(subQ, sub) {

			if err := ptypes.UnmarshalAny(subQ, sub); err != nil {
				// TODO something
			}

			subQueryString := NewDAOQuery(sub, q.converters...).String()

			wheres = append(wheres, subQueryString)
		} else {
			for _, converter := range q.converters {
				if str, ok := converter.Convert(subQ); ok {
					wheres = append(wheres, str)
				}
			}
		}
	}

	var join string
	if q.enquirer.GetOperation() == service.OperationType_AND {
		join = "AND"
	} else {
		join = "OR"
	}
	if len(wheres) > 1 {
		sqlString = "(" + strings.Join(wheres, ") "+join+" (") + ")"
	} else {
		sqlString = strings.Join(wheres, "")
	}

	return sqlString
}

// GetQueryValueFor field value
func GetQueryValueFor(field string, values ...string) string {

	if len(values) > 1 {
		var quoted []string
		already := make(map[string]struct{})

		for _, s := range values {
			if _, f := already[s]; f {
				continue
			}
			quoted = append(quoted, "'"+s+"'")
			already[s] = struct{}{}
		}

		if len(quoted) == 1 {
			return fmt.Sprintf("%s=%s", field, quoted[0])
		} else {
			return fmt.Sprintf("%v in (%v)", field, strings.Join(quoted, ","))
		}

	} else if len(values) == 1 {
		if strings.Contains(values[0], "*") {
			return fmt.Sprintf("%s LIKE '%s'", field, strings.Replace(values[0], "*", "%", -1))
		}

		return fmt.Sprintf("%v='%v'", field, values[0])
	}

	return ""
}

// JoinConditionsWithParenthesis joins conditions using parenthesis if there are many,
// or no parenthesis if there is just one, and prepend the WHERE keyword to the string
func JoinWheresWithParenthesis(wheres []string, join string) string {

	if len(wheres) == 0 {
		return ""
	} else if len(wheres) > 1 {
		return " where (" + strings.Join(wheres, ") "+join+" (") + ")"
	} else {
		return " where " + strings.Join(wheres, "")
	}

}
