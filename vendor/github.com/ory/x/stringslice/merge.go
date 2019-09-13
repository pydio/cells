package stringslice

// Merge merges several string slices into one.
func Merge(parts ...[]string) []string {
	var result []string
	for _, part := range parts {
		result = append(result, part...)
	}

	return result
}
