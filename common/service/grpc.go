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
	"fmt"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/server"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"google.golang.org/grpc"
	"time"
)

// WithGRPC adds a GRPC service handler to the current service
func WithGRPC(f func(context.Context, grpc.ServiceRegistrar) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.serverType = server.TypeGrpc
		o.serverStart = func() error {
			if o.Server == nil {
				return errNoServerAttached
			}

			var registrar grpc.ServiceRegistrar
			o.Server.As(&registrar)

			return f(o.Context, &serviceRegistrar{
				ServiceRegistrar: registrar,
				id:               o.ID,
				name:             o.Name,
				reg:              servicecontext.GetRegistry(o.Context),
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

func (s *serviceRegistrar) RegisterService(desc *grpc.ServiceDesc, impl interface{}) {
	s.ServiceRegistrar.RegisterService(desc, impl)

	// Listing endpoints linked to the server
	item, ok := s.ServiceRegistrar.(registry.Item)
	if !ok {
		return
	}

	<-time.After(100 * time.Millisecond)

	for _, method := range desc.Methods {
		endpoints := s.reg.ListAdjacentItems(item, registry.WithName(desc.ServiceName+"/"+method.MethodName), registry.WithType(pb.ItemType_ENDPOINT))

		if len(endpoints) == 0 {
			fmt.Println("Haven't found method ", desc.ServiceName+"/"+method.MethodName)
		}

		for _, endpoint := range endpoints {
			s.reg.Register(endpoint, registry.WithEdgeTo(s.id, "context", nil))
		}
	}

	for _, method := range desc.Streams {
		endpoints := s.reg.ListAdjacentItems(item, registry.WithName(desc.ServiceName+"/"+method.StreamName), registry.WithType(pb.ItemType_ENDPOINT))

		if len(endpoints) == 0 {
			fmt.Println("Haven't found stream ", desc.ServiceName+"/"+method.StreamName)
		}

		for _, endpoint := range endpoints {
			s.reg.Register(endpoint, registry.WithEdgeTo(s.id, "context", nil))
		}
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
		o.serverStop = func() error {
			var registrar grpc.ServiceRegistrar
			o.Server.As(&registrar)
			return f(o.Context, registrar)
		}
	}
}
