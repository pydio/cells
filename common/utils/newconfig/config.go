package newconfig

import (
	"context"
	"fmt"
	"github.com/spf13/cast"
	"maps"
	"slices"
	"strconv"
	"strings"
)

type config struct {
	v       *any
	d       any
	k       []string // Reference to current key
	opts    Options
	rLocked bool
}

type Values interface {
	Get() any
	Set(data any) error
	Del() error

	Default(def any) Values
	Val(path ...string) Values

	String() string
	StringArray() []string
	Int() int

	Scan(out any) error
}

func New(opts ...Option) *config {
	options := Options{}

	for _, o := range opts {
		o(&options)
	}

	var a any

	return &config{
		v:    &a,
		opts: options,
	}
}

func (c *config) Int() int {
	return cast.ToInt(c.Get())
}

func (c *config) String() string {
	return cast.ToString(c.Get())
}

func (c *config) StringArray() []string {
	return cast.ToStringSlice(c.Get())
}

func (c *config) Scan(out any) error {
	var b []byte
	if marshaller := c.opts.Marshaller; marshaller != nil {
		if bb, err := marshaller.Marshal(c.Get()); err != nil {
			return err
		} else {
			b = bb
		}
	}
	if unmarshaler := c.opts.Unmarshaler; unmarshaler != nil {
		return unmarshaler.Unmarshal(b, out)
	}

	return nil
}

func (c *config) Get() any {
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

						configRef, err = rp.Get(context.Background())
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

func (c *config) Set(data any) error {
	if c == nil {
		return fmt.Errorf("value doesn't exist")
	}

	// Checking if we don't have a reference in the parent keys
	for i := len(c.k) - 1; i >= 0; i-- {
		switch m := c.Val("#").Val(c.k[:i]...).Get().(type) {
		case map[string]any:
			fmt.Println("HERE ", m["$ref"])
		}
	}

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

	var v any
	if c.opts.Unmarshaler != nil {
		if err := c.opts.Unmarshaler.Unmarshal(b, &v); err != nil {
			return err
		}
	}

	// Building the keys one by one
	var current = v
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

func (c *config) Del() error {
	if len(c.k) == 0 {
		*c.v = nil
		return nil
	}

	// Retrieving parent
	v := c.Val("#").Val(c.k[:len(c.k)-1]...)
	switch vv := v.Get().(type) {
	case []any:
		kk, err := strconv.Atoi(c.k[len(c.k)-1])
		if err != nil {
			return fmt.Errorf("wrong key for slice")
		}

		vv = append(vv[:kk], vv[kk+1:]...)

		return v.Set(vv)
	case map[string]any:
		delete(vv, c.k[len(c.k)-1])

		return v.Set(vv)
	}

	return nil
}

func (c *config) Val(s ...string) Values {
	return &config{
		v:    c.v,
		k:    StringToKeys(append(c.k, s...)...),
		opts: c.opts,
	}
}

func (c *config) Default(d any) Values {
	c.d = d
	return c
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
	case map[string]any:
		srcV, ok := src.(map[string]any)
		if !ok {
			return src, nil
			// return nil, errors.New("not the same type")
		}

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
