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

package jobs

import (
	"slices"

	"go.uber.org/zap/zapcore"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common/utils/configx"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

type actionOutputLogArray []*ActionOutput

func (a actionOutputLogArray) MarshalLogArray(encoder zapcore.ArrayEncoder) error {
	for _, m := range a {
		_ = encoder.AppendObject(m)
	}
	return nil
}

// JsonAsValues loads JsonBody into a configx.Values type to ease golang templating
func (m *ActionOutput) JsonAsValues() configx.Values {
	v := configx.New(configx.WithJSON())
	v.Set(m.JsonBody)
	return v
}

// JsonAsValue loads JsonBody into a configx.Value type to ease golang templating
// TODO - Recheck Jobs using this, it's now equivalent to JsonAsValues()
func (m *ActionOutput) JsonAsValue() configx.Values {
	v := configx.New(configx.WithJSON())
	v.Set(m.JsonBody)
	return v
}

func (m *ActionOutput) JsonSliceOfObjects() ([]map[string]interface{}, error) {
	var entries []map[string]interface{}
	er := json.Unmarshal(m.JsonBody, &entries)
	return entries, er
}

func (m *ActionOutput) JsonSliceOfInterfaces() ([]interface{}, error) {
	var entries []interface{}
	er := json.Unmarshal(m.JsonBody, &entries)
	return entries, er
}

func (m *ActionOutput) JsonObject() (map[string]interface{}, error) {
	var entry map[string]interface{}
	er := json.Unmarshal(m.JsonBody, &entry)
	return entry, er
}

// MarshalLogObject implements zapcore Marshaler interface
func (m *ActionOutput) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	maxLength := 1024
	if m.Success {
		encoder.AddBool("Success", m.Success)
	}
	if m.Ignored {
		encoder.AddBool("Ignored", m.Ignored)
	}
	if m.ErrorString != "" {
		encoder.AddString("ErrorString", m.ErrorString)
	}
	if m.StringBody != "" {
		if len(m.StringBody) > maxLength {
			encoder.AddInt("StringBodyLength", len(m.StringBody))
			encoder.AddString("StringBody", m.StringBody[:maxLength]+"...")
		} else {
			encoder.AddString("StringBody", m.StringBody)
		}
	}
	if len(m.RawBody) > 0 {
		encoder.AddInt("RawBodyLength", len(m.RawBody))
	}
	if len(m.JsonBody) > 0 {
		if len(m.JsonBody) > maxLength {
			encoder.AddInt("JsonBodyLength", len(m.JsonBody))
			encoder.AddString("JsonBody", string(m.JsonBody[:maxLength])+"...")
		} else {
			bd := m.JsonAsValues().Map()
			_ = encoder.AddReflected("JsonBody", bd)
		}
	}
	if len(m.Vars) > 0 {
		limited := make(map[string]interface{}, len(m.Vars))
		for k, v := range m.Vars {
			if len(v) > maxLength {
				limited[k] = v[:maxLength] + "..."
			} else {
				var val interface{}
				if e := json.Unmarshal([]byte(v), &val); e == nil {
					limited[k] = val
				}
			}
		}
		_ = encoder.AddReflected("Vars", limited)
	}
	return nil
}

// SetVar json-encodes the value and store it in the Vars map
func (m *ActionOutput) SetVar(key string, value interface{}) {
	if m.Vars == nil {
		m.Vars = make(map[string]string)
	}
	var jv []byte
	if mess, ok := value.(proto.Message); ok {
		jv, _ = protojson.Marshal(mess)
	} else {
		jv, _ = json.Marshal(value)
	}
	m.Vars[key] = string(jv)
}

// FillVars append existing, json-decoded values to the input map
func (m *ActionOutput) FillVars(vv map[string]interface{}, expected ...string) {
	if m.Vars == nil {
		return
	}
	for k, v := range m.Vars {
		if len(expected) > 0 && !slices.Contains(expected, k) {
			continue
		}
		var val interface{}
		if e := json.Unmarshal([]byte(v), &val); e == nil {
			vv[k] = val
		}
	}
	return
}

// LogVarsWithLimit does the same as FillVars but does not json-decode values and truncate huge vars
func (m *ActionOutput) LogVarsWithLimit(vv map[string]interface{}, jsonSizeLimit int) {
	if m.Vars == nil {
		return
	}
	for k, v := range m.Vars {
		if len(v) >= jsonSizeLimit {
			vv[k] = v[:jsonSizeLimit] + "..."
		} else {
			var val interface{}
			if e := json.Unmarshal([]byte(v), &val); e == nil {
				vv[k] = val
			}
		}
	}
	return
}
