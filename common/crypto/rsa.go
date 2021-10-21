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

package crypto

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/asn1"
	"encoding/pem"
	"io/ioutil"
	"os"
	"strings"
)

// CreateRsaKey generates a new private key.
func CreateRsaKey() (*rsa.PrivateKey, error) {
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return nil, err
	}
	return privateKey, nil
}

// PublicKeyFromRsaKey extracts the public key.
func PublicKeyFromRsaKey(privateKey *rsa.PrivateKey) rsa.PublicKey {
	publicKey := privateKey.PublicKey
	return publicKey
}

// RsaKeyToPEM encodes the private key in PEM format.
func RsaKeyToPEM(key *rsa.PrivateKey, filename ...string) (string, error) {

	var privateKey = &pem.Block{
		Type:  "PRIVATE KEY",
		Bytes: x509.MarshalPKCS1PrivateKey(key),
	}

	if len(filename) > 0 {

		outFile, err := os.Create(filename[0])
		if err != nil {
			return "", err
		}
		defer outFile.Close()
		if err := pem.Encode(outFile, privateKey); err != nil {
			return "", err
		}
		return "written to " + filename[0], nil

	} else {

		builder := &strings.Builder{}
		if err := pem.Encode(builder, privateKey); err != nil {
			return "", err
		}
		return builder.String(), nil
	}

}

// RsaKeyFromPEM parses a PEM string.
func RsaKeyFromPEM(pemString string) (*rsa.PrivateKey, error) {
	block, _ := pem.Decode([]byte(pemString))
	if privateKey, er := x509.ParsePKCS1PrivateKey(block.Bytes); er != nil {
		return nil, er
	} else {
		return privateKey, nil
	}
}

// RsaKeyFromPEMFile loads a PEM file and parses the private key.
func RsaKeyFromPEMFile(filename string) (*rsa.PrivateKey, error) {
	var data []byte
	var e error
	if data, e = ioutil.ReadFile(filename); e != nil {
		return nil, e
	}
	block, _ := pem.Decode(data)
	if privateKey, er := x509.ParsePKCS1PrivateKey(block.Bytes); er != nil {
		return nil, er
	} else {
		return privateKey, nil
	}
}

// RsaPublicKeyToPEM encodes the public key to PEM format.
func RsaPublicKeyToPEM(pubKey rsa.PublicKey, filename ...string) (string, error) {

	asn1Bytes, err := asn1.Marshal(pubKey)
	if err != nil {
		return "", err
	}

	var pemkey = &pem.Block{
		Type:  "PUBLIC KEY",
		Bytes: asn1Bytes,
	}

	if len(filename) > 0 {

		outFile, err := os.Create(filename[0])
		if err != nil {
			return "", err
		}
		defer outFile.Close()
		if err := pem.Encode(outFile, pemkey); err != nil {
			return "", err
		}
		return "written to " + filename[0], nil

	} else {

		builder := &strings.Builder{}
		if err = pem.Encode(builder, pemkey); err != nil {
			return "", err
		}
		return builder.String(), nil
	}
}
