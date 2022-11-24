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
	"github.com/gobwas/glob"
	"github.com/ory/ladon"
	"path"
	"regexp"
	"strings"
)

// PathGlobCondition is a condition which is fulfilled if the given
// string value does *NOT* match the regex pattern specified in PathGlobCondition
type PathGlobCondition struct {
	Glob string `json:"glob"`
}

var (
	gReg = regexp.MustCompile(`(\(i?p?\))?(.*)`)
)

// Fulfills returns true if the given value is a string and does *NOT* matches the regex
// pattern in PathGlobCondition
func (c *PathGlobCondition) Fulfills(value interface{}, _ *ladon.Request) bool {

	if value == nil {
		return false
	}
	s, ok := value.(string)
	if !ok {
		return false
	}

	checkParents := false
	globString := c.Glob
	if mm := gReg.FindStringSubmatch(globString); len(mm) == 3 {
		globString = mm[2]
		flags := strings.Trim(mm[1], "()")
		if strings.Contains(flags, "i") {
			globString = strings.ToLower(globString)
			s = strings.ToLower(s)
		}
		if strings.Contains(flags, "p") {
			checkParents = true
		}
	}
	s = strings.TrimRight(s, "/")

	gl, er := glob.Compile(globString, '/')
	if er != nil {
		return false
	}
	if gl.Match(s) {
		return true
	}
	if checkParents {
		var segments = strings.Split(globString, "/")
		var testParent string
		for i, seg := range segments {
			if i == 0 && seg == "" {
				testParent = "/"
			}
			testParent = path.Join(testParent, seg)
			if glob.MustCompile(testParent, '/').Match(s) {
				return true
			}
		}
		return strings.HasPrefix(globString, s+"/")
	}
	return false

}

// GetName returns the condition's name.
func (c *PathGlobCondition) GetName() string {
	return "PathGlobCondition"
}
