package packages

import (
	"reflect"
	"runtime"

	"github.com/mattn/anko/env"
)

func init() {
	env.Packages["runtime"] = map[string]reflect.Value{
		"GC":         reflect.ValueOf(runtime.GC),
		"GOARCH":     reflect.ValueOf(runtime.GOARCH),
		"GOMAXPROCS": reflect.ValueOf(runtime.GOMAXPROCS),
		"GOOS":       reflect.ValueOf(runtime.GOOS),
		"GOROOT":     reflect.ValueOf(runtime.GOROOT),
		"Version":    reflect.ValueOf(runtime.Version),
	}
}
