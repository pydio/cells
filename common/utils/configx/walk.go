package configx

import "fmt"

type WalkFunc func(key []string, v Value) error

// walk recursively descends path, calling walkFn.
func walk(key []string, v Values, walkFn WalkFunc) error {
	if v == nil {
		return nil
	}
	vv := v.Get()
	if vv == nil {
		return nil
	}
	switch val := vv.Interface().(type) {
	case map[string]string:
		for k := range val {
			if err := walk(append(key, k), v.Val(k), walkFn); err != nil {
				return err
			}
		}
	case map[string]interface{}:
		for k := range val {
			if err := walk(append(key, k), v.Val(k), walkFn); err != nil {
				return err
			}
		}
	case []interface{}:
		for k := range val {
			kk := fmt.Sprintf("[%d]", k)

			dst := make([]string, len(key))
			copy(dst, key)

			if err := walk(append(dst[:len(dst)-1], dst[len(dst)-1]+kk), v.Val(kk), walkFn); err != nil {
				return err
			}
		}
	default:
		return walkFn(key, v)
	}

	return nil
}

func Walk(v Values, fn WalkFunc) error {
	return walk([]string{}, v, fn)
}
