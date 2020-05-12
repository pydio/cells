package providers

import (
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
