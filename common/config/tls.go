package config

import (
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"io/ioutil"
	"log"
	"net/url"
	"sync"

	"github.com/mholt/caddy/caddytls"
	"github.com/spf13/cobra"
)

var (
	DefaultCaUrl = "https://acme-v01.api.letsencrypt.org/directory"

	tlsClientOnce   = &sync.Once{}
	tlsClientConfig = make(map[string]*tls.Config)

	tlsServerOnce   = &sync.Once{}
	tlsServerConfig = make(map[string]*tls.Config)
)

func init() {
	cobra.OnInitialize(func() {
		// TODO - reactivate this
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
	})
}

// GetTLSServerConfig returns the configuration ssl for a server handler
func GetTLSServerConfig(t string) *tls.Config {
	tlsServerOnce.Do(func() {
		getTLSServerConfig("proxy")
		getTLSServerConfig("grpc")
		getTLSServerConfig("http")
	})

	return tlsServerConfig[t]
}

// GetTLSConfig returns the configuration ssl for a server handler
func GetTLSClientConfig(t string) *tls.Config {
	tlsClientOnce.Do(func() {
		getTLSClientConfig("proxy")
		getTLSClientConfig("grpc")
		getTLSClientConfig("http")
	})

	return tlsClientConfig[t]
}

func getTLSServerConfig(t string) {
	ssl := Get("cert", t, "ssl").Bool(false)
	selfSigned := Get("cert", t, "self").Bool(false)
	certFile := Get("cert", t, "certFile").String("")
	keyFile := Get("cert", t, "keyFile").String("")
	caUrl := Get("cert", t, "caUrl").String("")

	if !ssl {
		return
	}

	if certFile != "" && keyFile != "" {
		// Directly provided in conf
		cert, err := tls.LoadX509KeyPair(certFile, keyFile)
		if err != nil {
			log.Fatal("Cannot load client key pair ", err)
		}

		tlsServerConfig[t] = &tls.Config{
			Certificates: []tls.Certificate{cert},
		}
	} else if selfSigned {
		// Self signed
		tlsServerConfig[t] = &tls.Config{
			InsecureSkipVerify: true,
		}
	} else if caUrl != "" {
		// Auto-cert (let's encrypt)
		u, _ := url.Parse(Get("defaults", "url").String(""))
		p, e := url.Parse(caUrl)
		if e != nil {
			fmt.Println("[TLS] Cannot parse caUrl")
			return
		}
		store, e := caddytls.NewFileStorage(p)
		if e != nil {
			fmt.Println("[TLS] Cannot load TLS File Storage")
			return
		}
		data, err := store.LoadSite(u.Hostname())
		if err != nil {
			fmt.Printf("[TLS] Cannot load site %s from TLS File Storage\n", u.Hostname())
			return
		}
		if cert, e := tls.X509KeyPair(data.Cert, data.Key); e == nil {
			fmt.Println("[TLS] Activating TLS from provided tls file storage")
			tlsServerConfig[t] = &tls.Config{Certificates: []tls.Certificate{cert}}
		} else {
			fmt.Println("[TLS] Cannot load certificates loaded from TLS File Storage")
		}
	}

}

func getTLSClientConfig(t string) {
	ssl := Get("cert", t, "ssl").Bool(false)
	selfSigned := Get("cert", t, "self").Bool(false)
	certFile := Get("cert", t, "certFile").String("")

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

	b, err := ioutil.ReadFile(certFile)
	if err != nil {
		log.Fatal("Cannot read cert file", err)
	}

	cp := x509.NewCertPool()
	if !cp.AppendCertsFromPEM(b) {
		log.Fatal("Cannot append cert to pool")
	}

	tlsClientConfig[t] = &tls.Config{
		RootCAs: cp,
	}
}
