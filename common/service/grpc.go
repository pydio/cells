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

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

// WithGRPC adds a GRPC service handler to the current service
func WithGRPC(f func(context.Context, grpc.ServiceRegistrar) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.serverType = server.TypeGrpc
		o.serverStart = func(ctx context.Context) error {
			if o.Server == nil {
				return errors.WithStack(errors.ServiceNoServerAttached)
			}

			var registrar grpc.ServiceRegistrar
			o.Server.As(&registrar)
			var reg registry.Registry
			propagator.Get(ctx, registry.ContextKey, &reg)

			return f(ctx, &serviceRegistrar{
				ServiceRegistrar: registrar,
				id:               o.ID,
				name:             o.Name,
				reg:              reg,
			})
		}
	}
}

type IDable interface {
	ID() string
}

type Convertible interface {
	As(interface{}) bool
}

type endpoint struct {
	serviceName string
	serverID    string
}

type handler interface{}

var serviceRegistrars = make(map[endpoint]handler)

type serviceRegistrar struct {
	grpc.ServiceRegistrar
	id   string
	name string
	reg  registry.Registry
}

//func (s *serviceRegistrar) GetServiceInfo() map[string]grpc.ServiceInfo {
//	fmt.Println("GetServiceInfo")
//	return map[string]grpc.ServiceInfo{}
//}

func (s *serviceRegistrar) RegisterService(desc *grpc.ServiceDesc, impl interface{}) {
	s.ServiceRegistrar.RegisterService(desc, impl)

	// Listing endpoints linked to the server
	srv, ok := s.ServiceRegistrar.(registry.Item)
	if !ok {
		return
	}

	for _, method := range desc.Methods {
		endpoint := util.CreateEndpoint("/"+desc.ServiceName+"/"+method.MethodName, impl, map[string]string{})

		s.reg.Register(endpoint,
			registry.WithEdgeTo(s.id, "handler", nil),
			registry.WithEdgeTo(srv.ID(), "server", nil),
		)
	}

	for _, method := range desc.Streams {
		endpoint := util.CreateEndpoint("/"+desc.ServiceName+"/"+method.StreamName, impl, map[string]string{})

		s.reg.Register(endpoint,
			registry.WithEdgeTo(s.id, "handler", nil),
			registry.WithEdgeTo(srv.ID(), "server", nil),
		)
	}
}

func (s *serviceRegistrar) ID() string {
	srv, ok := s.ServiceRegistrar.(IDable)
	if !ok {
		return ""
	}

	return srv.ID()
}

func (s *serviceRegistrar) As(v interface{}) bool {
	srv, ok := s.ServiceRegistrar.(Convertible)
	if !ok {
		return false
	}

	return srv.As(v)
}

// WithGRPCStop hooks to the grpc server stop
func WithGRPCStop(f func(context.Context, grpc.ServiceRegistrar) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.serverStop = func(ctx context.Context) error {
			var registrar grpc.ServiceRegistrar
			o.Server.As(&registrar)
			return f(ctx, registrar)
		}
	}
}
