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
	KeyCertStoreName = "tlsCertStoreName"
	KeyCertUUID      = "tlsCertUUID"
	KeyCertKeyUUID   = "tlsCertKeyUUID"
	KeyCertCAUUID    = "tlsCertCAUUID"
)

func TLSConfigFromURL(u *url.URL) (*tls.Config, error) {
	conf := &tls.Config{}

	q := u.Query()

	ctx := context.Background()

	store, err := storage.OpenStore(ctx, runtime.CertsStoreURL())
	if err != nil {
		return nil, err
	}

	if !q.Has(KeyCertUUID) {
		return nil, nil
	}

	if q.Has(KeyCertStoreName) {
		conf.ServerName = q.Get(KeyCertStoreName)
	}

	var certs []tls.Certificate
	clientCertBlock, err := store.Load(ctx, q.Get(KeyCertUUID)+".pem")
	if err != nil {
		return nil, err
	}

	var clientCertKeyBlock []byte
	if q.Has(KeyCertKeyUUID) {
		block, err := store.Load(ctx, q.Get(KeyCertKeyUUID)+".pem")
		if err != nil {
			return nil, err
		}

		clientCertKeyBlock = block
	} else {
		block, err := store.Load(ctx, q.Get(KeyCertUUID)+"-key.pem")
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

	if q.Has(KeyCertCAUUID) {
		caBlock, err := store.Load(ctx, q.Get(KeyCertCAUUID)+".pem")
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
