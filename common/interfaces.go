package common

import "time"

type Scanner interface {
	Scan(val interface{}) error
}

type ConfigValues interface {
	Get(key ...string) interface{}
	Set(key string, value interface{}) error
	Del(key string) error

	Bool(key string, def ...bool) bool
	Bytes(key string, def ...[]byte) []byte
	Int(key string, def ...int) int
	Int64(key string, def ...int64) int64
	Duration(key string, def ...string) time.Duration
	String(key string, def ...string) string
	StringMap(key string) map[string]string
	StringArray(key string, def ...[]string) []string
	Map(key string) map[string]interface{}
	Array(key string) Scanner
	Values(key string) ConfigValues

	Database(k string) (string, string)

	IsEmpty() bool

	Scanner
}

type XMLSerializableForm interface {
	Serialize(languages ...string) interface{}
}
