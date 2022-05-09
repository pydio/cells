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

package service

import (
	"context"
	"crypto/tls"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/service/frontend"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

type ServerProvider func(ctx context.Context) (server.Server, error)

// ServiceOptions stores all options for a pydio service
type ServiceOptions struct {
	Name string   `json:"name"`
	ID   string   `json:"id"`
	Tags []string `json:"tags"`

	Version     string `json:"version"`
	Description string `json:"description"`
	Source      string `json:"source"`

	Metadata map[string]string `json:"metadata"`

	Context context.Context    `json:"-"`
	Cancel  context.CancelFunc `json:"-"`

	Migrations []*Migration `json:"-"`

	// Port      string
	TLSConfig *tls.Config

	Server         server.Server  `json:"-"`
	ServerProvider ServerProvider `json:"-"`
	serverType     server.Type
	serverStart    func() error
	serverStop     func() error

	Dependencies []*dependency `json:"-"`

	// Starting options
	AutoStart   bool `json:"-"`
	AutoRestart bool `json:"-"`
	Fork        bool `json:"-"`
	Unique      bool `json:"-"`

	// Before and After funcs
	BeforeStart []func(context.Context) error `json:"-"`
	AfterStart  []func(context.Context) error `json:"-"`
	AfterServe  []func(context.Context) error `json:"-"`

	BeforeStop []func(context.Context) error `json:"-"`
	AfterStop  []func(context.Context) error `json:"-"`

	UseWebSession      bool     `json:"-"`
	WebSessionExcludes []string `json:"-"`

	Storages []*StorageOptions `json:"-"`
}

type dependency struct {
	Name string
	Tag  []string
}

//
type ServiceOption func(*ServiceOptions)

// Name option for a service
func Name(n string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Name = n
	}
}

// Tag option for a service
func Tag(t ...string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Tags = append(o.Tags, t...)
	}
}

// Description option for a service
func Description(d string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Description = d
	}
}

// Source option for a service
func Source(s string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Source = s
	}
}

// Context option for a service
func Context(c context.Context) ServiceOption {
	return func(o *ServiceOptions) {
		o.Context = c
	}
}

// Cancel option for a service
func Cancel(c context.CancelFunc) ServiceOption {
	return func(o *ServiceOptions) {
		o.Cancel = c
	}
}

// WithTLSConfig option for a service
func WithTLSConfig(c *tls.Config) ServiceOption {
	return func(o *ServiceOptions) {
		o.TLSConfig = c
	}
}

// WithServer directly presets the server.Server instance
func WithServer(s server.Server) ServiceOption {
	return func(o *ServiceOptions) {
		o.Server = s
	}
}

// WithServerProvider passes a callback producing a new server.Server
func WithServerProvider(provider ServerProvider) ServiceOption {
	return func(o *ServiceOptions) {
		o.ServerProvider = provider
	}
}

// AutoStart option for a service
func AutoStart(b bool) ServiceOption {
	return func(o *ServiceOptions) {
		o.AutoStart = b
	}
}

// AutoRestart option for a service
func AutoRestart(b bool) ServiceOption {
	return func(o *ServiceOptions) {
		o.AutoRestart = b
	}
}

// AfterStart registers a callback to be run after service.Start (blocking)
func AfterStart(f func(ctx context.Context) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.AfterStart = append(o.AfterStart, f)
	}
}

// AfterServe registers a callback that is run after Server is finally started (non-blocking)
func AfterServe(f func(ctx context.Context) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.AfterServe = append(o.AfterServe, f)
	}
}

// Fork option for a service
func Fork(f bool) ServiceOption {
	return func(o *ServiceOptions) {
		o.Fork = f
	}
}

// Unique option for a service
func Unique(b bool) ServiceOption {
	return func(o *ServiceOptions) {
		o.Unique = b
	}
}

// Migrations option for a service
func Migrations(migrations []*Migration) ServiceOption {
	return func(o *ServiceOptions) {
		o.Migrations = migrations
	}
}

func Metadata(name, value string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Metadata[name] = value
	}
}

// Dependency option for a service
func Dependency(n string, t []string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Dependencies = append(o.Dependencies, &dependency{n, t})
	}
}

// PluginBoxes option for a service
func PluginBoxes(boxes ...frontend.PluginBox) ServiceOption {
	return func(o *ServiceOptions) {
		o.Dependencies = append(o.Dependencies, &dependency{common.ServiceWebNamespace_ + common.ServiceFrontStatics, []string{}})
		frontend.RegisterPluginBoxes(boxes...)
	}
}

func WithWebSession(excludes ...string) ServiceOption {
	return func(o *ServiceOptions) {
		o.UseWebSession = true
		o.WebSessionExcludes = excludes
	}
}

func newOptions(opts ...ServiceOption) *ServiceOptions {
	opt := &ServiceOptions{}

	opt.ID = uuid.New()
	opt.Metadata = make(map[string]string)
	opt.Version = common.Version().String()
	opt.AutoStart = true

	for _, o := range opts {
		if o == nil {
			continue
		}

		o(opt)
	}

	return opt
}
