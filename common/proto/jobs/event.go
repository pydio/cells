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
	"fmt"
	"strconv"
	"strings"

	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
)

// NodeChangeEventName builds a simple string from a given event type
func NodeChangeEventName(event tree.NodeChangeEvent_EventType) string {
	return fmt.Sprintf("NODE_CHANGE:%v", int32(event))
}

// ParseNodeChangeEventName parses the passed string and return the corresponding int32 code if it exists or (-1, false) otherwise
func ParseNodeChangeEventName(eventName string) (tree.NodeChangeEvent_EventType, bool) {

	if !strings.HasPrefix(eventName, "NODE_CHANGE") {
		return -1, false
	}

	nodeChangeValue, e := strconv.ParseInt(strings.TrimPrefix(eventName, "NODE_CHANGE:"), 10, 32)
	if e != nil {
		return -1, false
	}
	value32 := int32(nodeChangeValue)
	if _, exists := tree.NodeChangeEvent_EventType_name[value32]; exists {
		return tree.NodeChangeEvent_EventType(value32), true
	}
	return -1, false
}

// IdmChangeEventName builds a string representation for scheduler events for listening
// to a specific IDM event. For the moment ONLY USER EVENTS are supported
func IdmChangeEventName(objectType IdmSelectorType, eventType idm.ChangeEventType) string {
	return fmt.Sprintf("IDM_CHANGE:%s:%v", strings.ToUpper(objectType.String()), int32(eventType))
}

// MatchesIdmChangeEvent compares a string representation of scheduler trigger event
// with an actual idm.ChangeEvent - Only User Events are supported
func MatchesIdmChangeEvent(eventName string, event *idm.ChangeEvent) bool {
	if !strings.HasPrefix(eventName, "IDM_CHANGE:") {
		return false
	}
	parts := strings.Split(eventName, ":")
	if len(parts) != 3 {
		return false
	}
	if parts[0] != "IDM_CHANGE" {
		return false
	}
	if parts[1] != strings.ToUpper(IdmSelectorType_User.String()) && parts[1] != strings.ToUpper(IdmSelectorType_Workspace.String()) &&
		parts[1] != strings.ToUpper(IdmSelectorType_Role.String()) && parts[1] != strings.ToUpper(IdmSelectorType_Acl.String()) {
		return false
	}
	if parts[1] == strings.ToUpper(IdmSelectorType_User.String()) && event.User == nil {
		return false
	}
	if parts[1] == strings.ToUpper(IdmSelectorType_Workspace.String()) && event.Workspace == nil {
		return false
	}
	if parts[1] == strings.ToUpper(IdmSelectorType_Role.String()) && event.Role == nil {
		return false
	}
	if parts[1] == strings.ToUpper(IdmSelectorType_Acl.String()) && event.Acl == nil {
		return false
	}
	evType, e := strconv.ParseInt(parts[2], 10, 32)
	if e != nil {
		return false
	}
	if int32(evType) != int32(event.Type) {
		return false
	}

	return true
}
