package std

import (
	"strconv"
	"strings"
)

type bytesec interface {
	string | []byte
}

func CommonPrefixLen[T bytesec](a T, b T) int {
	i := 0
	for i < len(a) && i < len(b) && a[i] == b[i] {
		i++
	}
	return i
}

func Unique[V comparable, T []V](input T) T {
	seen := make(map[V]struct{})
	var result T

	for _, v := range input {
		if _, exists := seen[v]; !exists {
			seen[v] = struct{}{}
			result = append(result, v)
		}
	}

	return result
}

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
