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

import "fmt"

type WalkFunc func(key []string, v Value) error

// walk recursively descends path, calling walkFn.
func walk(key []string, v Values, walkFn WalkFunc) error {
	if v == nil {
		return nil
	}
	vv := v.Get()
	if vv == nil {
		return nil
	}
	switch val := vv.Interface().(type) {
	case map[string]string:
		for k := range val {
			if err := walk(append(key, k), v.Val(k), walkFn); err != nil {
				return err
			}
		}
	case map[string]interface{}:
		for k := range val {
			if err := walk(append(key, k), v.Val(k), walkFn); err != nil {
				return err
			}
		}
	case []interface{}:
		for k := range val {
			kk := fmt.Sprintf("[%d]", k)

			dst := make([]string, len(key))
			copy(dst, key)

			if err := walk(append(dst[:len(dst)-1], dst[len(dst)-1]+kk), v.Val(kk), walkFn); err != nil {
				return err
			}
		}
	default:
		return walkFn(key, v)
	}

	return nil
}

func Walk(v Values, fn WalkFunc) error {
	return walk([]string{}, v, fn)
}
