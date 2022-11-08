package std

// CloneMap returns a copy of m.  This is a shallow clone:
// the new keys and values are set using ordinary assignment.
func CloneMap[M ~map[K]V, K comparable, V any](m M) M {
	// Preserve nil, it matters!
	if m == nil {
		return nil
	}
	r := make(M, len(m))
	for k, v := range m {
		r[k] = v
	}
	return r
}
