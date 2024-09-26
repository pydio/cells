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

package service

import "google.golang.org/protobuf/types/known/anypb"

// Converter interface
/*
type Converter interface {
	Convert(*anypb.Any) (string, bool)
}

*/

// PrepareResourcePolicyQuery reads ResourcePolicyQuery and append it as a sub-query for further Conversion.
func PrepareResourcePolicyQuery(query *Query, action ResourcePolicyAction) *Query {
	if query == nil || query.ResourcePolicyQuery == nil {
		return query
	}
	if query.ResourcePolicyQuery.Action == ResourcePolicyAction_ANY {
		query.ResourcePolicyQuery.Action = action
	}
	rp, _ := anypb.New(query.ResourcePolicyQuery)
	if query.Operation == OperationType_AND {
		// Already an AND, just append
		query.SubQueries = append(query.SubQueries, rp)
		return query

	} else {
		// Wrap existing an RPQuery in an AND
		query.ResourcePolicyQuery = nil
		subQ, _ := anypb.New(query)
		return &Query{
			Operation:  OperationType_AND,
			Offset:     query.Offset,
			Limit:      query.Limit,
			SubQueries: []*anypb.Any{subQ, rp},
		}

	}
}
