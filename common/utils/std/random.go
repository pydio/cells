/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

// Package std provides tools for standard types (strings, int, floats, etc).
package std

import (
	crand "crypto/rand"
	"math/big"
	"math/rand"
	"sync"
	"time"
)

const letterBytes = "abcdefghijklmnpqrstuvwxyz0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ"

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

// CryptoRandKey generates a cryptographically secure random string of length n.
// It uses base64 encoding to represent the random bytes.
func CryptoRandKey(n int) (string, error) {
	b := make([]byte, n)
	for i := 0; i < n; i++ {
		idx, err := crand.Int(crand.Reader, big.NewInt(int64(len(letterBytes))))
		if err != nil {
			return "", err
		}
		b[i] = letterBytes[idx.Int64()]
	}
	return string(b), nil
}
