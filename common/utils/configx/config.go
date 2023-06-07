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
	"errors"
	"fmt"
	"reflect"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/mitchellh/mapstructure"
	"github.com/spf13/cast"
	"golang.org/x/exp/maps"
	"golang.org/x/exp/slices"
)

var (
	ErrNoMarshallerDefined  = errors.New("no marshaller defined")
	ErrNoUnmarshalerDefined = errors.New("no unmarshaler defined")
)

type Scanner interface {
	Scan(interface{}, ...Option) error
}

type Watcher interface {
	Watch(opts ...WatchOption) (Receiver, error)
}

type Receiver interface {
	Next() (interface{}, error)
	Stop()
}

type WatchOption func(*WatchOptions)

type WatchOptions struct {
	Path        []string
	ChangesOnly bool
}

func WithPath(path ...string) WatchOption {
	return func(o *WatchOptions) {
		o.Path = path
	}
}

func WithChangesOnly() WatchOption {
	return func(o *WatchOptions) {
		o.ChangesOnly = true
	}
}

// TODO - we should be returning a Value
type KV struct {
	Key   string
	Value interface{}
}

type Key interface{}

type Value interface {
	Default(interface{}) Value

	Bool() bool
	Bytes() []byte
	Key() []string
	Reference() Ref
	Interface() interface{}
	Int() int
	Int64() int64
	Duration() time.Duration
	String() string
	StringMap() map[string]string
	StringArray() []string
	Slice() []interface{}
	Map() map[string]interface{}

	Clone() Value

	Scanner
}

type KVStore interface {
	Get() Value
	Set(value interface{}) error
	Del() error
}

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

// config is standard
type config struct {
	v       interface{}
	d       interface{} // Default
	r       *config     // Root
	k       []string    // Reference to key for re-assignment
	opts    Options
	rLocked bool
}

func newWithRoot(v interface{}, root *config, k []string, opts Options) Values {
	return &config{
		v:    v,
		r:    root,
		k:    k,
		opts: opts,
	}
}

func New(opts ...Option) Values {
	options := Options{}

	for _, o := range opts {
		o(&options)
	}

	c := &config{
		opts: options,
	}

	if data := options.InitData; data != nil {
		c.Set(data)
	}

	return c
}

func (c *config) get() interface{} {
	if c == nil {
		return nil
	}

	if c.v != nil {
		useDefault := false

		switch vv := c.v.(type) {
		case map[interface{}]interface{}:
			if ref, ok := vv["$ref"]; ok {
				vvv := c.r.Val(ref.(string)).Get()
				switch vvvv := vvv.(type) {
				case *config:
					return vvvv.get()
				default:
					return vvvv
				}
			}
		case map[string]interface{}:
			if ref, ok := vv["$ref"]; ok {
				vvv := c.r.Val(ref.(string)).Get()
				switch vvvv := vvv.(type) {
				case *config:
					return vvvv.get()
				default:
					return vvvv
				}
			}
		case []byte:
			if len(vv) == 0 {
				useDefault = true
			}
		case string:
			if vv == "default" {
				useDefault = true
			}
		}

		if !useDefault {
			str, ok := c.v.(string)
			if ok {
				if d := c.opts.Decrypter; d != nil {
					b, err := d.Decrypt(str)
					if err != nil {
						return c.v
					}
					return string(b)
				}
			}
			return c.v
		} else if c.d == nil {
			return c.v
		}
	}

	if c.d != nil {
		switch vv := c.d.(type) {
		case map[string]interface{}:
			if ref, ok := vv["$ref"]; ok {
				vvv := c.r.Val(ref.(string)).Get()
				switch vvvv := vvv.(type) {
				case *config:
					return vvvv.get()
				default:
					return vvvv
				}
			}
		case *ref:
			vvv := c.r.Val(vv.Get()).Get()
			switch vvvv := vvv.(type) {
			case *config:
				return vvvv.get()
			default:
				return vvvv
			}
		case *config:
			return vv.get()
		}
		return c.d
	}

	return nil
}

