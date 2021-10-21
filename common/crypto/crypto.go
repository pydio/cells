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

// Package crypto provides tools for data encryption and certificates management
package crypto

import (
	"bytes"
	"crypto"
	"crypto/aes"
	"crypto/cipher"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/md5"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"io"
	"math/big"
	"strings"

	"golang.org/x/crypto/pbkdf2"
)

var SALT = []byte{224, 32, 00, 33, 78, 3, 25, 56, 54, 5, 54, 9, 79, 76, 189, 8}

var keyPairAlgs = map[string]elliptic.Curve{
	"p224": elliptic.P224(),
	"p256": elliptic.P256(),
	"p384": elliptic.P384(),
	"p521": elliptic.P521(),
	"":     elliptic.P521(),
}

func RandomBytes(size int) ([]byte, error) {
	key := make([]byte, size)
	_, err := rand.Read(key)
	return key, err
}

func KeyFromPassword(password []byte, l int) []byte {
	if len(password) < l {
		password, _ = pkcs7Pad(password, l)
	}
	return pbkdf2.Key(password, SALT, 50000, l, sha256.New)
}

func Seal(key []byte, data []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	nonce := make([]byte, 12)
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	cipherData := aesgcm.Seal(nil, nonce, data, nil)
	return append(nonce, cipherData...), nil
}

func SealWithNonce(key []byte, nonce []byte, data []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	return aesgcm.Seal(nil, nonce, data, nil), nil
}

func Open(key []byte, nonce []byte, cipherData []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	return aesgcm.Open(nil, nonce, cipherData, nil)
}

func NewEcdsaPrivateKey(alg string) (*ecdsa.PrivateKey, error) {
	curve, ok := keyPairAlgs[alg]
	if !ok {
		curve = elliptic.P521()
	}
	return ecdsa.GenerateKey(curve, rand.Reader)
}

func EncodePrivate(password []byte, key crypto.PrivateKey) ([]byte, error) {
	var (
		bytes []byte
		err   error
	)

	switch k := key.(type) {
	case *rsa.PrivateKey:
		bytes = x509.MarshalPKCS1PrivateKey(k)

	case *ecdsa.PrivateKey:
		bytes, err = x509.MarshalECPrivateKey(k)

	default:
		return nil, nil
	}

	if err != nil {
		return nil, err
	}
	pk := KeyFromPassword(password, 32)
	return Seal(pk, bytes)
}

func ParsePrivate(password []byte, bytes []byte) (crypto.PrivateKey, error) {
	var err error
	bytes, err = Open(password, bytes[:12], bytes[12:])
	if err != nil {
		return nil, err
	}
	return x509.ParsePKCS8PrivateKey(bytes)
}

func GetSignature(key *ecdsa.PrivateKey, data []byte) (string, error) {
	h := sha256.New()
	if _, err := h.Write(data); err != nil {
		return "", err
	}
	hashed := h.Sum(nil)

	r, s, err := ecdsa.Sign(rand.Reader, key, hashed)
	if err != nil {
		return "", err
	}
	enc := base64.StdEncoding
	return enc.EncodeToString(r.Bytes()) + ":" + enc.EncodeToString(s.Bytes()), nil
}

func VerifySignature(data []byte, key *ecdsa.PublicKey, signature string) bool {
	h := sha256.New()
	if _, err := h.Write(data); err != nil {
		return false
	}

	parts := strings.Split(signature, ":")
	if len(parts) != 2 {
		return false
	}

	enc := base64.StdEncoding
	r := &big.Int{}
	rb, err := enc.DecodeString(parts[0])
	if err != nil {
		return false
	}
	r.SetBytes(rb)

	s := &big.Int{}
	sb, err := enc.DecodeString(parts[1])
	if err != nil {
		return false
	}
	s.SetBytes(sb)

	hashed := h.Sum(nil)
	return ecdsa.Verify(key, hashed, r, s)
}

func pkcs7Pad(data []byte, blocklen int) ([]byte, error) {
	padlen := 1
	for ((len(data) + padlen) % blocklen) != 0 {
		padlen = padlen + 1
	}

	pad := bytes.Repeat([]byte{byte(padlen)}, padlen)
	return append(data, pad...), nil
}

func Md5(data []byte) []byte {
	h := md5.New()
	h.Write(data)
	return h.Sum(nil)
}
