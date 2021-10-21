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

package defaults

import (
	"github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-micro/selector"
	"github.com/micro/go-micro/server"
	"github.com/micro/go-micro/transport"
)

type Option func(*Options)

type Options struct {
	Selector  selector.Selector
	Registry  registry.Registry
	Broker    broker.Broker
	Transport transport.Transport
	CertFile  string
	KeyFile   string
	Client    func(new ...client.Option) client.Client
	Server    func(new ...server.Option) server.Server
}

func WithRegistry(r registry.Registry) Option {
	return func(o *Options) {
		o.Registry = r
	}
}

func WithBroker(b broker.Broker) Option {
	return func(o *Options) {
		o.Broker = b
	}
}

func WithTransport(t transport.Transport) Option {
	return func(o *Options) {
		o.Transport = t
	}
}

func WithCert(c string, k string) Option {
	return func(o *Options) {
		o.CertFile = c
		o.KeyFile = k
	}

}
