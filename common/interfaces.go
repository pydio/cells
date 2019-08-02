package common

type ConfigValues interface {
	Get(key string) interface{}
	Set(key string, value interface{}) error
	Del(key string) error

	Bool(key string, def ...bool) bool
	Int(key string, def ...int) int
	Int64(key string, defaultValue ...int64) int64
	String(key string) string
	StringMap(key string) map[string]string
	StringArray(key string) []string
	Map(key string) map[string]interface{}
	Scan(val interface{}) error

	Database(k string) (string, string)
}

type XMLSerializableForm interface {
	Serialize(languages ...string) interface{}
}
