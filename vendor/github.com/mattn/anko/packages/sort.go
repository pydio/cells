package packages

import (
	"reflect"
	"sort"

	"github.com/mattn/anko/env"
)

// SortFuncsStruct provides functions to be used with Sort
type SortFuncsStruct struct {
	LenFunc  func() int
	LessFunc func(i, j int) bool
	SwapFunc func(i, j int)
}

func (s SortFuncsStruct) Len() int           { return s.LenFunc() }
func (s SortFuncsStruct) Less(i, j int) bool { return s.LessFunc(i, j) }
func (s SortFuncsStruct) Swap(i, j int)      { s.SwapFunc(i, j) }

func init() {
	env.Packages["sort"] = map[string]reflect.Value{
		"Float64s":          reflect.ValueOf(sort.Float64s),
		"Float64sAreSorted": reflect.ValueOf(sort.Float64sAreSorted),
		"Ints":              reflect.ValueOf(sort.Ints),
		"IntsAreSorted":     reflect.ValueOf(sort.IntsAreSorted),
		"IsSorted":          reflect.ValueOf(sort.IsSorted),
		"Search":            reflect.ValueOf(sort.Search),
		"SearchFloat64s":    reflect.ValueOf(sort.SearchFloat64s),
		"SearchInts":        reflect.ValueOf(sort.SearchInts),
		"SearchStrings":     reflect.ValueOf(sort.SearchStrings),
		"Sort":              reflect.ValueOf(sort.Sort),
		"Stable":            reflect.ValueOf(sort.Stable),
		"Strings":           reflect.ValueOf(sort.Strings),
		"StringsAreSorted":  reflect.ValueOf(sort.StringsAreSorted),
	}
	env.PackageTypes["sort"] = map[string]reflect.Type{
		"Float64Slice":    reflect.TypeOf(sort.Float64Slice{}),
		"IntSlice":        reflect.TypeOf(sort.IntSlice{}),
		"StringSlice":     reflect.TypeOf(sort.StringSlice{}),
		"SortFuncsStruct": reflect.TypeOf(&SortFuncsStruct{}),
	}
	sortGo18()
}
