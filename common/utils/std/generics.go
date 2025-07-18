package std

import (
	"fmt"
	"reflect"
	"slices"
	"strings"
	"sync"

	"google.golang.org/protobuf/proto"
)

type cloneable interface {
	proto.Message
}

type Cloneable[T any] interface {
	Clone() T
}

func Clone[T any](input T) T {
	// Get the type of the input
	t := reflect.TypeOf(input)

	// Ensure the input is a struct or pointer to a struct
	if t.Kind() == reflect.Ptr {
		t = t.Elem()
	}

	// Create a new instance of the struct
	newValue := reflect.New(t).Elem()

	// Return the zero-value struct as the same type
	return newValue.Interface().(T)
}

func DeepClone[T any](t T) (dst T) {
	ret := copyAny[T](t)
	if v, ok := ret.(T); ok {
		dst = v
		return
	}
	return
}

func copyPremitive[T any](src any) (dst any) {
	kind := reflect.ValueOf(src).Kind()
	switch kind {
	case reflect.Array, reflect.Chan, reflect.Interface, reflect.Map, reflect.Ptr, reflect.Slice, reflect.Struct, reflect.UnsafePointer:
		panic(fmt.Sprintf("reflect: internal error: type %v is not a primitive", kind))
	}
	dst = src
	return
}

func copySlice[T any](x any) any {
	v := reflect.ValueOf(x)
	kind := v.Kind()
	if kind != reflect.Slice {
		panic(fmt.Sprintf("reflect: internal error: type %v is not a slice", kind))
	}

	size := v.Len()
	t := reflect.TypeOf(x)
	dc := reflect.MakeSlice(t, size, size)
	for i := 0; i < size; i++ {
		iv := reflect.ValueOf(copyAny[T](v.Index(i).Interface()))
		if iv.IsValid() {
			dc.Index(i).Set(iv)
		}
	}
	return dc.Interface()
}

func copyArray[T any](x any) any {
	v := reflect.ValueOf(x)
	if v.Kind() != reflect.Array {
		panic(fmt.Errorf("reflect: internal error: must be an Array; got %v", v.Kind()))
	}
	t := reflect.TypeOf(x)
	size := t.Len()
	dc := reflect.New(reflect.ArrayOf(size, t.Elem())).Elem()
	for i := 0; i < size; i++ {
		item := copyAny[T](v.Index(i).Interface())
		dc.Index(i).Set(reflect.ValueOf(item))
	}
	return dc.Interface()
}

func copyMap[T any](x any) any {
	v := reflect.ValueOf(x)
	if v.Kind() != reflect.Map {
		panic(fmt.Errorf("reflect: internal error: must be a Map; got %v", v.Kind()))
	}
	t := reflect.TypeOf(x)
	dc := reflect.MakeMapWithSize(t, v.Len())
	iter := v.MapRange()
	for iter.Next() {
		item := copyAny[T](iter.Value().Interface())
		k := copyAny[T](iter.Key().Interface())
		dc.SetMapIndex(reflect.ValueOf(k), reflect.ValueOf(item))
	}
	return dc.Interface()
}

func copyPointer[T any](x any) any {
	switch vv := x.(type) {
	case proto.Message:
		return proto.Clone(vv)
	case Cloneable[T]:
		return vv.Clone()
	case Cloneable[any]:
		return vv.Clone()
	case *sync.Map:
		return copySyncMap[T](vv)
	}
	v := reflect.ValueOf(x)
	if v.Kind() != reflect.Pointer {
		panic(fmt.Errorf("reflect: internal error: must be a Pointer or Ptr; got %v", v.Kind()))
	}

	t := reflect.TypeOf(x)
	dc := reflect.New(t.Elem())
	if !v.IsNil() {
		item := copyAny[T](v.Elem().Interface())
		iv := reflect.ValueOf(item)
		if iv.IsValid() {
			dc.Elem().Set(reflect.ValueOf(item))
		}
	}
	return dc.Interface()
}

func copySyncMap[T any](x any) any {
	sm, ok := x.(*sync.Map)
	if !ok {
		panic(fmt.Errorf("reflect: internal error: must be a sync map; got %v", reflect.TypeOf(x)))
	}

	cp := &sync.Map{}
	sm.Range(func(k, v interface{}) bool {
		vm, ok := v.(*sync.Map)
		if ok {
			cp.Store(k, copySyncMap[T](vm))
		} else {
			cp.Store(k, copyAny[T](v))
		}

		return true
	})

	return cp
}

func copyStruct[T any](x any) any {

	switch vv := x.(type) {
	case Cloneable[T]:
		return vv.Clone()
	default:
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
			item := copyAny[T](v.Field(i).Interface())
			if iv := reflect.ValueOf(item); iv.IsValid() {
				dc.Elem().Field(i).Set(reflect.ValueOf(item))
			}
		}
		return dc.Elem().Interface()
	}
}

func copyChan[T any](x any) any {
	v := reflect.ValueOf(x)
	if v.Kind() != reflect.Chan {
		panic(fmt.Errorf("reflect: internal error: must be a Chan; got %v", v.Kind()))
	}
	t := reflect.TypeOf(x)
	dir := t.ChanDir()
	var dc any
	switch dir {
	case reflect.BothDir:
		fallthrough
	case reflect.SendDir, reflect.RecvDir:
		dc = x
	}
	return dc
}

func copyAny[T any](src any) (dst any) {
	v := reflect.ValueOf(src)
	if !v.IsValid() {
		return src
	}

	// Look up the corresponding copy function.
	switch v.Kind() {
	case reflect.Bool, reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32,
		reflect.Int64, reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32,
		reflect.Uint64, reflect.Uintptr, reflect.Float32, reflect.Float64,
		reflect.Complex64, reflect.Complex128, reflect.Func:
		dst = copyPremitive[T](src)
	case reflect.String:
		dst = strings.Clone(src.(string))
	case reflect.Slice:
		dst = copySlice[T](src)
	case reflect.Array:
		dst = copyArray[T](src)
	case reflect.Map:
		dst = copyMap[T](src)
	case reflect.Ptr, reflect.UnsafePointer:
		dst = copyPointer[T](src)
	case reflect.Struct:
		dst = copyStruct[T](src)
	case reflect.Interface:
		dst = copyAny[T](src)
	case reflect.Chan:
		dst = copyChan[T](src)
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

// DiffSlices finds added and removed values between previous and next
func DiffSlices[S ~[]E, E comparable](prev S, next S) (added S, removed S) {
	for _, source := range next {
		if !slices.Contains(prev, source) {
			added = append(added, source)
		}
	}
	for _, source := range prev {
		if !slices.Contains(next, source) {
			removed = append(removed, source)
		}
	}
	return
}
