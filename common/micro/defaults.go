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
	"time"

	grpcclient "github.com/micro/go-plugins/client/grpc"
	grpcserver "github.com/micro/go-plugins/server/grpc"
	httpserver "github.com/micro/go-plugins/server/http"

	"github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/server"
	"github.com/micro/go-micro/transport"

	servicecontext "github.com/pydio/cells/common/service/context"
)

var (
	clientOpts     []func() client.Option
	serverOpts     []func() server.Option
	serverHTTPOpts []func() server.Option
)

func InitServer(opt ...func() server.Option) {
	serverOpts = append(serverOpts, opt...)

	server.DefaultServer = NewServer()
}

func InitHTTPServer(opt ...func() server.Option) {
	serverHTTPOpts = append(serverOpts, opt...)
}

func InitClient(opt ...func() client.Option) {
	clientOpts = append(clientOpts, opt...)

	client.DefaultClient = NewClient()
}

// NewClient returns a client attached to the defaults
func NewClient(new ...client.Option) client.Client {
	opts := new
	for _, o := range clientOpts {
		opts = append(opts, o())
	}

	opts = append(opts, client.RequestTimeout(10*time.Minute))
	opts = append(opts, client.Wrap(servicecontext.SpanClientWrapper))

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
	for _, o := range serverHTTPOpts {
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
