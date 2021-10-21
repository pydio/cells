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

package providers

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha1"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/asn1"
	"encoding/pem"
	"fmt"
	"io/ioutil"
	"math/big"
	"net"
	"net/mail"
	"net/url"
	"os"
	"os/user"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/pkg/errors"
)

// MkCert provides tooling for generating auto-certified certificate
type MkCert struct {
	rootLocation    string
	userAndHostname string

	certFile, keyFile, caFile, caKeyFile string

	caCert *x509.Certificate
	caKey  crypto.PrivateKey

	filenamePrefix string
}

// NewMkCert creates a new MkCert instance
func NewMkCert(storageLocation string) *MkCert {
	c := &MkCert{rootLocation: storageLocation}
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
	c.caFile = filepath.Join(c.rootLocation, "rootCA.pem")
	c.caKeyFile = filepath.Join(c.rootLocation, "rootCA-key.pem")

	return c
}

// GeneratedResources returns all files generated during certificate creation
func (m *MkCert) GeneratedResources() (certFile, keyFile, caFile, caKeyFile string) {
	return m.certFile, m.keyFile, m.caFile, m.caKeyFile
}

// MakeCerts triggers the certificate generation process, using a list of known hosts
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
	err = ioutil.WriteFile(keyFile, pem.EncodeToMemory(
		&pem.Block{Type: "PRIVATE KEY", Bytes: privDER}), 0600)
	if err != nil {
		return errors.Wrap(err, "failed to save certificate key")
	}

	err = ioutil.WriteFile(certFile, pem.EncodeToMemory(
		&pem.Block{Type: "CERTIFICATE", Bytes: cert}), 0644)
	if err != nil {
		return errors.Wrap(err, "failed to save certificate")
	}

	m.printHosts(hosts)

	fmt.Printf("\n✅ The certificate is at \"%s\" \n and the key at \"%s\"", certFile, keyFile)

	return nil
}

func (m *MkCert) printHosts(hosts []string) {
	secondLvlWildcardRegexp := regexp.MustCompile(`(?i)^\*\.[0-9a-z_-]+$`)
	fmt.Printf("\n✅ Created a new certificate valid for the following names 📜")
	for _, h := range hosts {
		fmt.Printf(" - %q", h)
		if secondLvlWildcardRegexp.MatchString(h) {
			fmt.Printf("   Warning: many browsers don't support second-level wildcards like %q ⚠️", h)
		}
	}

	for _, h := range hosts {
		if strings.HasPrefix(h, "*.") {
			fmt.Printf("\nReminder: X.509 wildcards only go one level deep, so this won't match a.b.%s ℹ️", h[2:])
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
	certFile = filepath.Join(m.rootLocation, defaultName+".pem")
	m.certFile = certFile
	keyFile = filepath.Join(m.rootLocation, defaultName+"-key.pem")
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
	if _, e := os.Stat(m.caFile); e != nil {
		if err := m.newCA(); err != nil {
			return err
		}
	} else {
		fmt.Printf("\n✅ Using the local CA at \"%s\" ✨", m.caFile)
	}

	certPEMBlock, err := ioutil.ReadFile(m.caFile)
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
	if _, e := os.Stat(m.caKeyFile); e != nil {
		return nil // keyless mode
	}

	keyPEMBlock, err := ioutil.ReadFile(m.caKeyFile)
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
		IsCA:           true,
		MaxPathLenZero: true,
	}

	cert, err := x509.CreateCertificate(rand.Reader, tpl, tpl, pub, priv)
	if err != nil {
		return errors.Wrap(err, "failed to generate CA certificate")
	}

	privDER, err := x509.MarshalPKCS8PrivateKey(priv)
	if err != nil {
		return errors.Wrap(err, "failed to encode CA key")
	}

	err = ioutil.WriteFile(m.caKeyFile, pem.EncodeToMemory(
		&pem.Block{Type: "PRIVATE KEY", Bytes: privDER}), 0400)
	if err != nil {
		return errors.Wrap(err, "failed to save CA key")
	}

	err = ioutil.WriteFile(m.caFile, pem.EncodeToMemory(
		&pem.Block{Type: "CERTIFICATE", Bytes: cert}), 0644)
	if err != nil {
		return errors.Wrap(err, "failed to save CA")
	}

	fmt.Printf("\n✅ Created a new local CA at \"%s\" 💥", m.caFile)
	return nil
}
