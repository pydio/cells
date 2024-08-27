package newconfig

import (
	"context"
	"fmt"
	"reflect"
	"strconv"
	"strings"
)

type config struct {
	v       *interface{}
	k       []string // Reference to current key
	opts    Options
	rLocked bool
}

type Values interface {
	Get() any
	Val(path ...string) Values
	Set(data any) error
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

func (c *config) Get() any {
	var current any

	current = *c.v

	for _, k := range c.k {
		pv := reflect.ValueOf(current)
		switch pv.Kind() {
		case reflect.Slice:
			kk, err := strconv.Atoi(k)
			if err != nil {
				return nil
			}

			if kk >= pv.Len() {
				return nil
			}

			current = pv.Index(kk).Interface()
		case reflect.Map:
			if vv := pv.MapIndex(reflect.ValueOf(k)); !vv.IsValid() {
				return nil
			} else {
				current = vv.Interface()
			}
		default:
			current = nil
		}

		pv = reflect.ValueOf(current)
		switch pv.Kind() {
		case reflect.Map:
			if refV := pv.MapIndex(reflect.ValueOf("$ref")); refV.IsValid() {
				ref := strings.SplitN(refV.Interface().(string), "#", 2)

				// TODO - reftarget
				_, refValue := ref[0], ref[1]

				if rp := c.opts.ReferencePool; rp != nil {
					configRef, err := rp.Get(context.Background())
					if err != nil {
						return nil
					}

					current = configRef.Val(refValue).Get()
				}
			}
		}
	}

	return current
}

// Val is a recursive function that will try to find the current value in the config hierarchy
func (c *config) Val(s ...string) Values {
	keys := StringToKeys(s...)

	return &config{
		v:    c.v,
		k:    append(c.k, keys...),
		opts: c.opts,
	}
}

func (c *config) Set(data any) error {
	if c == nil {
		return fmt.Errorf("value doesn't exist")
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

	// We're at the root, replacing all
	if len(c.k) == 0 {
		*c.v = v
	} else {

		// Making sure all keys are created
		var current any
		current = *c.v

		for i, k := range c.k {
			last := i == len(c.k)-1
			pv := reflect.ValueOf(current)
			switch pv.Kind() {
			case reflect.Slice:
				kk, err := strconv.Atoi(k)
				if err != nil {
					return fmt.Errorf("not the right type %s", c.k[:i])
				}

				if kk >= pv.Len() {
					mm := make([]interface{}, kk+1)

					reflect.Copy(reflect.ValueOf(mm), pv)

					if last {
						mm[kk] = data
					} else {
						_, err := strconv.Atoi(c.k[i+1])
						if err != nil {
							mm[kk] = map[string]any{}
						} else {
							mm[kk] = []any{}
						}
					}

					(&config{
						v:    c.v,
						k:    c.k[:i],
						opts: c.opts,
					}).Set(mm)

					current = mm[kk]
				} else {
					if last {
						pv.Index(kk).Set(reflect.ValueOf(v))
					}

					current = pv.Index(kk).Interface()
				}
			case reflect.Map:
				if last {
					pv.SetMapIndex(reflect.ValueOf(k), reflect.ValueOf(v))
				} else {
					if vv := pv.MapIndex(reflect.ValueOf(k)); !vv.IsValid() {
						_, err := strconv.Atoi(c.k[i+1])
						if err != nil {
							pv.SetMapIndex(reflect.ValueOf(k), reflect.ValueOf(map[string]any{}))
						} else {
							pv.SetMapIndex(reflect.ValueOf(k), reflect.ValueOf([]any{}))
						}
					}
				}

				current = pv.MapIndex(reflect.ValueOf(k)).Interface()
			default:
				return fmt.Errorf("not the right type %s", c.k[:i])
			}
		}
	}

	return nil
}
