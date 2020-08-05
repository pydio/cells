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

package configx

import (
	"bytes"
	"encoding/json"
	"strconv"
	"strings"
	"time"

	"github.com/golang/protobuf/jsonpb"
	"github.com/golang/protobuf/proto"
	"github.com/spf13/cast"
)

// mymap structure to store configuration
type mymap struct {
	v map[string]interface{}
	p interface{} // Reference to parent for assignment
	k interface{} // Reference to key for re-assignment
}

func keysToString(k ...Key) []string {
	var r []string

	for _, kk := range k {
		switch v := kk.(type) {
		case int:
			r = append(r, strconv.Itoa(v))
		case string:
			v = strings.Replace(v, "[", "/", -1)
			v = strings.Replace(v, "]", "/", -1)
			v = strings.Replace(v, "//", "/", -1)
			v = strings.Trim(v, "/")
			r = append(r, strings.Split(v, "/")...)
		case []string:
			for _, vv := range v {
				r = append(r, keysToString(vv)...)
			}
		}
	}

	return r
}

func (c *mymap) Get() Value {
	// Checking if we have a pointer
	if ref, ok := c.v["$ref"]; ok {
		return c.Values(ref).Get()
	}
	return &def{c.v}
}

func (c *mymap) Default(i interface{}) Value {
	cc := c.Get()
	if cc == nil {
		return &def{nil}
	}
	return cc.Default(i)
}

func (c *mymap) Set(data interface{}) error {

	switch v := data.(type) {
	case []byte:
		return json.Unmarshal(v, &c)
	case map[string]interface{}:
		for k := range c.v {
			delete(c.v, k)
		}
		for k, vv := range v {
			c.v[k] = vv
		}
	}

	return nil
}

func (c *mymap) Del() error {
	c.v = nil

	return nil
}

func (c *mymap) Scan(val interface{}) error {
	if c.IsEmpty() {
		return nil
	}

	jsonStr, err := json.Marshal(c)
	if err != nil {
		return err
	}

	switch v := val.(type) {
	case proto.Message:
		err = (&jsonpb.Unmarshaler{AllowUnknownFields: true}).Unmarshal(bytes.NewReader(jsonStr), v)
	default:
		err = json.Unmarshal(jsonStr, v)
	}

	return err
}

func (c *mymap) Values(k ...Key) Values {
	keys := keysToString(k...)

	if len(keys) == 0 {
		return c
	}

	// Specific handling for pointers
	idx := keys[0]
	if idx == "#" {
		if c.p != nil {
			if v, ok := c.p.(Values); ok {
				return v.Values(keys)
			}
		}
		return c.Values(keys[1:])
	}

	v, ok := c.v[idx]
	if !ok {
		return (&value{nil, c, keys[0]}).Values(keys[1:])
	}

	if m, err := cast.ToStringMapE(v); err == nil {
		return (&mymap{m, c, idx}).Values(keys[1:])
	}

	if m, ok := v.(*mymap); ok {
		return m.Values(keys[1:])
	}

	if a, err := cast.ToSliceE(v); err == nil {
		return (&array{a, c, idx}).Values(keys[1:])
	}

	return (&value{v, c, idx}).Values(keys[1:])
}

func (c *mymap) IsEmpty() bool {
	return len(c.v) == 0
}

func (c *mymap) UnmarshalJSON(data []byte) error {
	return json.Unmarshal(data, &c.v)
}

func (c *mymap) Bool() bool {
	return c.Default(false).Bool()
}
func (c *mymap) Int() int {
	return c.Default(0).Int()
}
func (c *mymap) Int64() int64 {
	return c.Default(0).Int64()
}
func (c *mymap) Bytes() []byte {
	return []byte(c.String())
}
func (c *mymap) Duration() time.Duration {
	return c.Default(0 * time.Second).Duration()
}
func (c *mymap) String() string {
	b, err := json.Marshal(c.v)
	if err != nil {
		return "cannot marshal"
	}

	return string(b)
}
func (c *mymap) StringMap() map[string]string {
	return c.Default(map[string]string{}).StringMap()
}
func (c *mymap) StringArray() []string {
	return c.Default([]string{}).StringArray()
}
func (c *mymap) Slice() []interface{} {
	return c.Default([]interface{}{}).Slice()
}
func (c *mymap) Map() map[string]interface{} {
	return c.Default(map[string]interface{}{}).Map()
}
