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
	"crypto/tls"
	"fmt"

	"github.com/pydio/cells/v4/common/proto/install"
)

type CertProvider interface {
	LoadCertificates(config *install.ProxyConfig, storageURL string) (certFile string, certKey string, err error)
}

func LoadCertificates(config *install.ProxyConfig, storageURL string) (certFile string, certKey string, err error) {

	if !config.HasTLS() {
		return "", "", fmt.Errorf("no TLS config found")
	}

	if config.GetSelfSigned() != nil {
		return GetMkCertCache().LoadCertificates(config, storageURL)
	} else if config.GetCertificate() != nil {
		cert := config.GetCertificate()
		return cert.CertFile, cert.KeyFile, nil
	}

	return
}

func LoadTLSServerConfig(config *install.ProxyConfig, storageURL string) (*tls.Config, error) {
	if !config.HasTLS() {
		return nil, fmt.Errorf("no TLS config found")
	}
	c, k, e := LoadCertificates(config, storageURL)
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
