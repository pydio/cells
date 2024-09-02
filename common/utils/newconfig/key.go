package newconfig

import (
	"strconv"
	"strings"
)

func FormatPath(ii ...interface{}) string {
	var r string
	for _, i := range ii {
		switch v := i.(type) {
		case int:
			r += "/" + strconv.Itoa(v)
		case string:
			r += "/" + v
		case []string:
			for _, vv := range v {
				r += FormatPath(vv)
			}
		}
	}

	return strings.TrimPrefix(r, "/")
}

func StringToKeys(s ...string) []string {
	var r []string

	for _, v := range s {
		if v == "" {
			continue
		}
		v = strings.Replace(v, "[", "/", -1)
		v = strings.Replace(v, "]", "/", -1)
		v = strings.Replace(v, "//", "/", -1)
		v = strings.Trim(v, "/")
		r = append(r, strings.Split(v, "/")...)
	}

	lastIndex := 0
	for i, v := range r {
		if v == "#" {
			lastIndex = i + 1
		}
	}

	r = r[lastIndex:]

	return r
}
