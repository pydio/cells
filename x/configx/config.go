package configx

import "time"

type Scanner interface {
	Scan(val interface{}) error
}

// TODO
// type Watcher interface {
// 	Watch() (config.Watcher, error)
// }

type Key interface{}

type Value interface {
	Default(interface{}) Value

	Bool() bool
	// Bytes() []byte
	Int() int
	Int64() int64
	Duration() time.Duration
	String() string
	StringMap() map[string]string
	StringArray() []string
	Slice() []interface{}
	Map() map[string]interface{}
}

type Values interface {
	Get() Value
	Set(value interface{}) error
	Del() error
	Values(key ...Key) Values

	Value

	Scanner
}

type Ref interface {
	Get() string
}

// NewMap returns a config value parsable as a map
func NewMap() Values {
	return &mymap{}
}
