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

package registry

import (
	"context"
	"time"

	"github.com/spf13/pflag"
)

// Option is a gateway to setting Options to the Registry
type Option func(*Options)

// RegisterOption is a gateway to setting RegisterOptions to a Registry Entry
type RegisterOption func(*RegisterOptions)

// Options defines options to the Registry itself
type Options struct {
	Name         string
	PollInterval time.Duration

	// Other options for implementations of the interface
	// can be stored in a context
	Context context.Context
}

// Name links a name as a registry option
func Name(n string) Option {
	return func(o *Options) {
		o.Name = n
	}
}

// PollInterval defines an interval option to a watcher
func PollInterval(interval time.Duration) Option {
	return func(o *Options) {
		o.PollInterval = interval
	}
}

func newOptions(opts ...Option) Options {
	opt := Options{
		PollInterval: 5 * time.Second,
	}

	for _, o := range opts {
		o(&opt)
	}

	return opt
}

// RegisterOptions defines different options for the Register entry
type RegisterOptions struct {
	Dependencies []string
	Flags        []*pflag.Flag

	// Other options for implementations of the interface
	// can be stored in a context
	Context context.Context
}

// RegisterDependencies adds dependencies between services to the registry entry
func RegisterDependencies(d ...string) RegisterOption {
	return func(o *RegisterOptions) {
		o.Dependencies = append(o.Dependencies, d...)
	}
}

// RegisterFlags adds flags to the registry entry service
func RegisterFlags(f ...*pflag.Flag) RegisterOption {
	return func(o *RegisterOptions) {
		o.Flags = f
	}
}
