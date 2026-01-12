package kv

import (
	"context"
	"errors"
	"fmt"
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
	// Live mutable root. Protected by lock.
	m any

	// Internal lock guarding m for readers/writers.
	lock *sync.RWMutex
}

func NewStore() Store {
	return Store{
		m:    map[string]any{},
		lock: new(sync.RWMutex),
	}
}

// Clone preserves your previous “shared store” behavior: clones share the same underlying state.
// (Matches your old pointer-field pattern.)
func (c Store) Clone() Store {
	return Store{
		m:    std.DeepClone(c.m), // note: actual root is accessed under c.lock; this field is not authoritative by itself
		lock: c.lock,
	}
}

func (c Store) Empty() {
	c.lock.Lock()
	c.m = nil
	c.lock.Unlock()
}

func (m Store) Watch(opts ...watch.WatchOption) (watch.Receiver, error) {
	return nil, errors.New("watch is not set on this")
}

func (m Store) Key() []string { return m.Val().Key() }

func (m Store) Get() any { return m.Val().Get() }

func (m Store) Set(value any) error { return m.Val().Set(value) }

func (m Store) Context(ctx context.Context) configx.Values { return m.Val().Context(ctx) }

func (m Store) Options() *configx.Options { return m.Val().Options() }

func (m Store) Val(path ...string) configx.Values {
	return values{
		v:    m,
		k:    std.StringToKeys(path...),
		lock: m.lock,
		ctx:  context.Background(),
	}
}

func (m Store) Default(d any) configx.Values { return m.Val().Default(d) }

func (m Store) Del() error { return errors.New("not implemented") }

func (m Store) As(out any) bool { return false }

func (m Store) Close(_ context.Context) error { return nil }

func (m Store) Done() <-chan struct{} { return nil } // never closes

func (m Store) Save(string, string) error { return nil }

func (m Store) Flush() {}

func (m Store) Reset() {}

/* ------------------------------ values -------------------------------- */

type values struct {
	k []string
	v Store

	d any

	lock *sync.RWMutex
	ctx  context.Context
}

func (v values) Key() []string { return v.k }

func (v values) Context(ctx context.Context) configx.Values {
	return values{v: v.v, k: v.k, d: v.d, lock: v.lock, ctx: ctx}
}

func (v values) Options() *configx.Options {
	return &configx.Options{Context: v.ctx}
}

func (v values) Val(path ...string) configx.Values {
	return values{v: v.v, k: std.StringToKeys(append(v.k, path...)...), d: v.d, lock: v.lock, ctx: v.ctx}
}

func (v values) Default(d any) configx.Values {
	return values{v: v.v, k: v.k, d: d, lock: v.lock, ctx: v.ctx}
}

// Get is a safe read: takes RLock and reads live state.
// Guarantees it sees the latest write that completed before this call.
func (v values) Get() any {
	v.lock.RLock()
	defer v.lock.RUnlock()

	current := v.v.m
	for _, k := range v.k {
		switch vv := current.(type) {
		case nil:
			if v.d != nil {
				return v.d
			}
			return nil

		case []any:
			idx, err := strconv.Atoi(k)
			if err != nil || idx < 0 || idx >= len(vv) {
				if v.d != nil {
					return v.d
				}
				return nil
			}
			current = vv[idx]

		case map[string]any:
			n, ok := vv[k]
			if !ok {
				if v.d != nil {
					return v.d
				}
				return nil
			}
			current = n

		case map[any]any:
			// support legacy maps if present
			n, ok := vv[k]
			if !ok {
				if v.d != nil {
					return v.d
				}
				return nil
			}
			current = n

		default:
			if v.d != nil {
				return v.d
			}
			return nil
		}
	}

	if current == nil && v.d != nil {
		return v.d
	}

	return current
}

func (v values) safeGet() any {
	vv := v.Get()

	v.lock.RLock()
	defer v.lock.RUnlock()

	return vv
}

// Set matches your previous semantics:
// - build patch tree from path + value
// - merge into root in place under Lock
func (v values) Set(value any) error {
	patch, err := buildPatch(v.k, value)
	if err != nil {
		return err
	}

	v.lock.Lock()
	defer v.lock.Unlock()

	merged, err := merge(v.v.m, patch)
	if err != nil {
		return err
	}
	v.v.m = merged
	return nil
}

func (v values) Del() error {
	// Same as before: Set(nil) => merge semantics delete map keys.
	return v.Set(nil)
}

/* ------------------------- typed helpers ------------------------------ */

func (v values) Bool() bool { return cast.ToBool(v.safeGet()) }

