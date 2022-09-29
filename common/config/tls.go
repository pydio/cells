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

package config

import (
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"os"
	"sync"

	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	tlsClientMutex  = &sync.Mutex{}
	tlsClientConfig = make(map[string]*tls.Config)

	tlsServerMutex  = &sync.Mutex{}
	tlsServerConfig = make(map[string]*tls.Config)
)

// TODO - reactivate this
// func init() {

// cobra.OnInitialize(func() {

// We deactivated that because we had a round circle situation for remote sources
// (you need remote source to retrieve the config and you need the cert config to call the remote source)
// Solution would be to retrieve the cert config directly in the env

// tls := GetTLSClientConfig("grpc")
// if tls != nil {
// 	defaults.InitClient(func() client.Option { return grpcclient.AuthTLS(tls) })
// }
//
// tls = GetTLSServerConfig("grpc")
// if tls != nil {
// 	defaults.InitServer(func() server.Option { return grpcserver.AuthTLS(tls) })
// }
//
// tls = GetTLSServerConfig("http")
// if tls != nil {
// 	t := httptransport.NewTransport(transport.TLSConfig(tls), transport.Secure(true))
// 	defaults.InitHTTPServer(func() server.Option { return server.Transport(t) })
// }
//})
// }

func ResetTlsConfigs() {
	tlsServerMutex.Lock()
	tlsClientMutex.Lock()
	defer tlsServerMutex.Unlock()
	defer tlsClientMutex.Unlock()
	for _, t := range []string{"http", "proxy", "grpc"} {
		delete(tlsClientConfig, t)
		delete(tlsServerConfig, t)
	}
}

// GetTLSServerConfig returns the configuration ssl for a server handler
func GetTLSServerConfig(t string) *tls.Config {
	tlsServerMutex.Lock()
	defer tlsServerMutex.Unlock()
	if _, ok := tlsServerConfig[t]; !ok {
		getTLSServerConfig(t)
	}
	return tlsServerConfig[t]
}

// GetTLSClientConfig returns the configuration ssl for a server handler.
func GetTLSClientConfig(t string) *tls.Config {

	tlsClientMutex.Lock()
	defer tlsClientMutex.Unlock()
	if _, ok := tlsClientConfig[t]; !ok {
		getTLSClientConfig(t)
	}
	return tlsClientConfig[t]

}

func getTLSServerConfig(t string) {
	ssl := Get(configx.FormatPath("cert", t, "ssl")).Default(false).Bool()
	selfSigned := Get(configx.FormatPath("cert", t, "self")).Default(false).Bool()
	certFile := Get(configx.FormatPath("cert", t, "certFile")).String()
	keyFile := Get(configx.FormatPath("cert", t, "keyFile")).String()
	caUrl := Get(configx.FormatPath("cert", t, "caUrl")).String()

	if !ssl {
		return
	}

	if certFile != "" && keyFile != "" {
		// Directly provided in conf
		cert, err := tls.LoadX509KeyPair(certFile, keyFile)
		if err != nil {
			//log.Fatal("Cannot load client key pair ", err)
			fmt.Println("[ERROR] Cannot load client key pair ", err)
			return
		}

		tlsServerConfig[t] = &tls.Config{
			Certificates: []tls.Certificate{cert},
		}
	} else if selfSigned {
		// Self signed
		// TODO
		// THIS is incorrect (this is a client Config, not a server config with self_signed certificates)
		// We are not able to retrieve Caddy-generated self-signed certificate
		// Shall we generate our own self-signed for gRPC ?
		tlsServerConfig[t] = &tls.Config{
			InsecureSkipVerify: true,
		}
	} else if caUrl != "" {
		// TODO - FILE STORAGE NOT IMPLEMENTED
		// Auto-cert (let's encrypt)
		// u, _ := url.Parse(Get(configx.FormatPath("defaults", "url")).String())
		// p, e := url.Parse(caUrl)
		// if e != nil {
		// 	fmt.Println("[TLS] Cannot parse caUrl")
		// 	return
		// }
		// store, e := caddytls.NewFileStorage(p)
		// if e != nil {
		// 	fmt.Println("[TLS] Cannot load TLS File Storage")
		//	return
		//}
		//data, err := store.LoadSite(u.Hostname())
		//if err != nil {
		//	fmt.Printf("[TLS] Cannot load site %s from TLS File Storage\n", u.Hostname())
		//	return
		//}
		//if cert, e := tls.X509KeyPair(data.Cert, data.Key); e == nil {
		//	tlsServerConfig[t] = &tls.Config{Certificates: []tls.Certificate{cert}}
		//} else {
		//	fmt.Println("[TLS] Cannot load certificates loaded from TLS File Storage")
		//}
	}

}

func getTLSClientConfig(t string) {
	ssl := Get(configx.FormatPath("cert", t, "ssl")).Default(false).Bool()
	selfSigned := Get(configx.FormatPath("cert", t, "self")).Default(false).Bool()
	certFile := Get(configx.FormatPath("cert", t, "certFile")).String()

	if !ssl {
		return
	}

	if certFile == "" {
		if selfSigned {
			tlsClientConfig[t] = &tls.Config{
				InsecureSkipVerify: true,
			}
		}

		return
	}

	var cp *x509.CertPool
	var err error
	if cp, err = x509.SystemCertPool(); err != nil {
		cp = x509.NewCertPool()
	}
	if b, err := os.ReadFile(certFile); err == nil {
		// If no specific CAs, try to load them from within the certFile
		cp.AppendCertsFromPEM(b)
	}

	tlsClientConfig[t] = &tls.Config{
		RootCAs: cp,
	}
}
