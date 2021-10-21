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

package model

import "fmt"

// Stater can provide a json-serializable description of its content
type Stater interface {
	fmt.Stringer
	Stats() map[string]interface{}
}

type MultiStater map[string]Stater

func NewMultiStater() MultiStater {
	return make(map[string]Stater)
}

func (m MultiStater) String() string {
	s := ""
	for k, stater := range m {
		s += k + " : " + stater.String() + "\n"
	}
	return s
}

func (m MultiStater) Stats() map[string]interface{} {
	out := make(map[string]interface{}, len(m))
	for k, stater := range m {
		out[k] = stater.Stats()
	}
	return out
}
