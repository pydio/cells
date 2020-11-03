package providers

import (
	"crypto/tls"
	"fmt"

	"github.com/pydio/cells/common/proto/install"
)

type CertProvider interface {
	LoadCertificates(config *install.ProxyConfig) (certFile string, certKey string, err error)
}

func LoadCertificates(config *install.ProxyConfig) (certFile string, certKey string, err error) {

	if !config.HasTLS() {
		return "", "", fmt.Errorf("no TLS config found")
	}

	if config.GetSelfSigned() != nil {
		return GetMkCertCache().LoadCertificates(config)
	} else if config.GetCertificate() != nil {
		cert := config.GetCertificate()
		return cert.CertFile, cert.KeyFile, nil
	}

	return
}

func LoadTLSServerConfig(config *install.ProxyConfig) (*tls.Config, error) {
	if !config.HasTLS() {
		return nil, fmt.Errorf("no TLS config found")
	}
	c, k, e := LoadCertificates(config)
	if e != nil {
		return nil, e
	}
	// Directly provided in conf
	cert, err := tls.LoadX509KeyPair(c, k)
	if err != nil {
		return nil, err
	}
	return &tls.Config{
		Certificates: []tls.Certificate{cert},
	}, nil
}
