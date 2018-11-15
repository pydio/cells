/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

// Package defaults initializes the defaults GRPC clients and servers used by services
package defaults

import (
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"io/ioutil"
	"log"
	"sync"
	"sync/atomic"
	"time"

	"github.com/pkg/errors"

	grpcclient "github.com/micro/go-plugins/client/grpc"
	grpcserver "github.com/micro/go-plugins/server/grpc"
	httpserver "github.com/micro/go-plugins/server/http"

	"github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/selector"
	"github.com/micro/go-micro/selector/cache"
	"github.com/micro/go-micro/server"
	"github.com/micro/go-micro/transport"
	"github.com/pydio/cells/common/service/context"
)

var (
	opts Options

	once sync.Once
	done uint32
)

// Init function containing all defaults
func Init(opt ...Option) {

	if atomic.LoadUint32(&done) == 1 {
		return
	}

	defer atomic.StoreUint32(&done, 1)

	for _, o := range opt {
		o(&opts)
	}

	// Make it configurable ?
	opts.Selector = cache.NewSelector(selector.Registry(opts.Registry))

	if opts.Server == nil {
		so, err := simpleServerTLS(opts.CertFile, opts.KeyFile)
		if err != nil {
			log.Fatal("Certificates not found - do you have permission to read the file ?", err)
		}

		opts.Server = func(new ...server.Option) server.Server {
			s := grpcserver.NewServer(
				server.Registry(opts.Registry),
				server.Broker(opts.Broker),
				server.Transport(opts.Transport),
			)
			if so != nil {
				s.Init(so)
			}
			s.Init(new...)
			return s
		}
	}

	if opts.Client == nil {

		co, err := simpleClientTLS(opts.CertFile)
		if err != nil {
			log.Fatal("Certificates not found - do you have permission to read the file ?", err)
		}

		opts.Client = func(new ...client.Option) client.Client {
			c := grpcclient.NewClient(
				client.Selector(opts.Selector),
				client.Registry(opts.Registry),
				client.Broker(opts.Broker),
				client.Transport(opts.Transport),
				client.RequestTimeout(10*time.Minute),
				client.Wrap(servicecontext.SpanClientWrapper),
			)
			if co != nil {
				c.Init(co)
			}
			c.Init(new...)

			return c
		}
	}

	// Do we need this ?
	registry.DefaultRegistry = opts.Registry
	broker.DefaultBroker = opts.Broker
	transport.DefaultTransport = opts.Transport

	client.DefaultClient = opts.Client()
	server.DefaultServer = opts.Server()
}

func simpleServerTLS(c string, k string) (server.Option, error) {

	if c == "" || k == "" {
		return nil, nil
	}

	cert, err := tls.LoadX509KeyPair(c, k)
	if err != nil {
		return nil, errors.Wrap(err, "Cannot load client key pair")
	}

	return grpcserver.AuthTLS(&tls.Config{
		Certificates: []tls.Certificate{cert},
	}), nil
}

func simpleClientTLS(c string) (client.Option, error) {
	if c == "" {
		return nil, nil
	}

	b, err := ioutil.ReadFile(c)
	if err != nil {
		return nil, errors.Wrap(err, "Cannot read cert file")
	}

	cp := x509.NewCertPool()
	if !cp.AppendCertsFromPEM(b) {
		return nil, fmt.Errorf("Cannot append cert to pool")
	}

	return grpcclient.AuthTLS(&tls.Config{
		RootCAs: cp,
	}), nil
}

// MutualTLS config - Would be more convenient but we need to know
// the ServerName, that will in fact be selected on-the-fly by the
// registry selector. So we cannot use this for now
// func mutualTlsConfigs(serverName string) (serverTlsOption ms.Option, clientTlsOption mc.Option, err error) {
//
// 	if GrpcCertFile == "" || GrpcKeyFile == "" || GrpcCAFile == "" {
// 		return nil, nil, nil
// 	}
//
// 	var certificate tls.Certificate
// 	var certPool *x509.CertPool
// 	// Load the client certificates from disk
// 	if certificate, err = tls.LoadX509KeyPair(GrpcCertFile, GrpcKeyFile); err != nil {
// 		return nil, nil, errors.Wrap(err, "could not load client key pair")
// 	}
// 	// Create a certificate pool from the certificate authority
// 	certPool = x509.NewCertPool()
// 	// Read the CA
// 	ca, err := ioutil.ReadFile(GrpcCAFile)
// 	if err != nil {
// 		return nil, nil, errors.Wrap(err, "could not read ca certificate")
// 	}
// 	// Append the certificates from the CA
// 	if ok := certPool.AppendCertsFromPEM(ca); !ok {
// 		return nil, nil, errors.Wrap(err, "failed to append ca certs")
// 	}
//
// 	serverTlsOption = grpcserver.AuthTLS(&tls.Config{
// 		ClientAuth:   tls.RequireAndVerifyClientCert,
// 		Certificates: []tls.Certificate{certificate},
// 		ClientCAs:    certPool,
// 	})
// 	clientTlsOption = grpcclient.AuthTLS(&tls.Config{
// 		ServerName:   serverName, // NOTE: this is required!
// 		Certificates: []tls.Certificate{certificate},
// 		RootCAs:      certPool,
// 	})
//
// 	return
// }

func checkInit() {
	once.Do(func() {
		// We are looping until the Initialisation is done
		for {
			if atomic.LoadUint32(&done) == 1 {
				break
			}
			<-time.After(100 * time.Millisecond)
		}
	})
}

// NewClient returns a client attached to the defaults
func NewClient(new ...client.Option) client.Client {
	checkInit()

	return opts.Client(new...)
}

// NewServer returns a server attached to the defaults
func NewServer(new ...server.Option) server.Server {
	checkInit()

	return opts.Server(new...)
}

func NewHTTPServer(new ...server.Option) server.Server {
	s := httpserver.NewServer(
		server.Registry(opts.Registry),
		server.Broker(opts.Broker),
	)

	s.Init(new...)

	return s
}

func Registry() registry.Registry {
	c := NewClient()
	return c.Options().Registry
}

func Transport() transport.Transport {
	c := NewClient()
	return c.Options().Transport
}

func Broker() broker.Broker {
	c := NewClient()
	return c.Options().Broker
}
