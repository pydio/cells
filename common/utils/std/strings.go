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
