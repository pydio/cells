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

package service

import (
	"context"
	"net/http"
	"regexp"

	"github.com/micro/go-micro"
	"github.com/micro/go-web"
	"github.com/spf13/pflag"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/dao"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service/frontend"
)

type dependency struct {
	Name string
	Tag  []string
}

// ServiceOptions stores all options for a pydio service
type ServiceOptions struct {
	Name string
	Tags []string

	Version     string
	Description string
	Source      string

	Context context.Context
	Cancel  context.CancelFunc

	DAO        func(dao.DAO) dao.DAO
	Prefix     interface{}
	Migrations []*Migration

	Port string

	Micro micro.Service
	Web   web.Service

	Dependencies []*dependency

	// Starting options
	AutoStart bool
	Fork      bool
	Unique    bool

	Registry registry.Registry

	Regexp  *regexp.Regexp
	Flags   pflag.FlagSet
	Checker Checker

	MinNumberOfNodes int

	// Before and After funcs
	BeforeInit  []func(Service) error
	AfterInit   []func(Service) error
	BeforeStart []func(Service) error
	AfterStart  []func(Service) error
	BeforeStop  []func(Service) error
	AfterStop   []func(Service) error

	OnRegexpMatch func(Service, []string) error

	// Micro init
	MicroInit func(Service) error

	// Web init
	WebInit         func(Service) error
	webHandlerWraps []func(http.Handler) http.Handler
}

// ServiceOption defines a generic entry point to configure ServiceOptions store during initialisation.
type ServiceOption func(*ServiceOptions)

func newOptions(opts ...ServiceOption) ServiceOptions {
	opt := ServiceOptions{}

	opt.Registry = registry.Default
	opt.AutoStart = true

	// Sequentially execute all ServiceOption methods to configure this service ServiceOptions store
	for _, o := range opts {
		o(&opt)
	}

	return opt
}

func Name(n string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Name = n
	}
}

func Version(v string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Version = v
	}
}

func Migrations(migrations []*Migration) ServiceOption {
	return func(o *ServiceOptions) {
		o.Migrations = migrations
	}
}

func Tag(t ...string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Tags = append(o.Tags, t...)
	}
}

func Description(d string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Description = d
	}
}

func Source(s string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Source = s
	}
}

func Context(c context.Context) ServiceOption {
	return func(o *ServiceOptions) {
		o.Context = c
	}
}

func Cancel(c context.CancelFunc) ServiceOption {
	return func(o *ServiceOptions) {
		o.Cancel = c
	}
}

func Regexp(r string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Name = r // We temporary save the regexp as name to ensure it's different from one service to another
		o.Regexp = regexp.MustCompile(r)
	}
}

func Port(p string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Port = p
	}
}

func WithChecker(c Checker) ServiceOption {
	return func(o *ServiceOptions) {
		o.Checker = c
	}
}

func AutoStart(b bool) ServiceOption {
	return func(o *ServiceOptions) {
		o.AutoStart = b
	}
}

func Fork(b bool) ServiceOption {
	return func(o *ServiceOptions) {
		o.Fork = b
	}
}

func Unique(b bool) ServiceOption {
	return func(o *ServiceOptions) {
		o.Unique = b
	}
}

func Dependency(n string, t []string) ServiceOption {
	return func(o *ServiceOptions) {
		o.Dependencies = append(o.Dependencies, &dependency{n, t})
	}
}

func RouterDependencies() ServiceOption {
	return func(o *ServiceOptions) {
		routerDependencies := []string{
			common.SERVICE_TREE,
			common.SERVICE_ACL,
			common.SERVICE_VERSIONS,
			common.SERVICE_DOCSTORE,
		}
		for _, s := range routerDependencies {
			o.Dependencies = append(o.Dependencies, &dependency{common.SERVICE_GRPC_NAMESPACE_ + s, []string{}})
		}
	}
}

func PluginBoxes(boxes ...frontend.PluginBox) ServiceOption {
	return func(o *ServiceOptions) {
		o.Dependencies = append(o.Dependencies, &dependency{common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_FRONT_STATICS, []string{}})
		frontend.RegisterPluginBoxes(boxes...)
	}
}

// Before and Afters
func BeforeInit(fn func(Service) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.BeforeInit = append(o.BeforeInit, fn)
	}
}

func AfterInit(fn func(Service) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.AfterInit = append(o.AfterInit, fn)
	}
}

func BeforeStart(fn func(Service) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.BeforeStart = append(o.BeforeStart, fn)
	}
}

func AfterStart(fn func(Service) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.AfterStart = append(o.AfterStart, fn)
	}
}

func BeforeStop(fn func(Service) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.BeforeStop = append(o.BeforeStop, fn)
	}
}

func AfterStop(fn func(Service) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.AfterStop = append(o.AfterStop, fn)
	}
}
