package configx

import (
	"fmt"
	"reflect"
	"strconv"
	"strings"
	"sync"
)

func valAny(src any, k string) (dst any) {
	v := reflect.ValueOf(src)
	if !v.IsValid() {
		return src
	}

	// Look up the corresponding copy function.
	switch v.Kind() {
	case reflect.Map:
		dst = valMap(src, k)
	case reflect.Slice, reflect.Array:
		dst = valSlice(src, k)
	case reflect.String:
		dst = strings.Clone(src.(string))
	case reflect.Ptr, reflect.UnsafePointer:
		dst = valPtr(src, k)
	case reflect.Interface:
		dst = valAny(src, k)
	case reflect.Struct:
		dst = valStruct(src, k)
	default:
		fmt.Println("Shouldn't be there ?", v.Kind())
	}

	return
}

func valMap(x any, k string) any {
	v := reflect.ValueOf(x)
	if v.Kind() != reflect.Map {
		panic(fmt.Errorf("reflect: internal error: must be a Map; got %v", v.Kind()))
	}
	f := v.MapIndex(reflect.ValueOf(k))
	if f.IsValid() {
		return f.Interface()
	}

	return nil
}

func valSlice(x any, k string) any {
	v := reflect.ValueOf(x)
	if v.Kind() != reflect.Slice {
		panic(fmt.Errorf("reflect: internal error: must be a Slice; got %v", v.Kind()))
	}
	i := 0
	kv := reflect.ValueOf(k)
	if kv.CanInt() {
		i = int(kv.Int())
	} else {
		switch kv.Kind() {
		case reflect.String:
			var err error
			i, err = strconv.Atoi(kv.Interface().(string))
			if err != nil {
				return nil
			}
		default:
			return nil
		}
	}
	if i < 0 || i >= v.Len() {
		return nil
	}

	return v.Index(i).Interface()
}

func valPtr(x any, k string) any {
	v := reflect.ValueOf(x)
	if v.Kind() != reflect.Ptr && v.Kind() != reflect.UnsafePointer {
		panic(fmt.Errorf("reflect: internal error: must be a Pointer; got %v", v.Kind()))
	}

	// Checking if it implements a sync map
	switch xx := x.(type) {
	case *sync.Map:
		if dst, ok := xx.Load(k); ok {
			return dst
		}
	}
	return valAny(v.Elem().Interface(), k)
}

func valStruct(x any, k string) any {
	v := reflect.ValueOf(x)
	if v.Kind() != reflect.Struct {
		panic(fmt.Errorf("reflect: internal error: must be a Struct; got %v", v.Kind()))
	}

	f := v.FieldByName(k)
	if f.IsValid() {
		return f.Interface()
	}

	return nil
}