func (v values) Bytes() []byte { return []byte(cast.ToString(v.safeGet())) }

func (v values) Interface() any { return v.safeGet() }

func (v values) Int() int { return cast.ToInt(v.safeGet()) }

func (v values) Int64() int64 { return cast.ToInt64(v.safeGet()) }

func (v values) Duration() time.Duration { return cast.ToDuration(v.safeGet()) }

func (v values) String() string { return cast.ToString(v.safeGet()) }

func (v values) StringMap() map[string]string {
	return cast.ToStringMapString(v.safeGet())
}

func (v values) StringArray() []string { return cast.ToStringSlice(v.safeGet()) }

func (v values) Slice() []any { return cast.ToSlice(v.safeGet()) }

func (v values) Map() map[string]any { return cast.ToStringMap(v.safeGet()) }

func (v values) Scan(out any, options ...configx.Option) error {
	vin := v.Get()
	if vin == nil {
		return nil
	}

	switch vout := out.(type) {
	case *map[string]interface{}:
		if vvin, ok := vin.(map[string]interface{}); ok {
			for k, vv := range vvin {
				(*vout)[k] = vv
			}
		} else {
			return fmt.Errorf("cannot convert %T to map[string]interface{}", vin)
		}
	default:
		bin, err := json.Marshal(vin)
		if err != nil {
			return err
		}
		if err := json.Unmarshal(bin, out); err != nil {
			return err
		}
	}
	return nil
}

/* -------------------------- Patch building ---------------------------- */

func buildPatch(keys []string, value any) (any, error) {
	cur := value
	for i := len(keys); i >= 1; i-- {
		seg := keys[i-1]
		if idx, err := strconv.Atoi(seg); err == nil {
			if idx < 0 {
				return nil, fmt.Errorf("negative index segment: %q", seg)
			}
			s := make([]any, idx+1)
			s[idx] = cur
			cur = s
		} else {
			m := make(map[string]any, 1)
			m[seg] = cur
			cur = m
		}
	}
	return cur, nil
}

/* ----------------------------- merge ---------------------------------- */

// merge is your original in-place-ish merge semantics (it may mutate maps/slices).
// It returns the merged value (which may be dst mutated, or src replacing it).
func merge(dst any, src any) (any, error) {
	if dst == nil {
		return src, nil
	}
	if src == nil {
		return nil, nil
	}

	switch dstV := dst.(type) {
	case []any:
		srcV, ok := src.([]any)
		if !ok {
			return src, nil
		}

		// resize dst to min(len(dst), len(src))
		if len(dstV) > len(srcV) {
			dstV = dstV[:len(srcV)]
		}

		// merge common prefix
		for i := 0; i < len(dstV) && i < len(srcV); i++ {
			merged, err := merge(dstV[i], srcV[i])
			if err != nil {
				return nil, err
			}
			dstV[i] = merged
		}

		// append remaining
		if len(srcV) > len(dstV) {
			if cap(dstV) < len(srcV) {
				nd := make([]any, len(dstV), len(srcV))
				copy(nd, dstV)
				dstV = nd
			}
			dstV = append(dstV, srcV[len(dstV):]...)
		}
		return dstV, nil

	case map[string]any:
		switch srcV := src.(type) {
		case map[string]any:
			for k, v := range srcV {
				merged, err := merge(dstV[k], v)
				if err != nil {
					return nil, err
				}
				if merged == nil {
					delete(dstV, k)
				} else {
					dstV[k] = merged
				}
			}
			return dstV, nil

		case map[any]any:
			for k, v := range srcV {
				ks, ok := k.(string)
				if !ok {
					ks = fmt.Sprint(k)
				}
				merged, err := merge(dstV[ks], v)
				if err != nil {
					return nil, err
				}
				if merged == nil {
					delete(dstV, ks)
				} else {
					dstV[ks] = merged
				}
			}
			return dstV, nil

		default:
			return src, nil
		}

	case map[any]any:
		switch srcV := src.(type) {
		case map[any]any:
			for k, v := range srcV {
				merged, err := merge(dstV[k], v)
				if err != nil {
					return nil, err
				}
				if merged == nil {
					delete(dstV, k)
				} else {
					dstV[k] = merged
				}
			}
			return dstV, nil

		case map[string]any:
			for k, v := range srcV {
				merged, err := merge(dstV[k], v)
				if err != nil {
					return nil, err
				}
				if merged == nil {
					delete(dstV, k)
				} else {
					dstV[k] = merged
				}
			}
			return dstV, nil

		default:
			return src, nil
		}

	default:
		return src, nil
	}
}
