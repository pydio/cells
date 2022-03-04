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

package server

import (
	"context"
	"net"
)

// ServiceOptions stores all options for a pydio service
type ServerOptions struct {
	Context  context.Context
	Listener *net.Listener

	// Before and After funcs
	BeforeServe []func() error
	AfterServe  []func() error
	BeforeStop  []func() error
	AfterStop   []func() error
}

// ServerOption is a function to set ServerOptions
type ServerOption func(*ServerOptions)

// BeforeServe executes function before starting the server
func BeforeServe(f func() error) ServerOption {
	return func(o *ServerOptions) {
		o.BeforeServe = append(o.BeforeServe, f)
	}
}

func AfterServe(f func() error) ServerOption {
	return func(o *ServerOptions) {
		o.AfterServe = append(o.AfterServe, f)
	}
}

func BeforeStop(f func() error) ServerOption {
	return func(o *ServerOptions) {
		o.BeforeStop = append(o.BeforeStop, f)
	}
}

func AfterStop(f func() error) ServerOption {
	return func(o *ServerOptions) {
		o.AfterStop = append(o.AfterStop, f)
	}
}
