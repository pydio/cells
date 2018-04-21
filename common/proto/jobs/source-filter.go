/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package jobs

import (
	"strings"

	"github.com/micro/protobuf/ptypes"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	service "github.com/pydio/cells/common/service/proto"
)

func (n *SourceFilter) Filter(input ActionMessage) ActionMessage {

	results := []bool{}

	for _, q := range n.GetQuery().GetSubQueries() {

		outputQuery := &service.ActionOutputQuery{}
		err := ptypes.UnmarshalAny(q, outputQuery)
		if err == nil && outputQuery != nil && input.GetLastOutput() != nil {
			pass := n.filterOutput(outputQuery, input.GetLastOutput())
			if outputQuery.Not {
				pass = !pass
			}
			results = append(results, pass)
		}

		sourceQuery := &service.SourceSingleQuery{}
		err = ptypes.UnmarshalAny(q, sourceQuery)
		if err == nil && sourceQuery != nil {
			pass := n.filterSource(sourceQuery, input)
			if sourceQuery.Not {
				pass = !pass
			}
			results = append(results, pass)
		}

	}

	if !reduceQueryBooleans(results, n.Query.Operation) {
		output := input
		// Filter out all future message actions
		output.Nodes = []*tree.Node{}
		output.Users = []*idm.User{}
		return output
	}

	return input
}

func (n *SourceFilter) filterOutput(query *service.ActionOutputQuery, output *ActionOutput) bool {

	if query.Success && !output.Success {
		return false
	}

	if query.Failed && output.Success {
		return false
	}

	if len(query.StringBodyCompare) > 0 && !strings.Contains(output.StringBody, query.StringBodyCompare) {
		return false
	}

	if len(query.ErrorStringCompare) > 0 && !strings.Contains(output.ErrorString, query.ErrorStringCompare) {
		return false
	}

	// TODO - HANDLE JSON

	return true
}

func (n *SourceFilter) filterSource(query *service.SourceSingleQuery, input ActionMessage) bool {
	return true
}
