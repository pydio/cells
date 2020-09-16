package configx

import (
	"time"
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

// NewMap returns a config value parsable as a map
// func NewMap() Values {
// 	return &mymap{}
// }

// func NewArray() Values {
// 	return &array{}
// }

// func NewValue() Values {
// 	return &value{}
// }

func NewFrom(i interface{}) Values {
	c := New()
	c.Set(i)
	return c
}
