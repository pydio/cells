package configx

import (
	"context"
	"fmt"
	"reflect"
	"strconv"
	"sync"
	"time"

	"github.com/spf13/cast"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/utils/kv"
	"github.com/pydio/cells/v5/common/utils/std"
)

type storer struct {
	v    *any
	d    any
	k    []string // Reference to current key
	opts *kv.Options

	mutex   *sync.RWMutex
	rLocked bool
}

func New(opts ...kv.Option) (ret kv.Values) {
	options := &kv.Options{}

	for _, o := range opts {
		o(options)
	}

	if st := options.Storer; st != nil {
		ret = caster{Storer: st}
	} else {
		store := kv.NewStore(opts...)
		ret = caster{Storer: store}
	}

	if enc, dec := options.Encrypter, options.Decrypter; enc != nil && dec != nil {
		ret = encrypter{Values: ret, Encrypter: enc, Decrypter: dec}
	}

	if mar, unm := options.Marshaller, options.Unmarshaler; mar != nil && unm != nil {
		ret = marshaller{Values: ret, Marshaller: mar, Unmarshaler: unm}
	}

	return ret
}

func Walk(keys []string, current any, fn func(i int, v any) (bool, error)) error {

	if cont, err := fn(-1, current); err != nil {
		return err
	} else if !cont {
		return nil
	}

	for i, k := range keys {
		switch v := current.(type) {
		case []any:
			kk, err := strconv.Atoi(k)
			if err != nil {
				return err
			}

			if kk >= len(v) {
				return errors.New("invalid key")
			}

			current = v[kk]
		case map[any]any:
			if vv, ok := v[k]; ok {
				current = vv
			} else {
				return errors.New("invalid key")
			}
		case map[string]any:
			if vv, ok := v[k]; ok {
				current = vv
			} else {
				return errors.New("invalid key")
			}
		default:
			current = nil
		}

		if cont, err := fn(i, current); err != nil {
			return err
		} else if !cont {
			break
		}
	}

	return nil
}

func (c storer) Context(ctx context.Context) kv.Values {
	opts := c.opts
	opts.Context = ctx

	return &caster{
		Storer: &storer{
			v:     c.v,
			k:     c.k,
			opts:  opts,
			mutex: c.mutex,
		},
	}
}

func (c storer) Val(s ...string) kv.Values {
	return caster{
		storer{
			v:     c.v,
			k:     std.StringToKeys(append(c.k, s...)...),
			opts:  c.opts,
			mutex: c.mutex,
		},
	}
}

func (c storer) Default(d any) kv.Values {
	return caster{
		storer{
			v:     c.v,
			k:     c.k,
			opts:  c.opts,
			mutex: c.mutex,
			d:     d,
		},
	}
}

func (c storer) Key() []string {
	return c.k
}

func (c storer) Options() *kv.Options {
	return c.opts
}

func (c storer) UnmarshalJSON(data []byte) error {
	var m map[string]interface{}

	err := c.opts.Unmarshaler.Unmarshal(data, &m)
	if err != nil {
		return err
	}

	*c.v = m

	return nil
}

func (c storer) MarshalJSON() ([]byte, error) {
	return c.opts.Marshaller.Marshal(c.v)
}

func (c storer) Get() any {
	var current any

	if len(c.k) == 0 {
		return *c.v
	}

	if err := Walk(c.k, *c.v, func(i int, v any) (bool, error) {
		current = v

		return true, nil
	}); err != nil || current == nil {
		return c.d
	}

	return current
}

func (c storer) Set(data any) error {

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

	if merged, err := c.merge(*c.v, current); err != nil {
		return err
	} else {
		*c.v = merged
	}

	return nil
}

