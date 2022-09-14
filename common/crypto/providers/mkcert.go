/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package providers

import (
	"context"
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha1"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/asn1"
	"encoding/pem"
	"fmt"
	"math/big"
	"net"
	"net/mail"
	"net/url"
	"os"
	"os/user"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/caddyserver/certmagic"
	"github.com/pkg/errors"

	"github.com/pydio/cells/v4/common/log"
)

var (
	Logger log.ZapLogger
)

func printf(format string, args ...interface{}) {
	if Logger != nil {
		Logger.Info(fmt.Sprintf(format, args...))
	} else {
		fmt.Printf("\n"+format, args...)
	}
}

// MkCert provides tooling for generating auto-certified certificate
type MkCert struct {
	storage         certmagic.Storage
	userAndHostname string

	// Bytes representations of resources
	certB, keyB, caB, caKeyB []byte
	// Key used for get/setting bytes data
	certFile, keyFile, caFile, caKeyFile string

	caCert *x509.Certificate
	caKey  crypto.PrivateKey
}

// NewMkCert creates a new MkCert instance
func NewMkCert(storage certmagic.Storage) *MkCert {
	c := &MkCert{storage: storage}
	u, err := user.Current()
	if err == nil {
		c.userAndHostname = u.Username + "@"
	}
	if h, err := os.Hostname(); err == nil {
		c.userAndHostname += h
	}
	if err == nil && u.Name != "" && u.Name != u.Username {
		c.userAndHostname += " (" + u.Name + ")"
	}
	// Use mkcert compatible names
	c.caFile = "rootCA.pem"
	c.caKeyFile = "rootCA-key.pem"

	return c
}

// GeneratedResources returns all files generated during certificate creation
func (m *MkCert) GeneratedResources() (certFile, keyFile, caFile, caKeyFile string) {
	return m.certFile, m.keyFile, m.caFile, m.caKeyFile
}

// ReadCert returns all files generated during certificate creation
func (m *MkCert) ReadCert() (cert, key []byte, e error) {
	if cert, e = m.storage.Load(context.Background(), m.certFile); e != nil {
		return
	}
	if key, e = m.storage.Load(context.Background(), m.keyFile); e != nil {
		return
	}
	return
}

