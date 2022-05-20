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
	"github.com/pydio/cells/v4/common/registry"
	"net"
)

type ServeOptions struct {
	HttpBindAddress string
	GrpcBindAddress string
	ErrorCallback   func(error)

	BeforeServe []func(oo ...registry.RegisterOption) error
	AfterServe  []func(oo ...registry.RegisterOption) error
	BeforeStop  []func(oo ...registry.RegisterOption) error
	AfterStop   []func(oo ...registry.RegisterOption) error

	RegistryOptions []registry.RegisterOption
}

type ServeOption func(options *ServeOptions)

func WithErrorCallback(cb func(err error)) ServeOption {
	return func(options *ServeOptions) {
		options.ErrorCallback = cb
	}
}

func WithGrpcBindAddress(a string) ServeOption {
	return func(o *ServeOptions) {
		o.GrpcBindAddress = a
	}
}

func WithHttpBindAddress(a string) ServeOption {
	return func(o *ServeOptions) {
		o.HttpBindAddress = a
	}
}

func WithBeforeServe(f func(oo ...registry.RegisterOption) error) ServeOption {
	return func(o *ServeOptions) {
		o.BeforeServe = append(o.BeforeServe, f)
	}
}

func WithAfterServe(f func(oo ...registry.RegisterOption) error) ServeOption {
	return func(o *ServeOptions) {
		o.AfterServe = append(o.AfterServe, f)
	}
}

func WithBeforeStop(f func(oo ...registry.RegisterOption) error) ServeOption {
	return func(o *ServeOptions) {
		o.BeforeStop = append(o.BeforeStop, f)
	}
}

func WithAfterStop(f func(oo ...registry.RegisterOption) error) ServeOption {
	return func(o *ServeOptions) {
		o.AfterStop = append(o.AfterStop, f)
	}
}

// Options stores all options for a pydio server
type Options struct {
	Context  context.Context
	Listener *net.Listener
}

// Option is a function to set Options
type Option func(*Options)
