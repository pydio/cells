package models

import (
	"encoding/json"
	"errors"
	"reflect"
	"time"

	"github.com/imdario/mergo"
	"github.com/pydio/cells/common/config/source"
)

var (
	ErrDifferentArgumentsTypes = errors.New("src and dst must be of same type")
)

type Config source.ChangeSet

func (c *Config) Equals(o Differ) bool {
	return false
}

func (c *Config) IsDeletable(m map[string]string) bool {
	return false
}

// test if two user can be mergeable whose the same login name and auth source
func (c *Config) IsMergeable(o Differ) bool {
	return true
}

func (c *Config) GetUniqueId() string {
	return ""
}

func (c *Config) Merge(o Differ, options map[string]string) (Differ, error) {

	new, err := merge((*source.ChangeSet)(o.(*Config)), (*source.ChangeSet)(c))

	if err != nil {
		return nil, err
	}

	return (*Config)(new), nil
}

func merge(changes ...*source.ChangeSet) (*source.ChangeSet, error) {
	merged := make(map[string]interface{})

	for _, m := range changes {
		if m == nil {
			continue
		}

		if len(m.Data) == 0 {
			continue
		}

		var data map[string]interface{}
		if err := json.Unmarshal(m.Data, &data); err != nil {
			return nil, err
		}

		if err := mergo.Map(&merged, data); err != nil {
			return nil, err
		}
	}

	deepMerge(reflect.ValueOf(&merged))

	b, err := json.Marshal(merged)
	if err != nil {
		return nil, err
	}

	cs := &source.ChangeSet{
		Timestamp: time.Now(),
		Data:      b,
		Source:    "json",
	}

	return cs, nil
}

func mergeSlice(dst reflect.Value) (reflect.Value, error) {
	elems := make(map[string][]reflect.Value)

	for i := 0; i < dst.Len(); i++ {
		found := false
		elem := dst.Index(i)
		id := ""

		switch elem.Elem().Kind() {
		case reflect.Map:
			for _, key := range elem.Elem().MapKeys() {
				if key.String() == "id" || key.String() == "Id" {
					id = reflect.ValueOf(elem.Elem().MapIndex(key).Interface()).String()
					found = true
				}
			}
			if found {
				elems[id] = append(elems[id], elem)
			}
		default:
			return dst, nil
		}
	}

	if len(elems) == 0 {
		return dst, nil
	}

	var new []interface{}
	for _, elemsToMerge := range elems {
		val := make(map[string]interface{})
		for _, elem := range elemsToMerge {
			err := mergo.Map(&val, elem.Interface())
			if err != nil {
				return reflect.ValueOf(new), err
			}
		}

		new = append(new, val)
	}

	return reflect.ValueOf(new), nil
}

func deepMerge(dst reflect.Value) (err error) {

	switch dst.Kind() {
	case reflect.Map:
		for _, key := range dst.MapKeys() {
			dstElement := dst.MapIndex(key)

			switch dstElement.Kind() {
			case reflect.Ptr:
			case reflect.Interface:
				dstElement = dstElement.Elem()

				switch dstElement.Kind() {
				case reflect.Slice:
					new, err := mergeSlice(dstElement)
					if err != nil {
						return err
					}

					dst.SetMapIndex(key, new)
				default:
					if err := deepMerge(dstElement); err != nil {
						return err
					}
				}
			case reflect.Slice:
				fallthrough
			default:
				if err := deepMerge(dstElement); err != nil {
					return err
				}
			}
		}

	case reflect.Struct:
		for i, n := 0, dst.NumField(); i < n; i++ {
			if err = deepMerge(dst.Field(i)); err != nil {
				return err
			}
		}
	case reflect.Ptr:
		fallthrough
	case reflect.Interface:
		dstElement := dst.Elem()

		switch dstElement.Kind() {
		case reflect.Slice:
			new, err := mergeSlice(dstElement)
			if err != nil {
				return err
			}

			dstElement.Set(new)
		default:
			return deepMerge(dstElement)
		}
	default:
		if dst.CanSet() {
			dst.Set(dst)
		}
	}
	return
}
