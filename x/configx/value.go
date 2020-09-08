package configx

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/golang/protobuf/jsonpb"
	"github.com/golang/protobuf/proto"
)

// value is standard
type value struct {
	v interface{}
	p interface{} // Reference to parent for assignment
	k interface{} // Reference to key for re-assignment
}

// Get retrieve interface
func (v *value) Get() Value {
	if v == nil || v.v == nil {
		return nil
	}
	return &def{v.v}
}

// Default value set
func (v *value) Default(i interface{}) Value {
	vv := v.Get()
	if vv == nil {
		// First check if we have a reference
		if ref, ok := i.(Ref); ok {
			return v.Val(ref.Get())
		}

		return (&def{nil}).Default(i)
	}

	return vv.Default(i)
}

// Set data in interface
func (v *value) Set(data interface{}) error {
	if v == nil {
		return fmt.Errorf("value doesn't exist")
	}

	// THIS IS NOT OPTIMAL, should be rethought
	switch vv := data.(type) {
	case bool, int, int32, int64, uint, uint32, uint64, float32, float64, string, []string, []int, []bool, []interface{}:
	default:
		var m map[string]interface{}
		b, err := json.Marshal(vv)
		if err != nil {
			return err
		}

		if err := json.Unmarshal(b, &m); err != nil {
			return err
		}

		data = m
	}

	if m, ok := v.p.(*mymap); ok {
		if m.v == nil {
			m.v = make(map[string]interface{})
		}
		m.v[v.k.(string)] = data
	}
	if a, ok := v.p.(*array); ok {
		old := a.Get().Slice()
		old[v.k.(int)] = data
		a.Set(old)
	}
	if pp, ok := v.p.(*value); ok {
		switch k := v.k.(type) {
		case string:
			return pp.Set(map[string]interface{}{
				k: data,
			})
		case int:
			// TODO
		}
	}

	v.v = data

	return nil
}

func (v *value) Del() error {
	if v == nil {
		return fmt.Errorf("value doesn't exist")
	}
	if m, ok := v.p.(*mymap); ok {
		delete(m.v, v.k.(string))
	}
	if a, ok := v.p.(*array); ok {
		old := a.Get().Slice()
		idx := v.k.(int)
		old = append(old[:idx], old[idx+1:]...)
		a.Set(old)
	}

	v.v = nil
	return nil
}

// values cannot retrieve lower values as it is final
func (v *value) Val(s ...string) Values {
	keys := StringToKeys(s...)

	// A value arriving there with another key below if of the wrong type
	if len(keys) > 0 {
		// Specific handling for pointers
		if keys[0] == "#" {
			if v.p != nil {
				if v, ok := v.p.(Values); ok {
					return v.Val(strings.Join(keys, "/"))
				}
			}
		}

		// The parent doesn't actually exist here, we fake it in case we need to set it later
		p := &value{nil, v.p, v.k}
		return (*value)(&value{nil, p, keys[0]}).Val(strings.Join(keys[1:], "/"))
	}

	return v
}

// Scan to interface
func (v *value) Scan(val interface{}) error {
	jsonStr, err := json.Marshal(v.v)
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

func (c *value) Bool() bool {
	return c.Default(false).Bool()
}
func (c *value) Bytes() []byte {
	return []byte(c.String())
}
func (c *value) Int() int {
	return c.Default(0).Int()
}
func (c *value) Int64() int64 {
	return c.Default(0).Int64()
}
func (c *value) Duration() time.Duration {
	return c.Default(0 * time.Second).Duration()
}
func (c *value) String() string {
	return c.Default("").String()
}
func (c *value) StringMap() map[string]string {
	return c.Default(map[string]string{}).StringMap()
}
func (c *value) StringArray() []string {
	return c.Default([]string{}).StringArray()
}
func (c *value) Slice() []interface{} {
	return c.Default([]interface{}{}).Slice()
}
func (c *value) Map() map[string]interface{} {
	return c.Default(map[string]interface{}{}).Map()
}
