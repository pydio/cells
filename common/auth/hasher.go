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

package auth

import (
	"bytes"
	"crypto/md5"
	"crypto/sha1"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"math/rand"
	"strconv"
	"strings"
	"time"

	"golang.org/x/crypto/pbkdf2"
)

type PydioPW struct {
	PBKDF2_HASH_ALGORITHM string
	PBKDF2_ITERATIONS     int
	PBKDF2_SALT_BYTE_SIZE int
	PBKDF2_HASH_BYTE_SIZE int
	HASH_SECTIONS         int
	HASH_ALGORITHM_INDEX  int
	HASH_ITERATION_INDEX  int
	HASH_SALT_INDEX       int
	HASH_PBKDF2_INDEX     int
}

func (p PydioPW) pbkdf2CreateHash(password []byte, salt []byte, iter, totalSize int, algo string) (hash []byte, err error) {
	switch strings.ToLower(algo) {
	case "sha256":
		key := pbkdf2.Key(password, salt, iter, totalSize, sha256.New)

		return key, nil
	case "sha1":
		key := pbkdf2.Key(password, salt, iter, totalSize, sha1.New)
		return key, nil
	}
	return nil, fmt.Errorf("Hash algorithm not supported")
}

func (p PydioPW) checkPasswordMD5(password string, storePassword string) bool {
	hasher := md5.New()
	hasher.Write([]byte(password))
	return strings.Compare(hex.EncodeToString(hasher.Sum(nil)), storePassword) == 0
}

func (p PydioPW) checkPasswordDBKDF2(password string, storePassword []byte, salt []byte, iter, totalSize int, algo string) (bool, error) {
	pwd, err := p.pbkdf2CreateHash([]byte(password), salt, iter, totalSize, algo)
	if err != nil {
		return false, err
	}
	if bytes.Equal(pwd, storePassword) {
		return true, nil
	}
	return false, fmt.Errorf("Password does not match")
}

func (p PydioPW) CheckDBKDF2PydioPwd(password string, hashedPw string, legacySalt ...bool) (bool, error) {
	arrPwd := strings.Split(hashedPw, ":")
	if len(arrPwd) < p.HASH_SECTIONS {
		// MD5 password
		return p.checkPasswordMD5(password, hashedPw), nil
	}
	if len(arrPwd) == p.HASH_SECTIONS {
		base64Salt := arrPwd[p.HASH_SALT_INDEX]
		var salt []byte
		if len(legacySalt) > 0 && legacySalt[0] {
			salt = []byte(base64Salt)
		} else {
			salt, _ = base64.StdEncoding.DecodeString(base64Salt)
		}
		iter, err := strconv.Atoi(arrPwd[p.HASH_ITERATION_INDEX])
		if err != nil {
			return false, err
		}

		algo := arrPwd[p.HASH_ALGORITHM_INDEX]
		base64Pw := arrPwd[p.HASH_PBKDF2_INDEX]
		storePw, err := base64.StdEncoding.DecodeString(base64Pw)
		if err != nil {
			return false, err
		}

		size := len(storePw)
		return p.checkPasswordDBKDF2(password, storePw, salt, iter, size, algo)
	}
	return false, fmt.Errorf("Password format invalid")
}

func (p PydioPW) CreateHash(password string) (base64Pw string) {
	salt := RandStringBytes(p.PBKDF2_SALT_BYTE_SIZE)
	hashedPw, _ := p.pbkdf2CreateHash([]byte(password), salt, p.PBKDF2_ITERATIONS, p.PBKDF2_HASH_BYTE_SIZE, p.PBKDF2_HASH_ALGORITHM)
	return strings.ToLower(p.PBKDF2_HASH_ALGORITHM) + ":" + strconv.Itoa(p.PBKDF2_ITERATIONS) + ":" + base64.StdEncoding.EncodeToString(salt) + ":" + base64.StdEncoding.EncodeToString(hashedPw)
}

// TODO
// Use stronger random []byte
const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

func RandStringBytes(n int) []byte {
	rand.Seed(time.Now().UTC().UnixNano())
	b := make([]byte, n)
	for i := range b {
		b[i] = letterBytes[rand.Intn(len(letterBytes))]
	}
	return b
}
