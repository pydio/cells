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

package config

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config/file"
	"github.com/spf13/cast"
)

// Map structure to store configuration
type Map map[string]interface{}

type Array []interface{}

// Value Represent a value retrieved from the values loaded
type Value interface {
	Bool(def bool) bool
	Int(def int) int
	Int64(def int64) int64
	String(def string) string
	Float64(def float64) float64
	Duration(def time.Duration) time.Duration
	StringSlice(def []string) []string
	StringMap(def map[string]string) map[string]string
	Scan(val interface{}) error
	Bytes() []byte
}

// NewMap variable
func NewMap() *Map {
	return &Map{}
}

// Get retrieves the first value associated with the given key.
// If there are no values associated with the key, Get returns
// the empty string. To access multiple values, use the map
// directly.
func (c Map) Get(keys ...string) interface{} {
	if c == nil {
		return nil
	}

	if len(keys) == 0 {
		return nil
	}

	k := keys[0]
	keys = keys[1:]

	v, ok := c[k]
	if !ok {
		return nil
	}

	if len(keys) == 0 {
		return v
	}

	m, ok := v.(Map)
	if !ok {
		return nil
	}

	return m.Get(keys...)
}

func (c Map) Map(key string) map[string]interface{} {
	val := c.Get(key)

	if m, ok := val.(map[string]interface{}); ok {
		return m
	}

	if s, ok := val.(string); ok {
		var m map[string]interface{}
		if err := json.Unmarshal([]byte(s), &m); err == nil {
			return m
		}
	}

	return nil
}

func (c Map) Array(key string) common.Scanner {
	var a Array

	val := c.Get(key)

	m, ok := val.([]interface{})
	if !ok {
		a = []interface{}{}
	} else {
		a = m
	}

	return a
}

func (c Map) StringMap(key string) map[string]string {
	return cast.ToStringMapString(c.Get(key))
}

func (c Map) String(key string, def ...string) string {
	if q := c.Get(key); q != nil {
		switch v := q.(type) {
		case []string:
			if b, err := json.Marshal(v); err == nil {
				return string(b)
			}

			if len(def) > 0 {
				return "[" + strings.Join(def, ",") + "]"
			}

			return "[]"
		case string:
			return v
		}
	}

	if len(def) > 1 {
		return "[" + strings.Join(def, ",") + "]"
	}

	if len(def) > 0 {
		return def[0]
	}

	return ""
}

func (c Map) StringArray(key string, def ...[]string) []string {
	val := c.Get(key)

	switch v := val.(type) {
	case []string:
		return v
	case string:
		var a []string
		if err := json.Unmarshal([]byte(v), &a); err == nil {
			return a
		}
	case []interface{}:
		var a []string
		for _, d := range v {
			a = append(a, fmt.Sprintf("%s", d))
		}
		return a
	}

	if len(def) > 0 {
		return def[0]
	}

	return []string{}
}

func (c Map) Duration(key string, def ...string) time.Duration {
	val := c.String(key, "")

	d, err := time.ParseDuration(val)
	if err != nil {
		if len(def) > 0 {
			d, err := time.ParseDuration(def[0])
			if err != nil {
				return 0
			}

			return d
		}
	}

	return d
}

// Database returns the driver and dsn in that order for the given key
func (c Map) Database(k string) (string, string) {
	val := c.Get(k)

	switch v := val.(type) {
	case string:
		return GetDatabase(v)
	default:
		m := c.StringMap(k)

		driver, ok := m["driver"]
		if !ok {
			return GetDefaultDatabase()
		}

		dsn, ok := m["dsn"]
		if !ok {
			return GetDefaultDatabase()
		}

		return driver, dsn
	}
}

func (c Map) Bool(key string, def ...bool) bool {

	if c.Get(key) != nil {
		if b, ok := c.Get(key).(bool); ok {
			return b
		}
		if s, ok := c.Get(key).(string); ok {
			if val, e := strconv.ParseBool(s); e == nil {
				return val
			}
		}
	}

	if len(def) > 0 {
		return def[0]
	}
	return false
}

// Int retrieves the value at the given key if it exists and
// performs best effort to cast it as an int.
// If no such key exists or if it cannot be cast as an int,
// it returns the default value if defined and 0 otherwise.
func (c Map) Int(key string, def ...int) int {
	switch v := c.Get(key).(type) {
	case int:
		return v
	case string:
		if p, err := strconv.Atoi(v); err != nil {
			break
		} else {
			return p
		}
	case float64:
		return int(v)
	}

	if len(def) > 0 {
		return def[0]
	}

	return 0
}

// Int64 retrieves the value at the given key if it exists and
// performs best effort to cast it as an int64.
// If no such key exists or if it cannot be cast as an int64,
// it returns the default value if defined and 0 otherwise.
func (c Map) Int64(key string, defaultValue ...int64) int64 {
	switch v := c.Get(key).(type) {
	case int64:
		return v
	case int:
		return int64(v)
	case int16:
		return int64(v)
	case int32:
		return int64(v)
	case string:
		if p, err := strconv.ParseInt(v, 10, 64); err != nil {
			break
		} else {
			return p
		}
	case float64:
		return int64(v)
	}

	if len(defaultValue) > 0 {
		return defaultValue[0]
	}
	return int64(0)
}

func (c Map) Scan(val interface{}) error {
	jsonStr, err := json.Marshal(c)
	if err != nil {
		return err
	}

	err = json.Unmarshal(jsonStr, val)
	if err != nil {
		return err
	}

	return nil
}

func (c Map) Bytes(key string, def ...[]byte) []byte {
	str := c.String(key)
	return []byte(str)
}

func (c Map) Values(key string) common.ConfigValues {
	m, ok := c.Get(key).(map[string]interface{})
	if !ok {
		return NewMap()
	}

	var v Map = m

	return v
}

// Set sets the key to value. It replaces any existing
// values.
func (c Map) Set(key string, value interface{}) error {

	c[key] = value

	return nil
}

// Del deletes the values associated with key.
func (c Map) Del(key string) error {
	delete(c, key)

	return nil
}

func (a Array) Scan(val interface{}) error {
	jsonStr, err := json.Marshal(a)
	if err != nil {
		return err
	}

	err = json.Unmarshal(jsonStr, val)
	if err != nil {
		return err
	}

	return nil
}

// SaveConfigs sends configuration to a local file.
func Save(ctxUser string, ctxMessage string) error {
	if GetRemoteSource() {
		return nil
	}
	return saveConfig(defaultConfig, ctxUser, ctxMessage)
}

func saveConfig(config *Config, ctxUser string, ctxMessage string) error {

	var data map[string]interface{}
	err := config.Unmarshal(&data)
	if err != nil {
		return err
	}

	if err := file.Save(GetJsonPath(), data); err != nil {
		return err
	}

	if VersionsStore != nil {
		if err := VersionsStore.Put(&file.Version{
			Date: time.Now(),
			User: ctxUser,
			Log:  ctxMessage,
			Data: data,
		}); err != nil {
			return err
		}
	}

	return nil
}
