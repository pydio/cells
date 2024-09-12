package configx

import (
	"context"
	"fmt"
	"maps"
	"reflect"
	"slices"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/spf13/cast"

	"github.com/pydio/cells/v4/common/errors"
)

type values struct {
	opts *Options
	Storer
}

type store struct {
	v    *any
	d    any
	k    []string // Reference to current key
	opts *Options

	mutex   *sync.RWMutex
	rLocked bool
}

type Storer interface {
	Context(ctx context.Context) Values
	Val(path ...string) Values
	Default(def any) Values
	Get() any
	Set(value any) error
	Del() error
}

type Values interface {
	Storer
	Caster
}

type Caster interface {
	Bool() bool
	Bytes() []byte
	Interface() interface{}
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

type Scanner interface {
	Scan(out any, options ...Option) error
}

func New(opts ...Option) Values {
	options := &Options{}

	for _, o := range opts {
		o(options)
	}

	if options.Storer == nil {
		var a any

		WithStorer(&store{
			v:     &a,
			opts:  options,
			mutex: &sync.RWMutex{},
		})(options)
	}

	return &values{
		opts:   options,
		Storer: options.Storer,
	}
}

func (c *store) Context(ctx context.Context) Values {
	opts := c.opts
	opts.Context = ctx

	return &values{
		opts:   opts,
		Storer: c,
	}
}

func (c *store) Val(s ...string) Values {
	return &values{
		opts: c.opts,
		Storer: &store{
			v:     c.v,
			k:     StringToKeys(append(c.k, s...)...),
			opts:  c.opts,
			mutex: c.mutex,
		},
	}
}

func (c *store) Default(d any) Values {
	c.d = d
	return &values{
		opts:   c.opts,
		Storer: c,
	}
}

func (c *store) Key() []string {
	return c.k
}

func (c *store) Options() *Options {
	return c.opts
}

func (c *values) Bool() bool {
	v := c.Interface()
	if v == nil {
		return false
	}
	return cast.ToBool(v)
}

func (c *values) Bytes() []byte {
	v := c.Interface()
	if v == nil {
		return []byte{}
	}

	if m := c.opts.Marshaller; m != nil {
		data, err := m.Marshal(v)
		if err != nil {
			return []byte{}
		}

		return data
	}

	return []byte(cast.ToString(v))
}

//func (c *config) Reference() Ref {
//	r := &ref{}
//	if err := c.Scan(r); err != nil {
//		return nil
//	}
//
//	rr, ok := GetReference(r)
//	if ok {
//		return rr
//	}
//
//	return nil
//}

func (c *values) Interface() interface{} {
	return c.Get()
}

func (c *values) Int() int {
	v := c.Get()
	if v == nil {
		return 0
	}
	return cast.ToInt(v)
}

func (c *values) Int64() int64 {
	v := c.Get()
	if v == nil {
		return 0
	}
	return cast.ToInt64(v)
}

func (c *values) Duration() time.Duration {
	v := c.Get()
	if v == nil {
		return 0 * time.Second
	}
	return cast.ToDuration(v)
}

func (c *values) String() string {

	v := c.Interface()
	switch vv := v.(type) {
	case []interface{}, map[string]interface{}:
		if m := c.opts.Marshaller; m != nil {
			data, err := m.Marshal(vv)
			if err != nil {
				return ""
			}

			return string(data)
		}

		return ""
	}

	return cast.ToString(v)
}

func (c *values) StringMap() map[string]string {
	v := c.Get()
	if v == nil {
		return map[string]string{}
	}
	return cast.ToStringMapString(v)
}

func (c *values) StringArray() []string {
	v := c.Get()
	vv := reflect.ValueOf(v)
	if !vv.IsValid() || reflect.ValueOf(v).IsNil() || reflect.ValueOf(v).IsZero() {
		return []string{}
	}
	return cast.ToStringSlice(c.Get())
}

func (c *values) Slice() []interface{} {
	v := c.Get()
	if v == nil {
		return []interface{}{}
	}
	return cast.ToSlice(c.Get())
}

func (c *values) Map() map[string]interface{} {
	v := c.Get()
	if v == nil {
		return map[string]interface{}{}
	}
	r, _ := cast.ToStringMapE(v)
	return r
}

func (c *values) Scan(out any, options ...Option) error {
	var opts Options
	for _, o := range options {
		o(&opts)
	}

	marshaller := opts.Marshaller
	if marshaller == nil {
		marshaller = c.opts.Marshaller
	}

	unmarshaler := opts.Unmarshaler
	if unmarshaler == nil {
		unmarshaler = c.opts.Unmarshaler
	}

	var b []byte
	if marshaller != nil {
		if bb, err := marshaller.Marshal(c.Get()); err != nil {
			return err
		} else {
			b = bb
		}
	}

	if unmarshaler != nil {
		return unmarshaler.Unmarshal(b, out)
	} else {
		rv := reflect.ValueOf(out).Elem()
		if rv.CanSet() {
			rv.Set(reflect.ValueOf(c.Get()))
		} else {
			return errors.New("cannot be set")
		}
	}

	return nil
}

func (c *store) UnmarshalJSON(data []byte) error {
	var m map[string]interface{}

	err := c.opts.Unmarshaler.Unmarshal(data, &m)
	if err != nil {
		return err
	}

	*c.v = m

	return nil
}

func (c *store) MarshalJSON() ([]byte, error) {
	return c.opts.Marshaller.Marshal(c.v)
}

func (c *store) Get() any {
	//c.mutex.RLock()
	//defer c.mutex.RUnlock()

	var current any

	current = *c.v

	for _, k := range c.k {
		switch v := current.(type) {
		case []any:
			kk, err := strconv.Atoi(k)
			if err != nil {
				return c.d
			}

			if kk >= len(v) {
				return c.d
			}

			current = v[kk]
		case map[any]any:
			if vv, ok := v[k]; ok {
				current = vv
			} else {
				return c.d
			}
		case map[string]any:
			if vv, ok := v[k]; ok {
				current = vv
			} else {
				return c.d
			}
		default:
			current = nil
		}

		switch v := current.(type) {
		case map[any]any:
			if refV, ok := v["$ref"]; ok {
				ref := strings.SplitN(refV.(string), "#", 2)
				refTarget, refValue := ref[0], ref[1]

				var configRef Values
				if refTarget == "" {
					configRef = c.Val("#")
				} else {
					if rp := c.opts.ReferencePool; rp != nil {
						var err error

						configRef, err = rp.Get(c.opts.Context)
						if err != nil {
							return c.d
						}
					}
				}

				if configRef == nil {
					return nil
				}

				current = configRef.Val(refValue).Get()
			}
		case map[string]any:
			if refV, ok := v["$ref"]; ok {
				ref := strings.SplitN(refV.(string), "#", 2)
				refTarget, refValue := ref[0], ref[1]

				var configRef Values
				if refTarget == "" {
					configRef = c.Val("#")
				} else {
					if rp := c.opts.ReferencePool; rp != nil {
						var err error

						configRef, err = rp.Get(c.opts.Context)
						if err != nil {
							return c.d
						}
					}
				}

				if configRef == nil {
					return nil
				}

				current = configRef.Val(refValue).Get()
			}
		}
	}

	if current == nil {
		return c.d
	}

	return current
}

func (c *store) Set(data any) error {
	//c.mutex.Lock()
	//defer c.mutex.Unlock()

	if c == nil {
		return fmt.Errorf("value doesn't exist")
	}

	// Checking if we don't have a reference in the parent keys
	//for i := len(c.k) - 1; i >= 0; i-- {
	//	switch m := c.Val("#").Val(c.k[:i]...).Interface().(type) {
	//	case map[string]any:
	//		fmt.Println("HERE", m["$ref"])
	//	}
	//}

	if enc := c.opts.Encrypter; enc != nil {
		switch vv := data.(type) {
		case []byte:
			// Encrypting value
			str, err := enc.Encrypt(vv)
			if err != nil {
				return err
			}

			data = str
		case string:
			// Encrypting value
			str, err := enc.Encrypt([]byte(vv))
			if err != nil {
				return err
			}

			data = str
		}
	}

	var b []byte
	if c.opts.Marshaller != nil {
		switch vv := data.(type) {
		case []byte:
			b = vv
		default:
			if v, err := c.opts.Marshaller.Marshal(data); err != nil {
				return err
			} else {
				b = v
			}
		}
	}

	if c.opts.Unmarshaler != nil {
		var v any
		if err := c.opts.Unmarshaler.Unmarshal(b, &v); err != nil {
			return err
		} else {
			data = v
		}
	}

	// Building the keys one by one
	var current = data
	for i := len(c.k); i >= 1; i-- {
		k, err := strconv.Atoi(c.k[i-1])
		if err == nil {
			s := make([]any, k+1)
			s[k] = current
			current = s
		} else {
			m := make(map[string]any)
			m[c.k[i-1]] = current
			current = m
		}
	}

	if merged, err := merge(*c.v, current); err != nil {
		return err
	} else {
		*c.v = merged
	}

	return nil
}

func (c *store) Del() error {

	if len(c.k) == 0 {
		*c.v = nil
		return nil
	}

	// Retrieving parent
	v := c.Val("#").Val(c.k[:len(c.k)-1]...)
	switch vv := v.Interface().(type) {
	case []any:
		kk, err := strconv.Atoi(c.k[len(c.k)-1])
		if err != nil {
			return fmt.Errorf("wrong key for slice")
		}

		vv = append(vv[:kk], vv[kk+1:]...)

		return v.Set(vv)
	case map[any]any:
		delete(vv, c.k[len(c.k)-1])

		return v.Set(vv)
	case map[string]any:
		delete(vv, c.k[len(c.k)-1])

		return v.Set(vv)
	}

	return nil
}

func merge(dst any, src any) (any, error) {
	if dst == nil {
		return src, nil
	}

	if src == nil {
		return dst, nil
	}

	var current any

	switch dstV := dst.(type) {
	case []any:
		srcV, ok := src.([]any)
		if !ok {
			return src, nil
		}

		s := slices.Clone(dstV)
		for k, v := range dstV {
			if len(srcV) > k {
				if merged, err := merge(v, srcV[k]); err != nil {
					return nil, err
				} else {
					s[k] = merged
				}
			}
		}

		for i := len(dstV); i < len(srcV); i++ {
			s = append(s, srcV[i])
		}

		current = s
	case map[any]any:
		srcV, ok := src.(map[any]any)
		if !ok {
			return src, nil
			// return nil, errors.New("not the same type")
		}

		// Merging those that are both in dst and in src
		m := maps.Clone(dstV)
		for k, v := range srcV {
			if merged, err := merge(dstV[k], v); err != nil {
				return nil, err
			} else {
				m[k] = merged
			}
		}

		current = m
	case map[string]any:
		srcV, ok := src.(map[string]any)
		if !ok {
			return src, nil
			// return nil, errors.New("not the same type")
		}

		// Merging those that are both in dst and in src
		m := maps.Clone(dstV)
		for k, v := range srcV {
			if merged, err := merge(dstV[k], v); err != nil {
				return nil, err
			} else {
				m[k] = merged
			}
		}

		current = m
	default:
		current = src
	}

	return current, nil
}