// MakeCert triggers the certificate generation process, using a list of known hosts
func (m *MkCert) MakeCert(hosts []string, prefix string) error {
	if err := m.loadCA(); err != nil {
		return err
	}
	priv, err := m.generateKey(false)
	if err != nil {
		return errors.Wrap(err, "failed to generate certificate key")
	}
	pub := priv.(crypto.Signer).Public()
	random, err := randomSerialNumber()
	if err != nil {
		return err
	}
	tpl := &x509.Certificate{
		SerialNumber: random,
		Subject: pkix.Name{
			Organization:       []string{"Pydio Cells certificate"},
			OrganizationalUnit: []string{m.userAndHostname},
		},

		NotAfter: time.Now().AddDate(10, 0, 0),

		// Fix the notBefore to temporarily bypass macOS Catalina's limit on
		// certificate lifespan. Once mkcert provides an ACME server, automation
		// will be the recommended way to guarantee uninterrupted functionality,
		// and the lifespan will be shortened to 825 days. See issue 174 and
		// https://support.apple.com/en-us/HT210176.
		NotBefore: time.Date(2019, time.June, 1, 0, 0, 0, 0, time.UTC),

		KeyUsage:              x509.KeyUsageKeyEncipherment | x509.KeyUsageDigitalSignature,
		BasicConstraintsValid: true,
	}

	for _, h := range hosts {
		if ip := net.ParseIP(h); ip != nil {
			tpl.IPAddresses = append(tpl.IPAddresses, ip)
		} else if email, err := mail.ParseAddress(h); err == nil && email.Address == h {
			tpl.EmailAddresses = append(tpl.EmailAddresses, h)
		} else if uriName, err := url.Parse(h); err == nil && uriName.Scheme != "" && uriName.Host != "" {
			tpl.URIs = append(tpl.URIs, uriName)
		} else {
			tpl.DNSNames = append(tpl.DNSNames, h)
		}
	}

	if len(tpl.IPAddresses) > 0 || len(tpl.DNSNames) > 0 {
		tpl.ExtKeyUsage = []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth}
	}
	if len(tpl.EmailAddresses) > 0 {
		tpl.ExtKeyUsage = append(tpl.ExtKeyUsage, x509.ExtKeyUsageCodeSigning, x509.ExtKeyUsageEmailProtection)
	}

	cert, err := x509.CreateCertificate(rand.Reader, tpl, m.caCert, pub, m.caKey)
	if err != nil {
		return errors.Wrap(err, "failed to generate certificate")
	}

	certFile, keyFile := m.fileNames(hosts, prefix)

	privDER, err := x509.MarshalPKCS8PrivateKey(priv)
	if err != nil {
		return errors.Wrap(err, "failed to encode certificate key")
	}
	err = m.storage.Store(context.Background(), keyFile, pem.EncodeToMemory(
		&pem.Block{Type: "PRIVATE KEY", Bytes: privDER}))
	if err != nil {
		return errors.Wrap(err, "failed to save certificate key")
	}

	err = m.storage.Store(context.Background(), certFile, pem.EncodeToMemory(
		&pem.Block{Type: "CERTIFICATE", Bytes: cert}))
	if err != nil {
		return errors.Wrap(err, "failed to save certificate")
	}

	m.printHosts(hosts)

	printf("✅ The certificate is at \"%s\" \n and the key at \"%s\"", certFile, keyFile)

	return nil
}

func (m *MkCert) printHosts(hosts []string) {
	secondLvlWildcardRegexp := regexp.MustCompile(`(?i)^\*\.[0-9a-z_-]+$`)
	printf("✅ Created a new certificate valid for the following names 📜")
	for _, h := range hosts {
		printf(" - %q", h)
		if secondLvlWildcardRegexp.MatchString(h) {
			printf("   Warning: many browsers don't support second-level wildcards like %q ⚠️", h)
		}
	}

	for _, h := range hosts {
		if strings.HasPrefix(h, "*.") {
			printf("\nReminder: X.509 wildcards only go one level deep, so this won't match a.b.%s ℹ️", h[2:])
			break
		}
	}
}

func (m *MkCert) generateKey(rootCA bool) (crypto.PrivateKey, error) {
	if rootCA {
		return rsa.GenerateKey(rand.Reader, 3072)
	}
	return rsa.GenerateKey(rand.Reader, 2048)
}

func (m *MkCert) fileNames(hosts []string, defaultName string) (certFile, keyFile string) {
	if defaultName == "" {
		defaultName = strings.Replace(hosts[0], ":", "_", -1)
		defaultName = strings.Replace(defaultName, "*", "_wildcard", -1)
		if len(hosts) > 1 {
			defaultName += "-" + strconv.Itoa(len(hosts)-1)
		}
	}
	certFile = defaultName + ".pem"
	m.certFile = certFile
	keyFile = defaultName + "-key.pem"
	m.keyFile = keyFile

	return
}

func randomSerialNumber() (*big.Int, error) {
	serialNumberLimit := new(big.Int).Lsh(big.NewInt(1), 128)
	serialNumber, err := rand.Int(rand.Reader, serialNumberLimit)
	if err != nil {
		return nil, errors.Wrap(err, "failed to generate random serial number")
	}
	return serialNumber, nil
}