// Get retrieve interface
func (c *config) Get() Value {
	if c.v == nil && c.d == nil {
		return nil
	}

	switch vv := c.v.(type) {
	case map[string]interface{}:
		if ref, ok := vv["$ref"]; ok {
			return c.r.Val(ref.(string)).Get()
		}
	case *ref:
		if c.r == nil {
			return nil
		}
		return c.r.Val(vv.Get()).Get()
	}

	return c
}

// Default value set
func (c *config) Default(i interface{}) Value {
	if c.d == nil {
		c.d = i
	}

	switch vv := c.v.(type) {
	case string:
		if vv == "default" {
			c.v = nil
		}
	}

	return c.Get()
}

// Set data in interface
func (c *config) Set(data interface{}) error {
	if c == nil {
		return fmt.Errorf("value doesn't exist")
	}

	if c.opts.Unmarshaler != nil {
		switch vv := data.(type) {
		case []byte:
			if len(vv) > 0 {
				if err := c.opts.Unmarshaler.Unmarshal(vv, &data); err != nil {
					return err
				}
			}
		}
	}

	switch d := data.(type) {
	case *config:
		data = d.v
	}

	if len(c.k) == 0 {
		if c.opts.SetCallback != nil {
			c.opts.SetCallback(c.k, data)
		}

		switch v := data.(type) {
		case []interface{}:
			c.v = slices.Clone(v)
		case map[string]interface{}:
			c.v = maps.Clone(v)
		default:
			c.v = data
		}

		return nil
	}

	k := c.k[len(c.k)-1]
	pk := c.k[0 : len(c.k)-1]

	// Retrieve parent value
	p := c.r.Val(pk...)

	del := false
	if data == nil {
		del = true
	} else {
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
	}

	pi := p.Interface()

	// Test first if the parent is a sync map
	switch mm := pi.(type) {
	case *sync.Map:
		if del {
			mm.Delete(k)
		} else {
			mm.Store(k, data)
		}

		p.Set(mm)
	default:

		pv := reflect.ValueOf(pi)
		switch pv.Kind() {
		case reflect.Slice:
			kk, err := strconv.Atoi(k)
			if err != nil {
				return fmt.Errorf("wrong key for slice")
			}

			m := p.Slice()

			var mm []interface{}
			if cap(m) < kk+1 {
				mm = make([]interface{}, kk+1)
			} else {
				mm = make([]interface{}, cap(m))
			}

			copy(mm, m)

			if del {
				mm = append(mm[:kk], mm[kk+1:]...)
			} else {
				mm[kk] = data
			}

			p.Set(mm)
		case reflect.Map:
			m := p.Map()

			mm := make(map[string]interface{})
			for k, v := range m {
				mm[k] = v
			}

			if del {
				delete(mm, k)
			} else {
				mm[k] = data
			}

			p.Set(mm)
		case reflect.Struct:
			mm := make(map[string]interface{})
			mv := reflect.ValueOf(mm)

			pt := reflect.TypeOf(p.Interface())
			for i := 0; i < pt.NumField(); i++ {
				name := pt.Field(i).Name
				mv.SetMapIndex(reflect.ValueOf(name), pv.FieldByName(name))
			}

			if del {
				delete(mm, k)
			} else {
				mm[k] = data
			}

			p.Set(mm)
		default:
			kk, err := strconv.Atoi(k)
			if err == nil {
				mm := make([]interface{}, kk+1)

				if del {
					mm = append(mm[:kk], mm[kk+1:]...)
				} else {
					mm[kk] = data
				}

				p.Set(mm)
			} else {
				mm := make(map[string]interface{})
				if del {
					delete(mm, k)
				} else {
					mm[k] = data
				}

				p.Set(mm)
			}
		}
	}

	if c.opts.SetCallback != nil {
		c.opts.SetCallback(c.k, data)
	}

	c.v = data

	return nil
}

func (c *config) Del() error {
	if c == nil {
		return fmt.Errorf("value doesn't exist")
	}

	return c.Set(nil)
}