func (c storer) Del() error {

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
			return errors.New("wrong key for slice")
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

func (c storer) merge(dst any, src any) (any, error) {
	if dst == nil {
		return src, nil
	}

	// If the src is nil, then it's a delete
	if src == nil {
		return nil, nil
	}

	var current any

	switch dstV := dst.(type) {
	case []any:
		srcV, ok := src.([]any)
		if !ok {
			return src, nil
		}

		s := make([]any, len(dstV))
		// slices.Clone(dstV)
		for k, v := range dstV {
			if len(srcV) > k {
				if merged, err := c.merge(v, srcV[k]); err != nil {
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
		var srcV map[any]any
		switch vv := src.(type) {
		case map[string]any:
			srcV = map[any]any{}
			for k, v := range vv {
				srcV[k] = v
			}
		case map[any]any:
			srcV = vv
		default:
			return src, nil
		}

		// Create new map
		m := make(map[any]any, len(dstV)+len(srcV))

		// Copy existing dst values
		for k, v := range dstV {
			m[k] = v
		}

		// Merging those that are both in dst and in src
		for k, v := range srcV {
			if merged, err := c.merge(dstV[k], v); err != nil {
				return nil, err
			} else {
				m[k] = merged
			}
		}

		current = m
	case map[string]any:
		var srcV map[string]any
		switch vv := src.(type) {
		case map[string]any:
			srcV = vv
		case map[any]any:
			srcV = map[string]any{}
			for k, v := range vv {
				srcV[fmt.Sprintf("%s", k)] = v
			}
		default:
			return src, nil
		}

		// Create new map
		m := make(map[any]any, len(dstV)+len(srcV))

		// Copy existing dst values
		for k, v := range dstV {
			m[k] = v
		}

		// Merging those that are both in dst and in src
		for k, v := range srcV {
			if merged, err := c.merge(dstV[k], v); err != nil {
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

var _ kv.Values = (*caster)(nil)

type caster struct {
	kv.Storer
}

func (c caster) Bool() bool {
	v := c.Get()
	if v == nil {
		return false
	}
	return cast.ToBool(v)
}

func (c caster) Bytes() []byte {
	v := c.Interface()
	if v == nil {
		return []byte{}
	}

	switch vv := v.(type) {
	case map[string]any, map[any]any, []any:
		if m := c.Options().Marshaller; m != nil {
			data, err := m.Marshal(vv)
			if err != nil {
				return []byte{}
			}

			return data
		}
	}

	return []byte(cast.ToString(v))
}

func (c caster) Interface() interface{} {
	return c.Get()
}

func (c caster) Int() int {
	v := c.Get()
	if v == nil {
		return 0
	}
	return cast.ToInt(v)
}

func (c caster) Int64() int64 {
	v := c.Get()
	if v == nil {
		return 0
	}
	return cast.ToInt64(v)
}

func (c caster) Duration() time.Duration {
	v := c.Get()
	if v == nil {
		return 0 * time.Second
	}
	return cast.ToDuration(v)
}

func (c caster) String() string {

	v := c.Get()
	switch vv := v.(type) {
	case []interface{}, map[string]interface{}:
		if m := c.Options().Marshaller; m != nil {
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

func (c caster) StringMap() map[string]string {
	v := c.Get()
	if v == nil {
		return map[string]string{}
	}
	return cast.ToStringMapString(v)
}

func (c caster) StringArray() []string {
	v := c.Get()
	if v == nil {
		return []string{}
	}
	return cast.ToStringSlice(c.Get())
}

func (c caster) Slice() []interface{} {
	v := c.Get()
	if v == nil {
		return []interface{}{}
	}
	return cast.ToSlice(c.Get())
}

func (c caster) Map() map[string]interface{} {
	v := c.Get()
	if v == nil {
		return map[string]interface{}{}
	}
	r, _ := cast.ToStringMapE(v)
	return r
}

func (c caster) Scan(out any, options ...kv.Option) error {

	v := c.Get()
	if v == nil {
		return nil
	}

	var opts kv.Options
	for _, o := range options {
		o(&opts)
	}

	marshaller := opts.Marshaller
	if marshaller == nil {
		marshaller = c.Options().Marshaller
	}

	unmarshaler := opts.Unmarshaler
	if unmarshaler == nil {
		unmarshaler = c.Options().Unmarshaler
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
