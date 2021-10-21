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

	"github.com/golang/protobuf/ptypes"

	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	service "github.com/pydio/cells/common/service/proto"
)

func (m *TriggerFilter) Filter(ctx context.Context, input ActionMessage) (ActionMessage, *ActionMessage, bool) {

	var event interface{}
	triggerEvent := &JobTriggerEvent{}
	nodeEvent := &tree.NodeChangeEvent{}
	idmEvent := &idm.ChangeEvent{}
	if e := ptypes.UnmarshalAny(input.Event, triggerEvent); e == nil {
		event = triggerEvent
	} else if e := ptypes.UnmarshalAny(input.Event, nodeEvent); e == nil {
		event = nodeEvent
	} else if e := ptypes.UnmarshalAny(input.Event, idmEvent); e == nil {
		event = idmEvent
	} else {
		// Cannot recognize event type
		return input, &input, false
	}

	var bb []bool
	for _, q := range m.Query.SubQueries {
		tQ := &TriggerFilterQuery{}
		if e := ptypes.UnmarshalAny(q, tQ); e == nil {
			bb = append(bb, m.evaluateOne(tQ, event))
		}
	}
	result := service.ReduceQueryBooleans(bb, m.Query.Operation)
	if result {
		return input, nil, true
	} else {
		output := input
		input.Event = nil
		return output, &input, false
	}

}

func (m *TriggerFilter) evaluateOne(tQ *TriggerFilterQuery, event interface{}) bool {
	var eName string
	if t, o := event.(*JobTriggerEvent); o {
		if tQ.IsManual && t.RunNow {
			return true
		}
		if tQ.IsSchedule && t.Schedule != nil {
			return true
		}
	} else if n, o := event.(*tree.NodeChangeEvent); o {
		eName = NodeChangeEventName(n.Type)
		for _, na := range tQ.EventNames {
			if na == eName {
				return true
			}
		}
	} else if i, o := event.(*idm.ChangeEvent); o {
		for _, na := range tQ.EventNames {
			if MatchesIdmChangeEvent(na, i) {
				return true
			}
		}
	}
	return false
}
