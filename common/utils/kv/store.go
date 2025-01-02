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

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/utils/configx"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/std"
	"github.com/pydio/cells/v5/common/utils/watch"
)

type store struct {
	m            *any
	lock         *sync.RWMutex
	externalLock *sync.RWMutex
}

func newStore() *store {
	var a any

	return &store{
		m:            &a,
		lock:         new(sync.RWMutex),
		externalLock: new(sync.RWMutex),
	}
}

func NewStore(opt ...configx.Option) (st config.Store) {
	opts := configx.Options{}
	for _, o := range opt {
		o(&opts)
	}

	s := newStore()
	w := watch.NewWatcher(&clone{m: s.m, lock: s.lock})

	st = newStoreWithWatcher(s, w)

	if opts.Encrypter != nil {
		st = &storeWithEncrypter{
			Store:     s,
			Encrypter: opts.Encrypter,
			Decrypter: opts.Decrypter,
		}
	}

	return st
}

func (m *store) Watch(opts ...watch.WatchOption) (watch.Receiver, error) {
	return nil, errors.New("watch is not set on this")
}

func (m *store) update() {
	// Do nothing
}

func (m *store) Key() []string {
	return m.Val().Key()
}

func (m *store) Get(wo ...configx.WalkOption) any {
	return m.Val().Get()
}

func (m *store) Set(value any) error {
	return m.Val().Set(value)
}

func (m *store) Context(ctx context.Context) configx.Values {
	return m.Val().Context(ctx)
}

func (m *store) Options() *configx.Options {
	return m.Val().Options()
}

func (m *store) Val(path ...string) configx.Values {
	return &values{v: m, k: std.StringToKeys(path...), lock: m.lock}
}

func (m *store) Default(d any) configx.Values {
	return m.Val().Default(d)
}

func (m *store) Del() error {
	return fmt.Errorf("not implemented")
}

func (m *store) As(out any) bool { return false }

func (m *store) Close(_ context.Context) error {
	return nil
}

func (m *store) Done() <-chan struct{} {
	// Never returns
	return nil
}

func (m *store) Save(string, string) error {
	return nil
}

func (m *store) Lock() {
	m.externalLock.Lock()
}

func (m *store) Unlock() {
	m.externalLock.Unlock()
}

func (m *store) Flush() {
	// Do nothing
}

func (m *store) Reset() {
	// do nothing
}

type values struct {
	k []string
	v *store

	d any

	lock *sync.RWMutex

	ctx context.Context
}

func (v *values) get() any {
	vv := v.Get()
	if vv == nil {
		vv = v.d
	}
	return vv
}

func (v *values) Get(option ...configx.WalkOption) any {
	v.lock.RLock()
	defer v.lock.RUnlock()

	current := *v.v.m

	for _, k := range v.k {
		switch v := current.(type) {
		case []any:
			kk, err := strconv.Atoi(k)
			if err != nil {
				return err
			}

			if kk >= len(v) {
				return nil
			}

			current = v[kk]
		case map[any]any:
			if vv, ok := v[k]; ok {
				current = vv
			} else {
				return nil
			}
		case map[string]any:
			if vv, ok := v[k]; ok {
				current = vv
			} else {
				return nil
			}
		default:
			current = nil
		}
	}

	return current
}

func (v *values) Set(value any) error {
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

func (v *values) Del() error {
	if err := v.Set(nil); err != nil {
		return err
	}

	v.v.update()

	return nil
}

func (v *values) Context(ctx context.Context) configx.Values {
	return &values{v: v.v, k: v.k, ctx: ctx, lock: v.lock}
}

func (v *values) Val(path ...string) configx.Values {
	return &values{v: v.v, k: std.StringToKeys(append(v.k, path...)...), ctx: v.ctx, lock: v.v.lock}
}

func (v *values) Default(d any) configx.Values {
	return &values{v: v.v, k: v.k, d: d, ctx: v.ctx, lock: v.v.lock}
}

func (v *values) Options() *configx.Options {
	return &configx.Options{
		Context: v.ctx,
	}
}

func (v *values) Key() []string {
	return v.k
}

func (v *values) Bool() bool {
	return cast.ToBool(v.get())
}

func (v *values) Bytes() []byte {
	// TODO - context
	return []byte{}
}

func (v *values) Interface() any {
	return v.get()
}

func (v *values) Int() int {
	return cast.ToInt(v.get())

}

func (v *values) Int64() int64 {
	return cast.ToInt64(v.get())
}

func (v *values) Duration() time.Duration {
	return cast.ToDuration(v.get())
}

func (v *values) String() string {
	return cast.ToString(v.get())
}

func (v *values) StringMap() map[string]string {
	return cast.ToStringMapString(v.get())
}

func (v *values) StringArray() []string {
	return cast.ToStringSlice(v.get())
}

func (v *values) Slice() []any {
	return cast.ToSlice(v.get())
}

func (v *values) Map() map[string]any {
	return cast.ToStringMap(v.get())
}

func (v *values) Scan(out any, options ...configx.Option) error {
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
