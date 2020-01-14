// +build go1.8

package packages

import (
	"reflect"
	"sort"

	"github.com/mattn/anko/env"
)

func sortGo18() {
	env.Packages["sort"]["Slice"] = reflect.ValueOf(sort.Slice)
	env.Packages["sort"]["SliceIsSorted"] = reflect.ValueOf(sort.SliceIsSorted)
	env.Packages["sort"]["SliceStable"] = reflect.ValueOf(sort.SliceStable)
}
