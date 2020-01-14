package packages

import (
	"net/http/cookiejar"
	"reflect"

	"github.com/mattn/anko/env"
)

func init() {
	env.Packages["net/http/cookiejar"] = map[string]reflect.Value{
		"New": reflect.ValueOf(cookiejar.New),
	}
	env.PackageTypes["net/http/cookiejar"] = map[string]reflect.Type{
		"Options": reflect.TypeOf(cookiejar.Options{}),
	}
}
