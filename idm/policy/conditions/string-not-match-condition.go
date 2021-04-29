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
	"regexp"

	"github.com/ory/ladon"
)

// StringNotMatchCondition is a condition which is fulfilled if the given
// string value does *NOT* match the regex pattern specified in StringNotMatchCondition
type StringNotMatchCondition struct {
	Matches string `json:"matches"`
}

// Fulfills returns true if the given value is a string and does *NOT* matches the regex
// pattern in StringNotMatchCondition
func (c *StringNotMatchCondition) Fulfills(value interface{}, _ *ladon.Request) bool {

	if s, ok := value.(string); ok {
		matches, _ := regexp.MatchString(c.Matches, s)
		return !matches
	} else if value == nil {
		// Consider empty string as a not match!
		return true
	} else {
		return false
	}

}

// GetName returns the condition's name.
func (c *StringNotMatchCondition) GetName() string {
	return "StringNotMatchCondition"
}
