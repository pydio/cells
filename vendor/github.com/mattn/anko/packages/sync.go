package packages

import (
	"reflect"
	"sync"

	"github.com/mattn/anko/env"
)

func init() {
	env.Packages["sync"] = map[string]reflect.Value{
		"NewCond": reflect.ValueOf(sync.NewCond),
	}
	env.PackageTypes["sync"] = map[string]reflect.Type{
		"Cond":      reflect.TypeOf(sync.Cond{}),
		"Mutex":     reflect.TypeOf(sync.Mutex{}),
		"Once":      reflect.TypeOf(sync.Once{}),
		"Pool":      reflect.TypeOf(sync.Pool{}),
		"RWMutex":   reflect.TypeOf(sync.RWMutex{}),
		"WaitGroup": reflect.TypeOf(sync.WaitGroup{}),
	}
	syncGo19()
}
