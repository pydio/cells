/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package grpc

import "net"

type Option func(*Options)

type Options struct {
	Scheme   string
	Name     string
	Addr     string
	JwtAuth  bool
	Secure   bool
	Listener net.Listener
}

func WithScheme(scheme string) Option {
	return func(o *Options) {
		o.Scheme = scheme
	}
}

func WithAuth() Option {
	return func(o *Options) {
		o.JwtAuth = true
	}
}

func WithSecure() Option {
	return func(o *Options) {
		o.Secure = true
	}
}

func WithName(name string) Option {
	return func(o *Options) {
		o.Name = name
	}
}

func WithAddr(addr string) Option {
	return func(o *Options) {
		o.Addr = addr
	}
}

func WithListener(lis net.Listener) Option {
	return func(o *Options) {
		o.Listener = lis
	}
}
