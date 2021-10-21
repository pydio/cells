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
	"crypto"
	"crypto/ecdsa"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha1"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/asn1"
	"encoding/pem"
	"errors"
	"io/ioutil"
	"math/big"
	"net"
	"os"
	"strings"
	"time"
)

// Template specs for generating a certificate.
type Template struct {
	Name              string
	Domains           []string
	IPs               []net.IP
	Expiry            time.Duration
	PublicKey         crypto.PublicKey
	SignerPrivateKey  crypto.PrivateKey
	SignerCertificate *x509.Certificate
}

func localIPs() []net.IP {
	ips := []net.IP{}
	ifaces, err := net.InterfaceAddrs()
	if err == nil {
		for i := range ifaces {
			addr := ifaces[i]
			ips = append(ips, net.ParseIP(strings.Split(addr.String(), "/")[0]))
		}
	}
	return ips
}

func serialNumber() *big.Int {
	serialNumberLimit := new(big.Int).Lsh(big.NewInt(1), 128)
	serial, _ := rand.Int(rand.Reader, serialNumberLimit)
	return serial
}

func caKeyUsage() x509.KeyUsage {
	return x509.KeyUsageCertSign | x509.KeyUsageCRLSign
}

func caExtKeyUsage() []x509.ExtKeyUsage {
	return []x509.ExtKeyUsage{x509.ExtKeyUsageAny}
}

func serviceExtKeyUsage() []x509.ExtKeyUsage {
	return []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth, x509.ExtKeyUsageClientAuth}
}

func serviceKeyUsage() x509.KeyUsage {
	return x509.KeyUsageKeyEncipherment | x509.KeyUsageDataEncipherment
}

// GenerateCACertificate generates a certificate for a CA.
func GenerateCACertificate(t *Template) (*x509.Certificate, error) {

	notBefore := time.Now()
	notAfter := notBefore.Add(t.Expiry)
	template := &x509.Certificate{
		Subject: pkix.Name{
			Organization: []string{"Pydio"},
			CommonName:   t.Name,
		},
		SerialNumber:                serialNumber(),
		IsCA:                        true,
		PublicKey:                   t.PublicKey,
		NotBefore:                   notBefore,
		NotAfter:                    notAfter,
		IPAddresses:                 t.IPs,
		DNSNames:                    t.Domains,
		KeyUsage:                    caKeyUsage(),
		ExtKeyUsage:                 caExtKeyUsage(),
		BasicConstraintsValid:       true,
		MaxPathLenZero:              true,
		PermittedDNSDomainsCritical: false,
		PermittedDNSDomains:         nil,
	}

	pubBytes, err := asn1.Marshal(rsa.PublicKey{
		N: (t.PublicKey.(*rsa.PublicKey)).N,
		E: (t.PublicKey.(*rsa.PublicKey)).E,
	})
	if err == nil {
		hash := sha1.Sum(pubBytes)
		template.SubjectKeyId = hash[:]
	}

	certBytes, err := x509.CreateCertificate(rand.Reader, template, template, t.PublicKey, t.SignerPrivateKey)
	if err != nil {
		return nil, errors.New("could not create CA certificate: " + err.Error())
	}
	return x509.ParseCertificate(certBytes)
}

// GenerateServiceCertificate generates a certificate for a service.
func GenerateServiceCertificate(t *Template) (*x509.Certificate, error) {

	notBefore := time.Now()
	notAfter := notBefore.Add(t.Expiry)
	template := &x509.Certificate{
		Subject: pkix.Name{
			Organization: []string{"Pydio"},
			CommonName:   t.Name,
		},
		AuthorityKeyId: t.SignerCertificate.SubjectKeyId,
		SerialNumber:   serialNumber(),
		IsCA:           false,
		PublicKey:      t.PublicKey,
		IPAddresses:    t.IPs,
		DNSNames:       t.Domains,
		KeyUsage:       serviceKeyUsage(),
		ExtKeyUsage:    serviceExtKeyUsage(),
		NotBefore:      notBefore,
		NotAfter:       notAfter,
	}

	if pub, ok := t.PublicKey.(*rsa.PublicKey); ok {
		pubBytes, err := asn1.Marshal(rsa.PublicKey{
			N: pub.N,
			E: pub.E,
		})
		if err == nil {
			hash := sha1.Sum(pubBytes)
			template.SubjectKeyId = hash[:]
		}
	}

	bytes, err := x509.CreateCertificate(rand.Reader, template, t.SignerCertificate, t.PublicKey, t.SignerPrivateKey)
	if err != nil {
		return nil, err
	}
	return x509.ParseCertificate(bytes)
}

// LoadPrivateKey loads the encrypted private key from the passed file and decrypts it.
func LoadPrivateKey(password []byte, file string) (crypto.PrivateKey, error) {
	keyBytes, err := ioutil.ReadFile(file)
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(keyBytes)
	if block == nil {
		return nil, errors.New("could not decode the private key: " + err.Error())
	}

	if block.Type != "RSA PRIVATE KEY" && block.Type != "ECDSA PRIVATE KEY" {
		return nil, errors.New("unsupported key type: " + block.Type)
	}

	keyBytes, err = x509.DecryptPEMBlock(block, password)
	if err != nil {
		return nil, errors.New("could decrypt CA key: " + err.Error())
	}

	if block.Type == "RSA PRIVATE KEY" {
		return x509.ParsePKCS1PrivateKey(keyBytes)
	}

	return x509.ParseECPrivateKey(keyBytes)
}

// StorePrivateKey encrypts the private key and stores it in the returned file.
func StorePrivateKey(key crypto.PrivateKey, password []byte, file string) error {
	var block *pem.Block
	var err error

	if rp, ok := key.(*rsa.PrivateKey); ok {
		block = &pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(rp)}

	} else if ep, ok := key.(*ecdsa.PrivateKey); ok {
		bytes, err := x509.MarshalECPrivateKey(ep)
		if err != nil {
			return err
		}
		block = &pem.Block{Type: "ECDSA PRIVATE KEY", Bytes: bytes}

	} else {
		return errors.New("unsupported key type")
	}

	block, err = x509.EncryptPEMBlock(rand.Reader, block.Type, block.Bytes, password, x509.PEMCipherAES256)
	if err != nil {
		return err
	}
	return ioutil.WriteFile(file, pem.EncodeToMemory(block), 0600)
}

// LoadCertificate loads file contenant and decodes it into a x509.Certificate.
func LoadCertificate(file string) (*x509.Certificate, error) {
	certBytes, err := ioutil.ReadFile(file)
	if err != nil {
		return nil, err
	}
	return x509.ParseCertificate(certBytes)
}

// StoreCertificate encodes certificate and stores the result in file.
func StoreCertificate(cert *x509.Certificate, file string, perm os.FileMode) error {
	return ioutil.WriteFile(file, cert.Raw, perm)
}
