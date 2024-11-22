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

package jobs

import (
	"context"
	"fmt"
	"regexp"
	"strconv"

	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/telemetry/log"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

type MessageMatcher struct {
	*ActionOutputSingleQuery
}

func (m *MessageMatcher) Matches(object interface{}) bool {
	if in, ok := object.(*ActionOutput); ok {
		return match(m.ActionOutputSingleQuery, in)
	} else {
		return false
	}
}

func (n *ActionOutputFilter) FilterID() string {
	return "ActionOutputFilter"
}

func (n *ActionOutputFilter) Filter(ctx context.Context, input *ActionMessage) (*ActionMessage, *ActionMessage, bool) {

	output := input
	if n.Query == nil || len(n.Query.SubQueries) == 0 {
		return output, nil, true
	}

	multi := &service.MultiMatcher{}
	if er := multi.Parse(n.Query, func(o *anypb.Any) (service.Matcher, error) {
		target := &ActionOutputSingleQuery{}
		if e := anypb.UnmarshalTo(o, target, proto.UnmarshalOptions{}); e != nil {
			return nil, e
		}
		return &MessageMatcher{ActionOutputSingleQuery: n.cloneEval(ctx, input, target)}, nil
	}); er != nil {
		fmt.Println("Error while parsing query", er)
		return output, nil, false
	}
	return output, nil, multi.Matches(input.GetLastOutput())
}

func (n *ActionOutputFilter) cloneEval(ctx context.Context, input *ActionMessage, query *ActionOutputSingleQuery) *ActionOutputSingleQuery {
	if len(GetFieldEvaluators()) == 0 {
		return query
	}
	res := proto.Clone(query).(*ActionOutputSingleQuery)
	res.StringBodyRegexp = EvaluateFieldStr(ctx, input, res.StringBodyRegexp)
	res.JsonBodyRegexp = EvaluateFieldStr(ctx, input, res.JsonBodyRegexp)
	res.ErrorStringRegexp = EvaluateFieldStr(ctx, input, res.ErrorStringRegexp)
	res.JsonBodyHasKey = EvaluateFieldStr(ctx, input, res.JsonBodyHasKey)
	res.FreeCondition = EvaluateFieldStr(ctx, input, res.FreeCondition)
	return res
}

func match(query *ActionOutputSingleQuery, output *ActionOutput) bool {

	if query.FreeCondition != "" {
		if b, e := strconv.ParseBool(query.FreeCondition); e == nil {
			return b
		} else {
			return false
		}
	}

	if output == nil {
		return true
	}

	if query.IsSuccess && !output.Success {
		return false
	}

	var strMatch string
	var reg *regexp.Regexp
	var regErr error
	if len(query.StringBodyRegexp) > 0 {
		strMatch = output.StringBody
		reg, regErr = regexp.Compile(query.StringBodyRegexp)
	} else if len(query.JsonBodyRegexp) > 0 {
		strMatch = string(output.JsonBody)
		reg, regErr = regexp.Compile(query.JsonBodyRegexp)
	} else if len(query.ErrorStringRegexp) > 0 {
		strMatch = output.ErrorString
		reg, regErr = regexp.Compile(query.ErrorStringRegexp)
	}
	if regErr != nil {
		log.Logger(context.Background()).Error("Warning, invalid regexp used in ActionOutputFilter condition! Filter with not pass!")
	}
	if reg != nil && !reg.MatchString(strMatch) {
		return false
	}

	if query.StringBodySizeGreaterThan > 0 && len(output.StringBody) < int(query.StringBodySizeGreaterThan) {
		return false
	} else if query.JsonBodySizeGreaterThan > 0 && len(output.JsonBody) < int(query.JsonBodySizeGreaterThan) {
		return false
	} else if query.StringBodySizeSmallerThan > 0 && len(output.StringBody) > int(query.StringBodySizeSmallerThan) {
		return false
	} else if query.JsonBodySizeSmallerThan > 0 && len(output.JsonBody) > int(query.JsonBodySizeSmallerThan) {
		return false
	}

	if query.TaskTimeGt > 0 && output.Time <= query.TaskTimeGt {
		return false
	}

	if query.TaskTimeLt > 0 && output.Time >= query.TaskTimeLt {
		return false
	}

	if query.JsonBodyHasKey != "" {
		var t map[string]interface{}
		e := json.Unmarshal(output.JsonBody, &t)
		if e != nil {
			return false
		}
		if _, ok := t[query.JsonBodyHasKey]; !ok {
			return false
		}
	}

	return true
}