// loadCA will load or create the CA at m.rootLocation.
func (m *MkCert) loadCA() error {
	if !m.storage.Exists(context.Background(), m.caFile) {
		if err := m.newCA(); err != nil {
			return err
		}
	} else {
		printf("✅ Using the local CA at \"%s\" ✨", m.caFile)
	}

	certPEMBlock, err := m.storage.Load(context.Background(), m.caFile)
	if err != nil {
		return errors.Wrap(err, "failed to read the CA certificate")
	}
	certDERBlock, _ := pem.Decode(certPEMBlock)
	if certDERBlock == nil || certDERBlock.Type != "CERTIFICATE" {
		return errors.New("ERROR: failed to read the CA certificate: unexpected content")
	}
	m.caCert, err = x509.ParseCertificate(certDERBlock.Bytes)
	if err != nil {
		return errors.Wrap(err, "failed to parse the CA certificate")
	}
	if !m.storage.Exists(context.Background(), m.caKeyFile) {
		return nil // keyless mode
	}

	keyPEMBlock, err := m.storage.Load(context.Background(), m.caKeyFile)
	if err != nil {
		return errors.Wrap(err, "failed to read the CA key")
	}
	keyDERBlock, _ := pem.Decode(keyPEMBlock)
	if keyDERBlock == nil || keyDERBlock.Type != "PRIVATE KEY" {
		return errors.New("ERROR: failed to read the CA key: unexpected content")
	}
	m.caKey, err = x509.ParsePKCS8PrivateKey(keyDERBlock.Bytes)
	if err != nil {
		return errors.Wrap(err, "failed to parse the CA key")
	}
	return nil
}

func (m *MkCert) newCA() error {
	priv, err := m.generateKey(true)
	if err != nil {
		return errors.Wrap(err, "failed to generate the CA key")
	}
	pub := priv.(crypto.Signer).Public()

	spkiASN1, err := x509.MarshalPKIXPublicKey(pub)
	if err != nil {
		return errors.Wrap(err, "failed to encode public key")
	}

	var spki struct {
		Algorithm        pkix.AlgorithmIdentifier
		SubjectPublicKey asn1.BitString
	}
	_, err = asn1.Unmarshal(spkiASN1, &spki)
	if err != nil {
		return errors.Wrap(err, "failed to decode public key")
	}

	skid := sha1.Sum(spki.SubjectPublicKey.Bytes)
	random, err := randomSerialNumber()
	if err != nil {
		return err
	}

	tpl := &x509.Certificate{
		SerialNumber: random,
		Subject: pkix.Name{
			Organization:       []string{"Pydio Cells CA"},
			OrganizationalUnit: []string{m.userAndHostname},

			// The CommonName is required by iOS to show the certificate in the
			// "Certificate Trust Settings" menu.
			// https://github.com/FiloSottile/mkcert/issues/47
			CommonName: "cells " + m.userAndHostname,
		},
		SubjectKeyId: skid[:],

		NotAfter:  time.Now().AddDate(10, 0, 0),
		NotBefore: time.Now(),

		KeyUsage: x509.KeyUsageCertSign,

		BasicConstraintsValid: true,
		IsCA:                  true,
		MaxPathLenZero:        true,
	}

	cert, err := x509.CreateCertificate(rand.Reader, tpl, tpl, pub, priv)
	if err != nil {
		return errors.Wrap(err, "failed to generate CA certificate")
	}

	privDER, err := x509.MarshalPKCS8PrivateKey(priv)
	if err != nil {
		return errors.Wrap(err, "failed to encode CA key")
	}

	err = m.storage.Store(context.Background(), m.caKeyFile, pem.EncodeToMemory(
		&pem.Block{Type: "PRIVATE KEY", Bytes: privDER}))
	if err != nil {
		return errors.Wrap(err, "failed to save CA key")
	}

	err = m.storage.Store(context.Background(), m.caFile, pem.EncodeToMemory(
		&pem.Block{Type: "CERTIFICATE", Bytes: cert}))
	if err != nil {
		return errors.Wrap(err, "failed to save CA")
	}

	printf("✅ Created a new local CA at \"%s\" 💥", m.caFile)
	return nil
}
