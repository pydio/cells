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

import (
	"net"
	"strings"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/balancer/base"

	"github.com/pydio/cells/v4/common/registry"
)

type Option func(*Options)
type subConnInfoFilter func(info base.SubConnInfo) bool

type Options struct {
	ClientConn      grpc.ClientConnInterface
	Registry        registry.Registry
	CallTimeout     time.Duration
	DialOptions     []grpc.DialOption
	SubConnSelector subConnInfoFilter
}

func WithPeerSelector(host string) Option {
	return func(o *Options) {
		o.SubConnSelector = func(info base.SubConnInfo) bool {
			hosts := strings.Split(host, "|")
			aHost, _, er := net.SplitHostPort(info.Address.Addr)
			if er != nil {
				return false
			}
			for _, h := range hosts {
				if aHost == h {
					return true
				}
			}
			return false
		}
	}
}

func WithClientConn(c grpc.ClientConnInterface) Option {
	return func(o *Options) {
		o.ClientConn = c
	}
}

func WithRegistry(r registry.Registry) Option {
	return func(o *Options) {
		o.Registry = r
	}
}

func WithCallTimeout(c time.Duration) Option {
	return func(o *Options) {
		o.CallTimeout = c
	}
}

func WithDialOptions(opts ...grpc.DialOption) Option {
	return func(o *Options) {
		o.DialOptions = append(o.DialOptions, opts...)
	}
}
