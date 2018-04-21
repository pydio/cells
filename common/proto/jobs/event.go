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
	"fmt"
	"strconv"
	"strings"

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
