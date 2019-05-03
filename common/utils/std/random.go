// Package std provides tools for standard types (strings, int, floats, etc).
package std

import (
	"math/rand"
	"sync"
	"time"
)

const letterBytes = "abcdefghijklmnpqrstuvwxyz123456789ABCDEFGHIJKLMNPQRSTUVWXYZ"
const (
	letterIdxBits = 6                    // 6 bits to represent a letter index
	letterIdxMask = 1<<letterIdxBits - 1 // All 1-bits, as many as letterIdxBits
	letterIdxMax  = 63 / letterIdxBits   // # of letter indices fitting in 63 bits
)

var (
	src       = rand.NewSource(time.Now().UnixNano())
	randMutex = &sync.Mutex{}
)

// Random [m,n]
func getRandomSource() rand.Source {
	randMutex.Lock()
	defer randMutex.Unlock()

	return src
}

// Randkey produces a random string with a given length
func Randkey(n int) string {
	b := make([]byte, n)
	// A src.Int63() generates 63 random bits, enough for letterIdxMax characters!
	for i, cache, remain := n-1, getRandomSource().Int63(), letterIdxMax; i >= 0; {
		if remain == 0 {
			cache, remain = getRandomSource().Int63(), letterIdxMax
		}
		if idx := int(cache & letterIdxMask); idx < len(letterBytes) {
			b[i] = letterBytes[idx]
			i--
		}
		cache >>= letterIdxBits
		remain--
	}

	return string(b)
}
