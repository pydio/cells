package vm

import (
	"errors"
	"fmt"
	"reflect"
	"strconv"
	"strings"
)

// toString converts all reflect.Value-s into string.
func toString(v reflect.Value) string {
	if v.Kind() == reflect.Interface && !v.IsNil() {
		v = v.Elem()
	}
	if v.Kind() == reflect.Ptr {
		v = v.Elem()
	}
	if v.Kind() == reflect.String {
		return v.String()
	}
	return fmt.Sprint(v.Interface())
}

// toBool converts all reflect.Value-s into bool.
func toBool(v reflect.Value) bool {
	b, _ := tryToBool(v)
	return b
}

// tryToBool attempts to convert the value 'v' to a boolean, returning
// an error if it cannot. When converting a string, the function returns
// true if the string nonempty and does not satisfy the condition for false
// with parseBool https://golang.org/pkg/strconv/#ParseBool
// and is not 0.0
func tryToBool(v reflect.Value) (bool, error) {
	if v.Kind() == reflect.Ptr || v.Kind() == reflect.Interface {
		v = v.Elem()
	}
	switch v.Kind() {
	case reflect.Float64, reflect.Float32:
		return v.Float() != 0, nil
	case reflect.Int64, reflect.Int32, reflect.Int16, reflect.Int8, reflect.Int:
		return v.Int() != 0, nil
	case reflect.Bool:
		return v.Bool(), nil
	case reflect.String:
		if v.Len() == 0 {
			return false, nil
		}

		s := v.String()
		if b, err := strconv.ParseBool(s); err == nil && !b {
			return false, nil
		}

		if f, err := tryToFloat64(v); err == nil && f == 0 {
			return false, nil
		}
		return true, nil
	case reflect.Slice, reflect.Map:
		if v.Len() > 0 {
			return true, nil
		}
		return false, nil
	}
	return false, errors.New("unknown type")
}

// toFloat64 converts all reflect.Value-s into float64.
func toFloat64(v reflect.Value) float64 {
	f, _ := tryToFloat64(v)
	return f
}

// tryToFloat64 attempts to convert a value to a float64.
// If it cannot (in the case of a non-numeric string, a struct, etc.)
// it returns 0.0 and an error.
func tryToFloat64(v reflect.Value) (float64, error) {
	if v.Kind() == reflect.Ptr || v.Kind() == reflect.Interface {
		v = v.Elem()
	}
	switch v.Kind() {
	case reflect.Float64, reflect.Float32:
		return v.Float(), nil
	case reflect.Int64, reflect.Int32, reflect.Int16, reflect.Int8, reflect.Int:
		return float64(v.Int()), nil
	case reflect.Bool:
		if v.Bool() {
			return 1, nil
		}
		return 0, nil
	case reflect.String:
		f, err := strconv.ParseFloat(v.String(), 64)
		if err == nil {
			return f, nil
		}
	}
	return 0.0, errors.New("couldn't convert to a float64")
}

// toInt64 converts all reflect.Value-s into int64.
func toInt64(v reflect.Value) int64 {
	i, _ := tryToInt64(v)
	return i
}

// tryToInt64 attempts to convert a value to an int64.
// If it cannot (in the case of a non-numeric string, a struct, etc.)
// it returns 0 and an error.
func tryToInt64(v reflect.Value) (int64, error) {
	if v.Kind() == reflect.Ptr || v.Kind() == reflect.Interface {
		v = v.Elem()
	}
	switch v.Kind() {
	case reflect.Float64, reflect.Float32:
		return int64(v.Float()), nil
	case reflect.Int64, reflect.Int32, reflect.Int16, reflect.Int8, reflect.Int:
		return v.Int(), nil
	case reflect.Bool:
		if v.Bool() {
			return 1, nil
		}
		return 0, nil
	case reflect.String:
		s := v.String()
		var i int64
		var err error
		if strings.HasPrefix(s, "0x") {
			i, err = strconv.ParseInt(s, 16, 64)
		} else {
			i, err = strconv.ParseInt(s, 10, 64)
		}
		if err == nil {
			return i, nil
		}
	}
	return 0, errors.New("couldn't convert to integer")
}

// toInt converts all reflect.Value-s into int.
func toInt(v reflect.Value) int {
	i, _ := tryToInt(v)
	return i
}

// tryToInt attempts to convert a value to an int.
// If it cannot (in the case of a non-numeric string, a struct, etc.)
// it returns 0 and an error.
func tryToInt(v reflect.Value) (int, error) {
	if v.Kind() == reflect.Ptr || v.Kind() == reflect.Interface {
		v = v.Elem()
	}
	switch v.Kind() {
	case reflect.Float64, reflect.Float32:
		return int(v.Float()), nil
	case reflect.Int64, reflect.Int32, reflect.Int16, reflect.Int8, reflect.Int:
		return int(v.Int()), nil
	case reflect.Bool:
		if v.Bool() {
			return 1, nil
		}
		return 0, nil
	case reflect.String:
		s := v.String()
		var i int64
		var err error
		if strings.HasPrefix(s, "0x") {
			i, err = strconv.ParseInt(s, 16, 64)
		} else {
			i, err = strconv.ParseInt(s, 10, 64)
		}
		if err == nil {
			return int(i), nil
		}
	}
	return 0, errors.New("couldn't convert to integer")
}
