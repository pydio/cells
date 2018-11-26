package config

import (
	"crypto/tls"
	"crypto/x509"
	"io/ioutil"
	"log"
	"net/http"
	"sync"
)

var (
	DefaultCaUrl = "https://acme-v01.api.letsencrypt.org/directory"

	tlsClientOnce   = &sync.Once{}
	tlsClientConfig = make(map[string]*tls.Config)

	tlsServerOnce   = &sync.Once{}
	tlsServerConfig = make(map[string]*tls.Config)
)

func init() {
	tls := GetTLSClientConfig("proxy")

	// The default client is used by dex so no choice
	http.DefaultClient.Transport = &http.Transport{
		TLSClientConfig: tls,
	}
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

	if !ssl {
		return
	}

	if certFile == "" || keyFile == "" {
		if selfSigned {
			tlsServerConfig[t] = &tls.Config{
				InsecureSkipVerify: true,
			}
		}
		return
	}

	cert, err := tls.LoadX509KeyPair(certFile, keyFile)
	if err != nil {
		log.Fatal("Cannot load client key pair ", err)
	}

	tlsServerConfig[t] = &tls.Config{
		Certificates: []tls.Certificate{cert},
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
