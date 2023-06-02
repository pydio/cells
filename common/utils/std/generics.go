package std

import (
	"fmt"
	"google.golang.org/protobuf/proto"
	"reflect"
	"strings"
	"sync"
)

type cloneable interface {
	proto.Message
}

type Cloneable interface {
	Clone() interface{}
}

func DeepClone[T any](t T) (dst T) {
	ret := copyAny(t)
	if v, ok := ret.(T); ok {
		dst = v
		return
	}
	return
}

func copySlice(x any) any {
	v := reflect.ValueOf(x)
	kind := v.Kind()
	if kind != reflect.Slice {
		panic(fmt.Sprintf("reflect: internal error: type %v is not a slice", kind))
	}

	size := v.Len()
	t := reflect.TypeOf(x)
	dc := reflect.MakeSlice(t, size, size)
	for i := 0; i < size; i++ {
		iv := reflect.ValueOf(copyAny(v.Index(i).Interface()))
		if iv.IsValid() {
			dc.Index(i).Set(iv)
		}
	}
	return dc.Interface()
}

func copyArray(x any) any {
	v := reflect.ValueOf(x)
	if v.Kind() != reflect.Array {
		panic(fmt.Errorf("reflect: internal error: must be an Array; got %v", v.Kind()))
	}
	t := reflect.TypeOf(x)
	size := t.Len()
	dc := reflect.New(reflect.ArrayOf(size, t.Elem())).Elem()
	for i := 0; i < size; i++ {
		item := copyAny(v.Index(i).Interface())
		dc.Index(i).Set(reflect.ValueOf(item))
	}
	return dc.Interface()
}

func copyMap(x any) any {
	v := reflect.ValueOf(x)
	if v.Kind() != reflect.Map {
		panic(fmt.Errorf("reflect: internal error: must be a Map; got %v", v.Kind()))
	}
	t := reflect.TypeOf(x)
	dc := reflect.MakeMapWithSize(t, v.Len())
	iter := v.MapRange()
	for iter.Next() {
		item := copyAny(iter.Value().Interface())
		k := copyAny(iter.Key().Interface())
		dc.SetMapIndex(reflect.ValueOf(k), reflect.ValueOf(item))
	}
	return dc.Interface()
}

func copyPointer(x any) any {
	switch vv := x.(type) {
	case proto.Message:
		return proto.Clone(vv)
	case Cloneable:
		return vv.Clone()
	case *sync.Map:
		return copySyncMap(vv)
	}
	v := reflect.ValueOf(x)
	if v.Kind() != reflect.Pointer {
		panic(fmt.Errorf("reflect: internal error: must be a Pointer or Ptr; got %v", v.Kind()))
	}

	t := reflect.TypeOf(x)
	dc := reflect.New(t.Elem())
	if !v.IsNil() {
		item := copyAny(v.Elem().Interface())
		iv := reflect.ValueOf(item)
		if iv.IsValid() {
			dc.Elem().Set(reflect.ValueOf(item))
		}
	}
	return dc.Interface()
}

func copySyncMap(x any) any {
	sm, ok := x.(*sync.Map)
	if !ok {
		panic(fmt.Errorf("reflect: internal error: must be a sync map; got %v", reflect.TypeOf(x)))
	}

	cp := &sync.Map{}
	sm.Range(func(k, v interface{}) bool {
		vm, ok := v.(*sync.Map)
		if ok {
			cp.Store(k, copySyncMap(vm))
		} else {
			cp.Store(k, copyAny(v))
		}

		return true
	})

	return cp
}

func copyStruct(x any) any {
	v := reflect.ValueOf(x)
	if v.Kind() != reflect.Struct {
		panic(fmt.Errorf("reflect: internal error: must be a Struct; got %v", v.Kind()))
	}
	t := reflect.TypeOf(x)
	dc := reflect.New(t)
	for i := 0; i < t.NumField(); i++ {

		f := t.Field(i)
		if f.PkgPath != "" {
			continue
		}
		item := copyAny(v.Field(i).Interface())
		dc.Elem().Field(i).Set(reflect.ValueOf(item))
	}
	return dc.Elem().Interface()
}

func copyAny(src any) (dst any) {
	v := reflect.ValueOf(src)
	if !v.IsValid() {
		return src
	}

	// Look up the corresponding copy function.
	switch v.Kind() {
	case reflect.Map:
		dst = copyMap(src)
	case reflect.Slice:
		dst = copySlice(src)
	case reflect.Array:
		dst = copyArray(src)
	case reflect.String:
		dst = strings.Clone(src.(string))
	case reflect.Ptr, reflect.UnsafePointer:
		dst = copyPointer(src)
	case reflect.Interface:
		dst = copyAny(src)
	case reflect.Struct:
		dst = copyStruct(src)
	default:
		fmt.Println("Shouldn't be there ?", v)
	}

	return
}

// Clone returns a copy of m.  This is a shallow clone:
// the new keys and values are set using ordinary assignment.
func CloneMap[M ~map[K]V, K comparable, V any](m M) M {
	// Preserve nil in case it matters.
	if m == nil {
		return nil
	}
	r := make(M, len(m))
	for k, v := range m {
		r[k] = v
	}
	return r
}

// Clone returns a copy of the slice.
// The elements are copied using assignment, so this is a shallow clone.
func CloneSlice[S ~[]E, E any](s S) S {
	// Preserve nil in case it matters.
	if s == nil {
		return nil
	}
	return append(S([]E{}), s...)
}
