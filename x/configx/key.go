package configx

import (
	"strconv"
	"strings"
)

type Keys []Key

func (k Keys) String() string {
	return strings.Join(keysToString(k...), "/")
}

func keysToString(k ...Key) []string {
	var r []string

	for _, kk := range k {
		switch v := kk.(type) {
		case int:
			r = append(r, strconv.Itoa(v))
		case string:
			v = strings.Replace(v, "[", "/", -1)
			v = strings.Replace(v, "]", "/", -1)
			v = strings.Replace(v, "//", "/", -1)
			v = strings.Trim(v, "/")
			r = append(r, strings.Split(v, "/")...)
		case []string:
			for _, vv := range v {
				r = append(r, keysToString(vv)...)
			}
		}
	}

	return r
}
