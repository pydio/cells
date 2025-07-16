package kv

import (
	"context"
	"errors"
	"fmt"
	"maps"
	"slices"
	"strconv"
	"sync"
	"time"

	"github.com/spf13/cast"

	"github.com/pydio/cells/v5/common/utils/configx"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/std"
	"github.com/pydio/cells/v5/common/utils/watch"
)

type Store struct {
	m            *any
	lock         *sync.RWMutex
	externalLock *sync.RWMutex
}

func NewStore() Store {
	var a any

	return Store{
		m:            &a,
		lock:         new(sync.RWMutex),
		externalLock: new(sync.RWMutex),
	}
}

func (c Store) Clone() Store {
	return Store{m: std.DeepClone(c.m), lock: c.lock, externalLock: c.externalLock}
}

func (c Store) Empty() {
	c.m = nil
}

func (m Store) Watch(opts ...watch.WatchOption) (watch.Receiver, error) {
	return nil, errors.New("watch is not set on this")
}

func (m Store) update() {
	// Do nothing
}

func (m Store) Key() []string {
	return m.Val().Key()
}

func (m Store) Get() any {
	return m.Val().Get()
}

func (m Store) Set(value any) error {
	return m.Val().Set(value)
}

func (m Store) Context(ctx context.Context) configx.Values {
	return m.Val().Context(ctx)
}

func (m Store) Options() *configx.Options {
	return m.Val().Options()
}

func (m Store) Val(path ...string) configx.Values {
	return values{v: m, k: std.StringToKeys(path...), lock: m.lock}
}

func (m Store) Default(d any) configx.Values {
	return m.Val().Default(d)
}

func (m Store) Del() error {
	return errors.New("not implemented")
}

func (m Store) As(out any) bool { return false }

func (m Store) Close(_ context.Context) error {
	return nil
}

func (m Store) Done() <-chan struct{} {
	// Never returns
	return nil
}

func (m Store) Save(string, string) error {
	return nil
}

func (m Store) Lock() {
	m.externalLock.Lock()
}

func (m Store) Unlock() {
	m.externalLock.Unlock()
}

func (m Store) Flush() {
	// Do nothing
}

func (m Store) Reset() {
	// do nothing
}

type values struct {
	k []string
	v Store

	d any

	lock *sync.RWMutex

	ctx context.Context
}

func (v values) get() any {
	vv := v.Get()
	if vv == nil {
		vv = v.d
	}

	return vv
}

func (v values) Get() any {
	v.lock.RLock()
	defer v.lock.RUnlock()

	current := *v.v.m

	for _, k := range v.k {
		switch vv := current.(type) {
		case []any:
			kk, err := strconv.Atoi(k)
			if err != nil {
				return err
			}

			if kk >= len(vv) {
				return nil
			}

			current = vv[kk]
		case map[any]any:
			if vv, ok := vv[k]; ok {
				current = vv
			} else {
				return v.d
			}
		case map[string]any:
			if vv, ok := vv[k]; ok {
				current = vv
			} else {
				return v.d
			}
		default:
			current = v.d
		}
	}

	return current
}

func (v values) Set(value any) error {
	// Building the keys one by one
	var current = value
	for i := len(v.k); i >= 1; i-- {
		k, err := strconv.Atoi(v.k[i-1])
		if err == nil {
			s := make([]any, k+1)
			s[k] = current
			current = s
		} else {
			m := make(map[string]any)
			m[v.k[i-1]] = current
			current = m
		}
	}

	if merged, err := merge(*v.v.m, current); err != nil {
		return err
	} else {
		*v.v.m = merged
	}

	v.v.update()

	return nil
}

func (v values) Del() error {
	if err := v.Set(nil); err != nil {
		return err
	}

	v.v.update()

	return nil
}

func (v values) Context(ctx context.Context) configx.Values {
	return values{v: v.v, k: v.k, ctx: ctx, lock: v.lock}
}

func (v values) Val(path ...string) configx.Values {
	return values{v: v.v, k: std.StringToKeys(append(v.k, path...)...), ctx: v.ctx, lock: v.v.lock}
}

func (v values) Default(d any) configx.Values {
	return values{v: v.v, k: v.k, d: d, ctx: v.ctx, lock: v.v.lock}
}

func (v values) Options() *configx.Options {
	return &configx.Options{
		Context: v.ctx,
	}
}

func (v values) Key() []string {
	return v.k
}

func (v values) Bool() bool {
	return cast.ToBool(v.get())
}

func (v values) Bytes() []byte {
	return []byte(cast.ToString(v.get()))
}

func (v values) Interface() any {
	return v.get()
}

func (v values) Int() int {
	return cast.ToInt(v.get())

}

func (v values) Int64() int64 {
	return cast.ToInt64(v.get())
}

func (v values) Duration() time.Duration {
	return cast.ToDuration(v.get())
}

func (v values) String() string {
	return cast.ToString(v.get())
}

func (v values) StringMap() map[string]string {
	return cast.ToStringMapString(v.get())
}

func (v values) StringArray() []string {
	return cast.ToStringSlice(v.get())
}

func (v values) Slice() []any {
	return cast.ToSlice(v.get())
}

func (v values) Map() map[string]any {
	return cast.ToStringMap(v.get())
}

func (v values) Scan(out any, options ...configx.Option) error {
	vin := v.get()
	if vin == nil {
		return nil
	}

	switch vout := out.(type) {
	case *map[string]interface{}:
		if vvin, ok := vin.(map[string]interface{}); ok {
			for kvvin, vvvin := range vvin {
				(*vout)[kvvin] = vvvin
			}
		} else {
			return fmt.Errorf("cannot convert %v to map[string]interface{}", vout)
		}
	default:
		if bin, err := json.Marshal(vin); err != nil {
			return err
		} else {
			if err := json.Unmarshal(bin, out); err != nil {
				return err
			}
		}
	}

	return nil
}

func merge(dst any, src any) (any, error) {
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

		// Merging those that are both in dst and in src
		m := maps.Clone(dstV)
		for k, v := range srcV {
			if merged, err := merge(dstV[k], v); err != nil {
				return nil, err
			} else {
				if merged == nil {
					delete(m, k)
				} else {
					m[k] = merged
				}
			}
		}

		current = m
	default:
		current = src
	}

	return current, nil
}

type clone struct {
	m    *any
	lock *sync.RWMutex
}

func (c *clone) Clone() *clone {
	return &clone{m: std.DeepClone(c.m), lock: c.lock}
}

func (c *clone) Get() any {
	c.lock.RLock()
	res := c.m
	c.lock.RUnlock()

	return res
}

func (c *clone) Empty() {
	c.m = nil
}
