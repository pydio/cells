/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package configx

import (
	"strconv"
	"strings"
)

// type Keys []Key

// func (k Keys) String() string {
// 	return strings.Join(keysToString(k...), "/")
// }

func FormatPath(ii ...interface{}) string {
	var r string
	for _, i := range ii {
		switch v := i.(type) {
		case int:
			r += "/" + strconv.Itoa(v)
		case string:
			r += "/" + v
		case []string:
			for _, vv := range v {
				r += FormatPath(vv)
			}
		}
	}

	return strings.TrimPrefix(r, "/")
}

func StringToKeys(s ...string) []string {
	var r []string

	for _, v := range s {
		if v == "" {
			continue
		}
		v = strings.Replace(v, "[", "/", -1)
		v = strings.Replace(v, "]", "/", -1)
		v = strings.Replace(v, "//", "/", -1)
		v = strings.Trim(v, "/")
		r = append(r, strings.Split(v, "/")...)
	}

	lastIndex := 0
	for i, v := range r {
		if v == "#" {
			lastIndex = i

		}
	}

	r = r[lastIndex:]

	return r
}

// func keysToString(k ...Key) []string {
// 	var r []string

// 	for _, kk := range k {
// 		switch v := kk.(type) {
// 		case int:
// 			r = append(r, strconv.Itoa(v))
// 		case string:
// 			v = strings.Replace(v, "[", "/", -1)
// 			v = strings.Replace(v, "]", "/", -1)
// 			v = strings.Replace(v, "//", "/", -1)
// 			v = strings.Trim(v, "/")
// 			r = append(r, strings.Split(v, "/")...)
// 		case []string:
// 			for _, vv := range v {
// 				r = append(r, keysToString(vv)...)
// 			}
// 		}
// 	}

// 	return r
// }
