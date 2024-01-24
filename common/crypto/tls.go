package crypto

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"errors"
	"github.com/pydio/cells/v4/common/crypto/storage"
	"github.com/pydio/cells/v4/common/runtime"
	"net/url"
)

const (
	KeyCertStoreName    = "tlsCertStoreName"
	KeyCertInsecureHost = "tlsCertInsecureHost"
	KeyCertUUID         = "tlsCertUUID"
	KeyCertKeyUUID      = "tlsCertKeyUUID"
	KeyCertCAUUID       = "tlsCertCAUUID"
)

func TLSConfigFromURL(u *url.URL) (*tls.Config, error) {
	conf := &tls.Config{}

	q := u.Query()

	ctx := context.Background()

	store, err := storage.OpenStore(ctx, runtime.CertsStoreURL())
	if err != nil {
		return nil, err
	}

	if certUUID := q.Get(KeyCertUUID); certUUID != "" {
		var certs []tls.Certificate
		clientCertBlock, err := store.Load(ctx, certUUID)
		if err != nil {
			return nil, err
		}

		var clientCertKeyBlock []byte
		if certKeyUUID := q.Get(KeyCertKeyUUID); certKeyUUID != "" {
			block, err := store.Load(ctx, certKeyUUID)
			if err != nil {
				return nil, err
			}

			clientCertKeyBlock = block
		} else {
			block, err := store.Load(ctx, certUUID+"-key")
			if err != nil {
				return nil, err
			}

			clientCertKeyBlock = block
		}

		cert, err := tls.X509KeyPair(clientCertBlock, clientCertKeyBlock)
		if err != nil {
			return nil, err
		}

		certs = append(certs, cert)

		if len(certs) > 0 {
			conf.Certificates = certs
		}
	}

	if certStoreName := q.Get(KeyCertStoreName); certStoreName != "" {
		conf.ServerName = certStoreName
	}

	if q.Has(KeyCertInsecureHost) {
		conf.InsecureSkipVerify = true
	}

	if certCAUUID := q.Get(KeyCertCAUUID); certCAUUID != "" {
		caBlock, err := store.Load(ctx, certCAUUID)
		if err != nil {
			return nil, err
		}

		caCertPool := x509.NewCertPool()
		successful := caCertPool.AppendCertsFromPEM(caBlock)
		if !successful {
			return nil, errors.New("failed to parse ca certificate as PEM encoded content")
		}

		conf.RootCAs = caCertPool
	}

	return conf, nil
}
