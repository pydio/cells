package mapx

import (
	"encoding/json"
	"errors"
	"time"
)

// ErrKeyDoesNotExist is returned when the key does not exist in the map.
var ErrKeyDoesNotExist = errors.New("key is not present in map")

// ErrKeyCanNotBeTypeAsserted is returned when the key can not be type asserted.
var ErrKeyCanNotBeTypeAsserted = errors.New("key could not be type asserted")

// GetString returns a string for a given key in values.
func GetString(values map[interface{}]interface{}, key interface{}) (string, error) {
	if v, ok := values[key]; !ok {
		return "", ErrKeyDoesNotExist
	} else if sv, ok := v.(string); !ok {
		return "", ErrKeyCanNotBeTypeAsserted
	} else {
		return sv, nil
	}
}

// GetStringSlice returns a string slice for a given key in values.
func GetStringSlice(values map[interface{}]interface{}, key interface{}) ([]string, error) {
	if v, ok := values[key]; !ok {
		return []string{}, ErrKeyDoesNotExist
	} else if sv, ok := v.([]string); ok {
		return sv, nil
	} else if sv, ok := v.([]interface{}); ok {
		vs := make([]string, len(sv))
		for k, v := range sv {
			vv, ok := v.(string)
			if !ok {
				return []string{}, ErrKeyCanNotBeTypeAsserted
			}
			vs[k] = vv
		}
		return vs, nil
	}
	return []string{}, ErrKeyCanNotBeTypeAsserted
}

// GetTime returns a string slice for a given key in values.
func GetTime(values map[interface{}]interface{}, key interface{}) (time.Time, error) {
	v, ok := values[key]
	if !ok {
		return time.Time{}, ErrKeyDoesNotExist
	}

	if sv, ok := v.(time.Time); ok {
		return sv, nil
	} else if sv, ok := v.(int64); ok {
		return time.Unix(sv, 0), nil
	} else if sv, ok := v.(int32); ok {
		return time.Unix(int64(sv), 0), nil
	} else if sv, ok := v.(int); ok {
		return time.Unix(int64(sv), 0), nil
	} else if sv, ok := v.(float64); ok {
		return time.Unix(int64(sv), 0), nil
	} else if sv, ok := v.(float32); ok {
		return time.Unix(int64(sv), 0), nil
	}

	return time.Time{}, ErrKeyCanNotBeTypeAsserted
}

// GetInt64Default returns a int64 or the default value for a given key in values.
func GetInt64Default(values map[interface{}]interface{}, key interface{}, defaultValue int64) int64 {
	f, err := GetInt64(values, key)
	if err != nil {
		return defaultValue
	}
	return f
}

// GetInt64 returns an int64 for a given key in values.
func GetInt64(values map[interface{}]interface{}, key interface{}) (int64, error) {
	if v, ok := values[key]; !ok {
		return 0, ErrKeyDoesNotExist
	} else if j, ok := v.(json.Number); ok {
		return j.Int64()
	} else if sv, ok := v.(int64); ok {
		return sv, nil
	}
	return 0, ErrKeyCanNotBeTypeAsserted
}

// GetInt32Default returns a int32 or the default value for a given key in values.
func GetInt32Default(values map[interface{}]interface{}, key interface{}, defaultValue int32) int32 {
	f, err := GetInt32(values, key)
	if err != nil {
		return defaultValue
	}
	return f
}

// GetInt32 returns an int32 for a given key in values.
func GetInt32(values map[interface{}]interface{}, key interface{}) (int32, error) {
	if v, ok := values[key]; !ok {
		return 0, ErrKeyDoesNotExist
	} else if sv, ok := v.(int32); ok {
		return sv, nil
	} else if sv, ok := v.(int); ok {
		return int32(sv), nil
	} else if j, ok := v.(json.Number); ok {
		v, err := j.Int64()
		return int32(v), err
	}
	return 0, ErrKeyCanNotBeTypeAsserted
}

// GetIntDefault returns a int or the default value for a given key in values.
func GetIntDefault(values map[interface{}]interface{}, key interface{}, defaultValue int) int {
	f, err := GetInt(values, key)
	if err != nil {
		return defaultValue
	}
	return f
}

// GetInt returns an int for a given key in values.
func GetInt(values map[interface{}]interface{}, key interface{}) (int, error) {
	if v, ok := values[key]; !ok {
		return 0, ErrKeyDoesNotExist
	} else if sv, ok := v.(int32); ok {
		return int(sv), nil
	} else if sv, ok := v.(int); ok {
		return sv, nil
	} else if j, ok := v.(json.Number); ok {
		v, err := j.Int64()
		return int(v), err
	}
	return 0, ErrKeyCanNotBeTypeAsserted

}

// GetFloat32Default returns a float32 or the default value for a given key in values.
func GetFloat32Default(values map[interface{}]interface{}, key interface{}, defaultValue float32) float32 {
	f, err := GetFloat32(values, key)
	if err != nil {
		return defaultValue
	}
	return f
}

// GetFloat32 returns a float32 for a given key in values.
func GetFloat32(values map[interface{}]interface{}, key interface{}) (float32, error) {
	if v, ok := values[key]; !ok {
		return 0, ErrKeyDoesNotExist
	} else if j, ok := v.(json.Number); ok {
		v, err := j.Float64()
		return float32(v), err
	} else if sv, ok := v.(float32); ok {
		return sv, nil
	}
	return 0, ErrKeyCanNotBeTypeAsserted
}

// GetFloat64Default returns a float64 or the default value for a given key in values.
func GetFloat64Default(values map[interface{}]interface{}, key interface{}, defaultValue float64) float64 {
	f, err := GetFloat64(values, key)
	if err != nil {
		return defaultValue
	}
	return f
}

// GetFloat64 returns a float64 for a given key in values.
func GetFloat64(values map[interface{}]interface{}, key interface{}) (float64, error) {
	if v, ok := values[key]; !ok {
		return 0, ErrKeyDoesNotExist
	} else if j, ok := v.(json.Number); ok {
		return j.Float64()
	} else if sv, ok := v.(float64); ok {
		return sv, nil
	}
	return 0, ErrKeyCanNotBeTypeAsserted
}

// GetStringDefault returns a string or the default value for a given key in values.
func GetStringDefault(values map[interface{}]interface{}, key interface{}, defaultValue string) string {
	if s, err := GetString(values, key); err == nil {
		return s
	}
	return defaultValue
}

// GetStringSliceDefault returns a string slice or the default value for a given key in values.
func GetStringSliceDefault(values map[interface{}]interface{}, key interface{}, defaultValue []string) []string {
	if s, err := GetStringSlice(values, key); err == nil {
		return s
	}
	return defaultValue
}

// KeyStringToInterface converts map[string]interface{} to map[interface{}]interface{}
func KeyStringToInterface(i map[string]interface{}) map[interface{}]interface{} {
	o := make(map[interface{}]interface{})
	for k, v := range i {
		o[k] = v
	}
	return o
}