// Val values cannot retrieve lower values as it is final
func (c *config) Val(s ...string) Values {
	keys := StringToKeys(s...)

	// Need to do something for reference
	if len(keys) == 1 && keys[0] == "#" {
		if c.r != nil {
			return c.r
		}
		return c
	} else if len(keys) > 0 && keys[0] == "#" {
		keys = keys[1:]
	} else {
		keys = append(c.k, keys...)
	}

	root := c.r
	if c.r == nil {
		root = c
	}

	if len(keys) == 0 {
		return c
	}

	pk := keys

	// Looking for the specific key
	var current interface{} = root.Interface()

	for _, pkk := range pk {
		current = valAny(current, pkk)
		if current == nil {
			return newWithRoot(nil, root, keys, c.opts)
		}
	}

	return newWithRoot(current, root, keys, c.opts)
}

func valAny(src any, k string) (dst any) {
	v := reflect.ValueOf(src)
	if !v.IsValid() {
		return src
	}

	// Look up the corresponding copy function.
	switch v.Kind() {
	case reflect.Map:
		dst = valMap(src, k)
	case reflect.Slice, reflect.Array:
		dst = valSlice(src, k)
	case reflect.String:
		dst = strings.Clone(src.(string))
	case reflect.Ptr, reflect.UnsafePointer:
		dst = valPtr(src, k)
	case reflect.Interface:
		dst = valAny(src, k)
	case reflect.Struct:
		dst = valStruct(src, k)
	default:
		fmt.Println("Shouldn't be there ?", v.Kind())
	}

	return
}

func valMap(x any, k string) any {
	v := reflect.ValueOf(x)
	if v.Kind() != reflect.Map {
		panic(fmt.Errorf("reflect: internal error: must be a Map; got %v", v.Kind()))
	}
	f := v.MapIndex(reflect.ValueOf(k))
	if f.IsValid() {
		return f.Interface()
	}

	return nil
}

func valSlice(x any, k string) any {
	v := reflect.ValueOf(x)
	if v.Kind() != reflect.Slice {
		panic(fmt.Errorf("reflect: internal error: must be a Slice; got %v", v.Kind()))
	}
	i := 0
	kv := reflect.ValueOf(k)
	if kv.CanInt() {
		i = int(kv.Int())
	} else {
		switch kv.Kind() {
		case reflect.String:
			var err error
			i, err = strconv.Atoi(kv.Interface().(string))
			if err != nil {
				return nil
			}
		default:
			return nil
		}
	}
	if i < 0 || i >= v.Len() {
		return nil
	}

	return v.Index(i).Interface()
}

func valPtr(x any, k string) any {
	v := reflect.ValueOf(x)
	if v.Kind() != reflect.Ptr && v.Kind() != reflect.UnsafePointer {
		panic(fmt.Errorf("reflect: internal error: must be a Pointer; got %v", v.Kind()))
	}

	// Checking if it implements a sync map
	switch xx := x.(type) {
	case *sync.Map:
		if dst, ok := xx.Load(k); ok {
			return dst
		}
	}
	return valAny(v.Elem().Interface(), k)
}

func valStruct(x any, k string) any {
	v := reflect.ValueOf(x)
	if v.Kind() != reflect.Struct {
		panic(fmt.Errorf("reflect: internal error: must be a Struct; got %v", v.Kind()))
	}

	f := v.FieldByName(k)
	if f.IsValid() {
		return f.Interface()
	}

	return nil
}

