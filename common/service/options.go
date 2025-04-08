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
	"net/http"
	"sync"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/server"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/uuid"
	"github.com/pydio/cells/v5/common/utils/watch"
)

// ServiceOptions stores all options for a pydio service
type ServiceOptions struct {
	Name string   `json:"name"`
	ID   string   `json:"id"`
	Tags []string `json:"tags"`

	Version     string `json:"version"`
	Description string `json:"description"`
	Source      string `json:"source"`

	Metadata map[string]string `json:"metadata"`

	rootContext   context.Context
	runtimeCtx    context.Context
	runtimeCancel context.CancelFunc

	migrateOnce     map[string]bool
	migrateOnceL    *sync.Mutex
	Migrations      []*Migration `json:"-"`
	MigrateIterator struct {
		ContextKey any
		Lister     func(ctx context.Context) []string
	} `json:"-"`
	MigrateWatcher struct {
		ContextKey any
		Watcher    func(ctx context.Context) (watch.Receiver, error)
	}

	// Port      string
	TLSConfig *tls.Config

	customScheme string
	Server       server.Server `json:"-"`
	serverType   server.Type
	serverStart  func(context.Context) error
	serverStop   func(context.Context) error

	// Starting options
	ForceRegister bool `json:"-"`
	AutoStart     bool `json:"-"`
	AutoRestart   bool `json:"-"`
	Fork          bool `json:"-"`
	Unique        bool `json:"-"`

	// Before and After funcs
	BeforeStart   []func(context.Context) (context.Context, error) `json:"-"`
	BeforeStop    []func(context.Context) error                    `json:"-"`
	BeforeRequest []func(context.Context) (context.Context, error) `json:"-"`
	AfterServe    []func(context.Context) error                    `json:"-"`

	WebMiddlewares []func(h http.Handler) http.Handler
	//	UseWebSession      bool     `json:"-"`
	//	WebSessionExcludes []string `json:"-"`

	StorageOptions StorageOptions `json:"-"`

	localLogger log.ZapLogger
}

// ServiceOption provides a functional option
type ServiceOption func(*ServiceOptions)

// RootContext returns root context
func (o *ServiceOptions) RootContext() context.Context {
	return o.rootContext
}

// RuntimeContext returns runtime context or root context
func (o *ServiceOptions) RuntimeContext() context.Context {
	if o.runtimeCtx == nil {
		return o.rootContext
	}
	return o.runtimeCtx
}

// Logger returns a local logger
func (o *ServiceOptions) Logger() log.ZapLogger {
	if o.localLogger == nil {
		o.localLogger = log.Logger(o.rootContext)
	}
	return o.localLogger
}

// GetRegistry returns the context registry
func (o *ServiceOptions) GetRegistry() registry.Registry {
	var reg registry.Registry
	propagator.Get(o.rootContext, registry.ContextKey, &reg)
	return reg
}

// SetRegistry sets the registry in the root context
func (o *ServiceOptions) SetRegistry(r registry.Registry) {
	o.rootContext = propagator.With(o.rootContext, registry.ContextKey, r)
}

// ID option for a service
func ID(n string) ServiceOption {
	return func(o *ServiceOptions) {
		o.ID = n
	}
}

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
		o.rootContext = c
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

func WithServerScheme(scheme string) ServiceOption {
	return func(o *ServiceOptions) {
		o.customScheme = scheme
	}
}

// ForceRegister option for a service
func ForceRegister(b bool) ServiceOption {
	return func(o *ServiceOptions) {
		o.ForceRegister = b
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

// WithMigrateIterator injects an additional level of iteration for update service version
func WithMigrateIterator(ctxKey any, lister func(ctx context.Context) []string) ServiceOption {
	return func(o *ServiceOptions) {
		o.MigrateIterator.ContextKey = ctxKey
		o.MigrateIterator.Lister = lister
	}
}

// WithMigrateWatcher injects an additional level of iteration for update service version
func WithMigrateWatcher(ctxKey any, watcher func(ctx context.Context) (watch.Receiver, error)) ServiceOption {
	return func(o *ServiceOptions) {
		o.MigrateWatcher.ContextKey = ctxKey
		o.MigrateWatcher.Watcher = watcher
	}
}

// Metadata registers a key/value metadata
func Metadata(name, value string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Metadata[name] = value
	}
}

// PluginBoxes option for a service
func PluginBoxes(boxes ...PluginBox) ServiceOption {
	return func(o *ServiceOptions) {
		RegisterPluginBoxes(boxes...)
	}
}

// WithWebMiddleware appends additional middleware
func WithWebMiddleware(middleware func(h http.Handler) http.Handler) ServiceOption {
	return func(o *ServiceOptions) {
		o.WebMiddlewares = append(o.WebMiddlewares, middleware)
	}
}

func newOptions(opts ...ServiceOption) *ServiceOptions {
	opt := &ServiceOptions{}

	opt.ID = uuid.New()
	opt.Metadata = make(map[string]string)
	opt.Version = common.Version().String()
	opt.AutoStart = true
	opt.rootContext = context.TODO()
	opt.migrateOnce = make(map[string]bool)
	opt.migrateOnceL = &sync.Mutex{}

	for _, o := range opts {
		if o == nil {
			continue
		}

		o(opt)
	}

	return opt
}
