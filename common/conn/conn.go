package conn

import (
	"bytes"
	"context"
	"github.com/pydio/cells/v4/common/crypto"
	"github.com/pydio/cells/v4/common/crypto/storage"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/configx"
	"io/ioutil"
	"net/url"
	"path"
)

// Provider of connection
type Provider func(context.Context, configx.Values) (Conn, error)

// Conn is a connection interface
type Conn interface {
	Addr() string
	Ping() error
	Stats() map[string]interface{}
	Close() error
	As(i interface{}) bool
}

var (
	providers = make(map[string]Provider)
)

func RegisterConnProvider(name string, p Provider) {
	providers[name] = p
}

func GetConnProvider(name string) (Provider, bool) {
	p, ok := providers[name]
	return p, ok
}

func addUser(c configx.Values) (string, error) {
	var buf bytes.Buffer

	user := c.Val("user").String()
	password := c.Val("password").String()

	if user == "" {
		return "", nil
	}

	buf.WriteString(user)

	if password != "" {
		buf.WriteString(":")
		buf.WriteString(password)
	}

	return buf.String(), nil
}

func addTLS(c configx.Values) (string, error) {

	store, err := storage.OpenStore(context.Background(), runtime.CertsStoreURL())
	if err != nil {
		return "", err
	}

	q := url.Values{}

	serverName := c.Val("server").String()
	if serverName != "" {
		q.Add(crypto.KeyServerName, serverName)
	}

	certFile := c.Val("cert-file").String()
	if certFile != "" {
		v, err := ioutil.ReadFile(certFile)
		if err != nil {
			return "", err
		}

		fName := path.Base(certFile)
		uuid := fName[:len(fName)-len(path.Ext(fName))]
		if err := store.Store(uuid, v); err != nil {
			return "", err
		}

		q.Add(crypto.KeyCertUUID, uuid)
	}

	keyFile := c.Val("key-file").String()
	if keyFile != "" {
		v, err := ioutil.ReadFile(keyFile)
		if err != nil {
			return "", err
		}

		fName := path.Base(keyFile)
		uuid := fName[:len(fName)-len(path.Ext(fName))]
		if err := store.Store(uuid, v); err != nil {
			return "", err
		}

		q.Add(crypto.KeyCertKeyUUID, uuid)
	}

	caFile := c.Val("ca-file").String()
	if caFile != "" {
		v, err := ioutil.ReadFile(caFile)
		if err != nil {
			return "", err
		}

		fName := path.Base(caFile)
		uuid := fName[:len(fName)-len(path.Ext(fName))]
		if err := store.Store(uuid, v); err != nil {
			return "", err
		}

		q.Add(crypto.KeyCertCAUUID, uuid)
	}

	//if serverName == "" {
	//	insecure, err := (&p.Prompt{
	//		Label:     "Insecure skip verify",
	//		IsConfirm: true,
	//		Default:   "n",
	//	}).Run()
	//	if err != nil {
	//		return "", err
	//	}
	//
	//	fmt.Println(insecure)
	//}

	return q.Encode(), nil
}