// Scan to interface
func (c *config) Scan(val interface{}, options ...Option) error {
	opts := c.opts

	v := c.get()
	if v == nil {
		return nil
	}

	if len(options) > 0 {
		opts = Options{}
		for _, o := range options {
			o(&opts)
		}
	}

	marshaller := opts.Marshaller
	if marshaller == nil {
		rtarget := reflect.ValueOf(val)
		rtargetValType := reflect.TypeOf(val).Elem()
		rorig := reflect.ValueOf(v)

		switch rtarget.Kind() {
		case reflect.Ptr:
			el := rtarget.Elem()
			if !el.IsValid() {
				return fmt.Errorf("invalid value")
			}
			if el.Kind() != rorig.Kind() {
				return fmt.Errorf("invalid value (not the same kind)")
			}
			el.Set(reflect.ValueOf(v))

		case reflect.Map:
			orig := rorig
			if rorig.Kind() == reflect.Ptr {
				orig = rorig.Elem()
			}

			if orig.Kind() != reflect.Map {
				return fmt.Errorf("invalid origin value")
			}

			for _, key := range orig.MapKeys() {
				mv := orig.MapIndex(key)
				if mv.IsValid() {
					if mv.Elem().Type().ConvertibleTo(rtargetValType) {
						rtarget.SetMapIndex(key, mv.Elem().Convert(rtargetValType))
					} else {
						out := reflect.New(rtargetValType)
						if err := mapstructure.Decode(mv.Interface(), out.Interface()); err != nil {
							return err
						}

						rtarget.SetMapIndex(key, out.Elem())
					}
				}
			}
		}
		return nil
	}

	b, err := marshaller.Marshal(v)
	if err != nil {
		return err
	}
	if string(b) == "\"\"" {
		// shouldn't unmarshal empty string
		return nil
	}

	unmarshaler := opts.Unmarshaler
	if unmarshaler == nil {
		return ErrNoUnmarshalerDefined
	}

	return unmarshaler.Unmarshal(b, val)
}

func (c *config) Bool() bool {
	v := c.get()
	if v == nil {
		return false
	}
	return cast.ToBool(v)
}
func (c *config) Bytes() []byte {
	v := c.get()
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
func (c *config) Key() []string {
	if c.r != nil {
		return append(c.r.k, c.k...)
	}
	return c.k
}
func (c *config) Reference() Ref {
	r := &ref{}
	if err := c.Scan(r); err != nil {
		return nil
	}

	rr, ok := GetReference(r)
	if ok {
		return rr
	}

	return nil
}
func (c *config) Interface() interface{} {
	return c.get()
}
func (c *config) Int() int {
	v := c.get()
	if v == nil {
		return 0
	}
	return cast.ToInt(v)
}
func (c *config) Int64() int64 {
	v := c.get()
	if v == nil {
		return 0
	}
	return cast.ToInt64(v)
}
func (c *config) Duration() time.Duration {
	v := c.get()
	if v == nil {
		return 0 * time.Second
	}
	return cast.ToDuration(v)
}
func (c *config) String() string {
	v := c.get()

	switch v := c.v.(type) {
	case []interface{}, map[string]interface{}:
		if m := c.opts.Marshaller; m != nil {
			data, err := m.Marshal(v)
			if err != nil {
				return ""
			}

			return string(data)
		}

		return ""
	case string:
		// Need to handle it differently
		if v == "default" {
			c.v = nil
		}
	}

	return cast.ToString(v)
}
func (c *config) StringMap() map[string]string {
	v := c.get()
	if v == nil {
		return map[string]string{}
	}
	return cast.ToStringMapString(v)
}
func (c *config) StringArray() []string {
	v := c.get()
	vv := reflect.ValueOf(v)
	if !vv.IsValid() || reflect.ValueOf(v).IsNil() || reflect.ValueOf(v).IsZero() {
		return []string{}
	}
	return cast.ToStringSlice(c.get())
}
func (c *config) Slice() []interface{} {
	v := c.get()
	if v == nil {
		return []interface{}{}
	}
	return cast.ToSlice(c.get())
}
func (c *config) Map() map[string]interface{} {
	v := c.get()
	if v == nil {
		return map[string]interface{}{}
	}
	r, _ := cast.ToStringMapE(v)
	return r
}
func (c *config) UnmarshalJSON(data []byte) error {
	var m map[string]interface{}

	err := c.opts.Unmarshaler.Unmarshal(data, &m)
	if err != nil {
		return err
	}

	c.v = m

	return nil
}

func (c *config) MarshalJSON() ([]byte, error) {
	return c.opts.Marshaller.Marshal(c.v)
}

func (c *config) Clone() Value {
	return c
}
