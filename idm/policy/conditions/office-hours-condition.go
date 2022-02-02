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

package conditions

import (
	"context"
	"time"

	"github.com/ory/ladon"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
)

// OfficeHoursCondition is a condition which is fulfilled if the current time is
// within one of the week periods defined by the Matches string, for instance Monday-Friday/08:00/17:30
type OfficeHoursCondition struct {
	Matches string `json:"matches"`
}

// Fulfills returns true if the given value is a valid Time and is within one of the defined period.
// It expects a iso 8601 formatted string, e.g: "2006-01-02T15:04-0700"
func (c *OfficeHoursCondition) Fulfills(value interface{}, _ *ladon.Request) bool {

	if value == nil {
		return false
	}

	s, ok := value.(string)
	if !ok {
		log.Logger(context.Background()).Error("passed value must be a string", zap.Any("input param", value))
		return false
	}

	t, parseErr := time.Parse(timeLayout, s)
	if parseErr != nil {
		log.Logger(context.Background()).Error("cannot parse passed value. reference layout is "+timeLayout, zap.String("input param", s), zap.Error(parseErr))
		return false
	}

	days, minuteBegin, minuteEnd, parseErr := parseOfficeHours(c.Matches)
	if parseErr != nil {
		log.Logger(context.Background()).Error("cannot parse match conditions. reference layout is "+officeHoursLayout, zap.String("Matches predicate", c.Matches), zap.Error(parseErr))
		return false
	}

	// TODO manage timezone

	// check week day
	if !isWeekdayValid(days, t.Weekday()) {
		return false
	}

	return isWithinValidHours(minuteBegin, minuteEnd, t)
}

// GetName returns the condition's name.
func (c *OfficeHoursCondition) GetName() string {
	return "OfficeHoursCondition"
}
