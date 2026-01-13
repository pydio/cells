package kv

import (
	"context"
	"errors"
	"sync"
	"time"

	"github.com/pydio/cells/v5/common/utils/std"
	"github.com/pydio/cells/v5/common/utils/watch"
)

type Values interface {
	Storer
	Caster
}

type Storer interface {
	Context(ctx context.Context) Values
	Options() *Options
	Key() []string
	Val(path ...string) Values
	Default(def any) Values
	Get() any
	Set(value any) error
	Del() error
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

type Store struct {
	// Live mutable root. Protected by lock.
	m any

	opts Options

	// Internal lock guarding m for readers/writers.
	lock *sync.RWMutex
}

func NewStore(opt ...Option) *Store {
	opts := Options{}
	for _, o := range opt {
		o(&opts)
	}

	return &Store{
		m:    map[string]any{},
		lock: new(sync.RWMutex),
		opts: opts,
	}
}

// Clone preserves your previous “shared store” behavior: clones share the same underlying state.
// (Matches your old pointer-field pattern.)
func (c *Store) Clone() *Store {
	return &Store{
		m:    std.DeepClone(c.m), // note: actual root is accessed under c.lock; this field is not authoritative by itself
		lock: c.lock,
	}
}

func (c *Store) Empty() {
	c.lock.Lock()
	c.m = nil
	c.lock.Unlock()
}

func (m *Store) Watch(opts ...watch.WatchOption) (watch.Receiver, error) {
	return nil, errors.New("watch is not set on this")
}

func (m *Store) Key() []string { return m.Val().Key() }

func (m *Store) Get() any { return m.Val().Get() }

func (m *Store) Set(value any) error { return m.Val().Set(value) }

func (m *Store) Context(ctx context.Context) Values { return m.Val().Context(ctx) }

func (m *Store) Options() *Options { return m.Val().Options() }

func (m *Store) Val(path ...string) Values {
	return &values{
		v:    m,
		opts: m.opts,
		k:    std.StringToKeys(path...),
		lock: m.lock,
		ctx:  context.Background(),
	}
}

func (m *Store) Default(d any) Values { return m.Val().Default(d) }

func (m *Store) Del() error { return errors.New("not implemented") }

func (m *Store) As(out any) bool { return false }

func (m *Store) Close(_ context.Context) error { return nil }

func (m *Store) Done() <-chan struct{} { return nil } // never closes

func (m *Store) Save(string, string) error { return nil }

func (m *Store) Flush() {}

func (m *Store) Reset() {}

func (m *Store) RLock() {
	m.lock.RLock()
}

func (m *Store) RUnlock() {
	m.lock.RUnlock()
}
