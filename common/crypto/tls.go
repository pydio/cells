package crypto

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"errors"
	"github.com/pydio/cells/v4/common/crypto/storage"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/configx"
	"net/url"
	"os"
)

const (
	KeyConfigServer = "server"
	KeyConfigCert   = "cert-uuid"
	KeyConfigKey    = "key-uuid"
	KeyConfigCA     = "ca-uuid"

	KeyServerName  = "tlsServerName"
	KeyCertUUID    = "tlsCertUUID"
	KeyCertKeyUUID = "tlsCertKeyUUID"
	KeyCertCAUUID  = "tlsCertCAUUID"
)

func TLSConfig(c configx.Values) (*tls.Config, error) {
	conf := &tls.Config{}

	certUUID := c.Val(KeyConfigCert).String()
	if certUUID == "" {
		return nil, nil
	}

	store, err := storage.OpenStore(context.Background(), runtime.CertsStoreURL())
	if err != nil {
		return nil, err
	}

	if serverName := c.Val(KeyConfigServer).String(); serverName != "" {
		conf.ServerName = serverName
	}

	var certs []tls.Certificate
	clientCertBlock, err := store.Load(certUUID)
	if err != nil {
		if err == os.ErrNotExist {
			return nil, errors.New("cert file not available")
		}
		return nil, err
	}

	keyUUID := c.Val(KeyConfigKey).String()
	var clientCertKeyBlock []byte
	if keyUUID != "" {
		block, err := store.Load(keyUUID)
		if err != nil {
			return nil, err
		}

		clientCertKeyBlock = block
	} else {
		block, err := store.Load(certUUID + "-key")
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

	caUUID := c.Val(KeyConfigCA).String()
	if caUUID != "" {
		caBlock, err := store.Load(caUUID)
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

	conf.MinVersion = tls.VersionTLS12

	return conf, nil
}

func TLSConfigFromURL(u *url.URL) (*tls.Config, error) {
	conf := &tls.Config{}

	q := u.Query()

	store, err := storage.OpenStore(context.Background(), runtime.CertsStoreURL())
	if err != nil {
		return nil, err
	}

	if !q.Has(KeyCertUUID) {
		return nil, nil
	}

	if q.Has(KeyServerName) {
		conf.ServerName = q.Get(KeyServerName)
	}

	var certs []tls.Certificate
	clientCertBlock, err := store.Load(q.Get(KeyCertUUID))
	if err != nil {
		return nil, err
	}

	var clientCertKeyBlock []byte
	if q.Has(KeyCertKeyUUID) {
		block, err := store.Load(q.Get(KeyCertKeyUUID))
		if err != nil {
			return nil, err
		}

		clientCertKeyBlock = block
	} else {
		block, err := store.Load(q.Get(KeyCertUUID) + "-key")
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
		caBlock, err := store.Load(q.Get(KeyCertCAUUID))
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

	q.Del(KeyCertUUID)
	q.Del(KeyCertKeyUUID)
	q.Del(KeyServerName)
	q.Del(KeyCertCAUUID)
	u.RawQuery = q.Encode()

	conf.MinVersion = tls.VersionTLS12

	return conf, nil
}
