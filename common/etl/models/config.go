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

package models

import (
	"errors"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"reflect"
	"time"

	"github.com/imdario/mergo"
	"github.com/pydio/cells/v4/common/config/source"
)

var (
	ErrDifferentArgumentsTypes = errors.New("src and dst must be of same type")
)

type Config source.ChangeSet

func (c *Config) Equals(o Differ) bool {
	return false
}

func (c *Config) IsDeletable(m map[string]string) bool {
	return false
}

// test if two user can be mergeable whose the same login name and auth source
func (c *Config) IsMergeable(o Differ) bool {
	return true
}

func (c *Config) GetUniqueId() string {
	return ""
}

func (c *Config) Merge(o Differ, options map[string]string) (Differ, error) {

	new, err := merge((*source.ChangeSet)(o.(*Config)), (*source.ChangeSet)(c))

	if err != nil {
		return nil, err
	}

	return (*Config)(new), nil
}

func merge(changes ...*source.ChangeSet) (*source.ChangeSet, error) {
	merged := make(map[string]interface{})

	for _, m := range changes {
		if m == nil {
			continue
		}

		if len(m.Data) == 0 {
			continue
		}

		var data map[string]interface{}
		if err := json.Unmarshal(m.Data, &data); err != nil {
			return nil, err
		}

		if err := mergo.Map(&merged, data); err != nil {
			return nil, err
		}
	}

	deepMerge(reflect.ValueOf(&merged))

	b, err := json.Marshal(merged)
	if err != nil {
		return nil, err
	}

	cs := &source.ChangeSet{
		Timestamp: time.Now(),
		Data:      b,
		Source:    "json",
	}

	return cs, nil
}

func mergeSlice(dst reflect.Value) (reflect.Value, error) {
	elems := make(map[string][]reflect.Value)

	for i := 0; i < dst.Len(); i++ {
		found := false
		elem := dst.Index(i)
		id := ""

		switch elem.Elem().Kind() {
		case reflect.Map:
			for _, key := range elem.Elem().MapKeys() {
				if key.String() == "id" || key.String() == "Id" {
					id = reflect.ValueOf(elem.Elem().MapIndex(key).Interface()).String()
					found = true
				}
			}
			if found {
				elems[id] = append(elems[id], elem)
			}
		default:
			return dst, nil
		}
	}

	if len(elems) == 0 {
		return dst, nil
	}

	var new []interface{}
	for _, elemsToMerge := range elems {
		val := make(map[string]interface{})
		for _, elem := range elemsToMerge {
			err := mergo.Map(&val, elem.Interface())
			if err != nil {
				return reflect.ValueOf(new), err
			}
		}

		new = append(new, val)
	}

	return reflect.ValueOf(new), nil
}

func deepMerge(dst reflect.Value) (err error) {

	switch dst.Kind() {
	case reflect.Map:
		for _, key := range dst.MapKeys() {
			dstElement := dst.MapIndex(key)

			switch dstElement.Kind() {
			case reflect.Ptr:
			case reflect.Interface:
				dstElement = dstElement.Elem()

				switch dstElement.Kind() {
				case reflect.Slice:
					new, err := mergeSlice(dstElement)
					if err != nil {
						return err
					}

					dst.SetMapIndex(key, new)
				default:
					if err := deepMerge(dstElement); err != nil {
						return err
					}
				}
			case reflect.Slice:
				fallthrough
			default:
				if err := deepMerge(dstElement); err != nil {
					return err
				}
			}
		}

	case reflect.Struct:
		for i, n := 0, dst.NumField(); i < n; i++ {
			if err = deepMerge(dst.Field(i)); err != nil {
				return err
			}
		}
	case reflect.Ptr:
		fallthrough
	case reflect.Interface:
		dstElement := dst.Elem()

		switch dstElement.Kind() {
		case reflect.Slice:
			new, err := mergeSlice(dstElement)
			if err != nil {
				return err
			}

			dstElement.Set(new)
		default:
			return deepMerge(dstElement)
		}
	default:
		if dst.CanSet() {
			dst.Set(dst)
		}
	}
	return
}
