package configx

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/golang/protobuf/jsonpb"
	"github.com/golang/protobuf/proto"
)

type Scanner interface {
	Scan(interface{}) error
}

type Watcher interface {
	Watch(path ...string) (Receiver, error)
}

type Receiver interface {
	Next() (Values, error)
	Stop()
}

type Key interface{}

type Value interface {
	Default(interface{}) Value

	Bool() bool
	Bytes() []byte
	Int() int
	Int64() int64
	Duration() time.Duration
	String() string
	StringMap() map[string]string
	StringArray() []string
	Slice() []interface{}
	Map() map[string]interface{}

	Scanner
}

// KVStore
type KVStore interface {
	Get() Value
	Set(value interface{}) error
	Del() error
}

// Entrypoint
type Entrypoint interface {
	KVStore
	Val(path ...string) Values
}

type Values interface {
	Entrypoint
	Value
}

type Ref interface {
	Get() string
}

type Source interface {
	Entrypoint
	Watcher
}

func NewFrom(i interface{}) Values {
	c := New()
	c.Set(i)
	return c
}

// config is standard
type config struct {
	v    interface{}
	d    interface{} // Default
	r    *config     // Root
	k    []string    // Reference to key for re-assignment
	opts Options
}

func New(opts ...Option) Values {
	options := Options{}

	for _, o := range opts {
		o(&options)
	}

	return &config{
		opts: options,
	}
}

// Get retrieve interface
func (v *config) Get() Value {
	if v == nil {
		return nil
	}

	if v.v != nil {
		switch vv := v.v.(type) {
		case map[string]interface{}:
			if ref, ok := vv["$ref"]; ok {
				return v.r.Val(ref.(string)).Get()
			}
		}

		return &def{v.v}
	}

	if v.d != nil {
		switch vv := v.d.(type) {
		case *ref:
			return v.r.Val(vv.Get()).Get()
		}
		return &def{v.d}
	}

	return nil
}

// Default value set
func (v *config) Default(i interface{}) Value {
	if v.d == nil {
		v.d = i
	}

	return v.Get()
}

// Set data in interface
func (v *config) Set(data interface{}) error {
	if v == nil {
		return fmt.Errorf("value doesn't exist")
	}

	if v.opts.Unmarshaler != nil {
		switch vv := data.(type) {
		case []byte:
			if err := v.opts.Unmarshaler.Unmarshal(vv, &data); err != nil {
				return err
			}
		}
	}

	if len(v.k) == 0 {
		v.v = data
		return nil
	}

	k := v.k[len(v.k)-1]
	pk := v.k[0 : len(v.k)-1]

	// Retrieve parent value
	p := v.r.Val(pk...)
	m := p.Map()
	if data == nil {
		delete(m, k)
	} else {
		m[k] = data
	}
	p.Set(m)

	return nil
}

func (v *config) Del() error {
	if v == nil {
		return fmt.Errorf("value doesn't exist")
	}

	return v.Set(nil)
}

// values cannot retrieve lower values as it is final
func (v *config) Val(s ...string) Values {
	keys := StringToKeys(s...)

	// Need to do something for reference
	if len(keys) > 0 && keys[0] == "#" {
		keys = keys[1:]
	} else {
		keys = append(v.k, keys...)
	}

	root := v.r
	if v.r == nil {
		root = v
	}

	if len(keys) == 0 {
		return v
	}

	pk := keys

	// Looking for the specific key
	var current interface{} = root.Map()

	for _, pkk := range pk {
		switch cv := current.(type) {
		case map[string]interface{}:
			c, ok := cv[pkk]
			if !ok {
				// The parent doesn't actually exist here, we return the nil value
				return &config{nil, nil, root, keys, v.opts}
			}

			current = c
		case []interface{}:
			i, err := strconv.Atoi(pkk)
			if err != nil || i < 0 || i >= len(cv) {
				return &config{nil, nil, root, keys, v.opts}
			}

			c := cv[i]

			current = c
		default:
			return &config{nil, nil, root, keys, v.opts}
		}
	}

	return &config{current, nil, root, keys, v.opts}
}

// Scan to interface
func (v *config) Scan(val interface{}) error {
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

func (c *config) Bool() bool {
	return c.Default(false).Bool()
}
func (c *config) Bytes() []byte {
	return []byte(c.String())
}
func (c *config) Int() int {
	return c.Default(0).Int()
}
func (c *config) Int64() int64 {
	return c.Default(0).Int64()
}
func (c *config) Duration() time.Duration {
	return c.Default(0 * time.Second).Duration()
}
func (c *config) String() string {
	switch v := c.v.(type) {
	case []interface{}, map[string]interface{}:
		data, err := json.Marshal(v)
		if err != nil {
			return c.Default("").String()
		}

		return string(data)
	}

	return c.Default("").String()
}
func (c *config) StringMap() map[string]string {
	return c.Default(map[string]string{}).StringMap()
}
func (c *config) StringArray() []string {
	return c.Default([]string{}).StringArray()
}
func (c *config) Slice() []interface{} {
	return c.Default([]interface{}{}).Slice()
}
func (c *config) Map() map[string]interface{} {
	return c.Default(map[string]interface{}{}).Map()
}
func (c *config) UnmarshalJSON(data []byte) error {
	var m map[string]interface{}

	err := json.Unmarshal(data, &m)
	if err != nil {
		return err
	}

	c.v = m

	return nil
}
