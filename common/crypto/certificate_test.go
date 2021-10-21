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
	"os"
	"path/filepath"
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"
)

func TestAll(t *testing.T) {

	var (
		CACert, serviceCert *x509.Certificate
		CAKey, serviceKey   *rsa.PrivateKey
		err                 error
		testFolder          string
	)

	testFolder = filepath.Join(os.TempDir(), "cells", "tests")
	os.MkdirAll(testFolder, os.ModePerm)

	caKeyFilename := filepath.Join(testFolder, "ca.key")
	serviceKeyFilename := filepath.Join(testFolder, "service.key")
	serviceCertFilename := filepath.Join(testFolder, "service.crt")

	defer os.Remove(caKeyFilename)
	defer os.Remove(caKeyFilename)
	defer os.Remove(serviceKeyFilename)

	Convey("Generate CA certificate", t, func() {
		CAKey, err = rsa.GenerateKey(rand.Reader, 1024)
		CACert, err = GenerateCACertificate(&Template{
			Expiry:           time.Minute,
			SignerPrivateKey: CAKey,
			PublicKey:        &CAKey.PublicKey,
			IPs:              localIPs(),
			Domains:          []string{"cert.example.com"},
		})
		So(err, ShouldBeNil)
		So(CACert, ShouldNotBeNil)
	})

	Convey("Generate Service certificate signed by CA", t, func() {
		serviceKey, err = rsa.GenerateKey(rand.Reader, 1024)
		serviceCert, err = GenerateServiceCertificate(&Template{
			Expiry:            time.Minute,
			IPs:               localIPs(),
			Domains:           []string{"cert.example.com"},
			PublicKey:         &serviceKey.PublicKey,
			SignerPrivateKey:  CAKey,
			SignerCertificate: CACert,
		})
		So(err, ShouldBeNil)
		So(serviceCert, ShouldNotBeNil)
	})

	Convey("Verify Service certificate", t, func() {
		roots := x509.NewCertPool()
		roots.AddCert(CACert)
		_, err = serviceCert.Verify(x509.VerifyOptions{
			Roots: roots,
		})
		So(err, ShouldBeNil)
	})

	Convey("Store CA private key with password", t, func() {
		password := []byte("secret")
		err = StorePrivateKey(CAKey, password, caKeyFilename)
		So(err, ShouldBeNil)
	})

	Convey("Load CA private key with password", t, func() {
		password := []byte("secret")
		_, err = LoadPrivateKey(password, caKeyFilename)
		So(err, ShouldBeNil)
	})

	Convey("Store service certificate", t, func() {
		err = StoreCertificate(serviceCert, serviceCertFilename, os.ModePerm)
		So(err, ShouldBeNil)
	})

	Convey("Load service certificate", t, func() {
		cert, err := LoadCertificate(serviceCertFilename)
		So(err, ShouldBeNil)
		So(cert, ShouldNotBeNil)
	})
}
