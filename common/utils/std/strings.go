package std

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
