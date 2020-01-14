package packages

import (
	"reflect"
	"regexp"

	"github.com/mattn/anko/env"
)

func init() {
	env.Packages["regexp"] = map[string]reflect.Value{
		"Match":            reflect.ValueOf(regexp.Match),
		"MatchReader":      reflect.ValueOf(regexp.MatchReader),
		"MatchString":      reflect.ValueOf(regexp.MatchString),
		"QuoteMeta":        reflect.ValueOf(regexp.QuoteMeta),
		"Compile":          reflect.ValueOf(regexp.Compile),
		"CompilePOSIX":     reflect.ValueOf(regexp.CompilePOSIX),
		"MustCompile":      reflect.ValueOf(regexp.MustCompile),
		"MustCompilePOSIX": reflect.ValueOf(regexp.MustCompilePOSIX),
	}
}
