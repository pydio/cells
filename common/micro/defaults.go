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

	"github.com/pkg/errors"

	grpcclient "github.com/micro/go-plugins/client/grpc"
	grpcserver "github.com/micro/go-plugins/server/grpc"
	httpserver "github.com/micro/go-plugins/server/http"

	"github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/server"
	"github.com/micro/go-micro/transport"
)

var (
	clientOpts []func() client.Option
	serverOpts []func() server.Option
)

func InitServer(opt ...func() server.Option) {

	serverOpts = append(serverOpts, opt...)

	// Make it configurable ?
	// opts.Selector = cache.NewSelector(selector.Registry(opts.Registry))
	//
	// if opts.Server == nil {
	// 	so, err := simpleServerTLS(opts.CertFile, opts.KeyFile)
	// 	if err != nil {
	// 		log.Fatal("Certificates not found - do you have permission to read the file ?", err)
	// 	}
	//
	// 	opts.Server = func(new ...server.Option) server.Server {
	// 		s := grpcserver.NewServer(
	// 			server.Registry(opts.Registry),
	// 			server.Broker(opts.Broker),
	// 			server.Transport(opts.Transport),
	// 		)
	// 		if so != nil {
	// 			s.Init(so)
	// 		}
	// 		s.Init(new...)
	// 		return s
	// 	}
	// }
	//
	// if opts.Client == nil {
	// 	co, err := simpleClientTLS(opts.CertFile)
	// 	if err != nil {
	// 		log.Fatal("Certificates not found - do you have permission to read the file ?", err)
	// 	}
	//
	// 	opts.Client = func(new ...client.Option) client.Client {
	// 		c := grpcclient.NewClient(
	// 			client.Selector(opts.Selector),
	// 			client.Registry(opts.Registry),
	// 			client.Broker(opts.Broker),
	// 			client.Transport(opts.Transport),
	// 			client.RequestTimeout(10*time.Minute),
	// 			client.Wrap(servicecontext.SpanClientWrapper),
	// 		)
	// 		if co != nil {
	// 			c.Init(co)
	// 		}
	// 		c.Init(new...)
	//
	// 		return c
	// 	}
	// }
	//
	// // Do we need this ?
	// registry.DefaultRegistry = opts.Registry
	// broker.DefaultBroker = opts.Broker
	// transport.DefaultTransport = opts.Transport
	//
	// client.DefaultClient = opts.Client()
	// server.DefaultServer = opts.Server()

	server.DefaultServer = NewServer()
}

func InitClient(opt ...func() client.Option) {
	clientOpts = append(clientOpts, opt...)

	client.DefaultClient = NewClient()
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

// NewClient returns a client attached to the defaults
func NewClient(new ...client.Option) client.Client {
	opts := new
	for _, o := range clientOpts {
		opts = append(opts, o())
	}

	return grpcclient.NewClient(
		opts...,
	)
}

// NewServer returns a server attached to the defaults
func NewServer(new ...server.Option) server.Server {
	opts := new
	for _, o := range serverOpts {
		opts = append(opts, o())
	}

	return grpcserver.NewServer(
		opts...,
	)
}

func NewHTTPServer(new ...server.Option) server.Server {
	opts := new
	for _, o := range serverOpts {
		opts = append(opts, o())
	}

	s := httpserver.NewServer(
		opts...,
	)

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
