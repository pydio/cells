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
	"context"
	"fmt"
	"log"
	"net"
	"testing"

	"google.golang.org/grpc"
	"google.golang.org/grpc/examples/helloworld/helloworld"
	"google.golang.org/grpc/test/bufconn"

	clientcontext "github.com/pydio/cells/v4/common/client/context"
	cgrpc "github.com/pydio/cells/v4/common/client/grpc"
	mock2 "github.com/pydio/cells/v4/common/config/mock"
	pbregistry "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/utils/propagator"
	discoveryregistry "github.com/pydio/cells/v4/discovery/registry"

	_ "github.com/pydio/cells/v4/common/registry/config"
)

type mock struct {
	helloworld.UnimplementedGreeterServer
}

func (m *mock) SayHello(ctx context.Context, req *helloworld.HelloRequest) (*helloworld.HelloReply, error) {
	resp := &helloworld.HelloReply{Message: "Greetings " + req.Name}

	return resp, nil
}

func createApp1(reg registry.Registry) *bufconn.Listener {
	ctx := context.Background()
	ctx = propagator.With(ctx, registry.ContextKey, reg)

	listener := bufconn.Listen(1024 * 1024)
	srv := New(ctx, WithListener(listener))

	svcRegistry := service.NewService(
		service.Name("pydio.grpc.test.registry"),
		service.Context(ctx),
		service.WithServer(srv),
		service.WithGRPC(func(ctx context.Context, srv grpc.ServiceRegistrar) error {
			pbregistry.RegisterRegistryServer(srv, discoveryregistry.NewHandler(reg))
			return nil
		}),
	)

	// Create a new service
	svcHello := service.NewService(
		service.Name("pydio.grpc.test.service"),
		service.Context(ctx),
		service.WithServer(srv),
		service.WithGRPC(func(ctx context.Context, srv grpc.ServiceRegistrar) error {
			helloworld.RegisterGreeterServer(srv, &mock{})
			return nil
		}),
	)

	opts := []server.ServeOption{
		server.WithBeforeServe(svcRegistry.Start),
		server.WithBeforeServe(svcHello.Start),
	}

	go func() {
		if err := srv.Serve(opts...); err != nil {
			log.Fatal(err)
		}
	}()

	return listener
}

func createApp2(reg registry.Registry) {
	ctx := context.Background()
	ctx = propagator.With(ctx, registry.ContextKey, reg)

	listener := bufconn.Listen(1024 * 1024)
	srv := New(ctx, WithListener(listener))

	// Create a new service
	svcHello := service.NewService(
		service.Name("pydio.grpc.test.service"),
		service.Context(ctx),
		service.WithServer(srv),
		service.WithGRPC(func(ctx context.Context, srv grpc.ServiceRegistrar) error {
			helloworld.RegisterGreeterServer(srv, &mock{})
			return nil
		}),
	)

	opts := []server.ServeOption{
		server.WithBeforeServe(svcHello.Start),
	}

	go func() {
		if err := srv.Serve(opts...); err != nil {
			log.Fatal(err)
		}
	}()
}

func TestServiceRegistry(t *testing.T) {

	_ = mock2.RegisterMockConfig()

	ctx := context.Background()
	mem, err := registry.OpenRegistry(ctx, "mem:///")
	if err != nil {
		log.Fatal("could not create memory registry", err)
	}

	listenerApp1 := createApp1(&delayedRegistry{mem})

	conn, err := grpc.Dial("cells:///", grpc.WithInsecure(), grpc.WithResolvers(cgrpc.NewBuilder(mem)), grpc.WithContextDialer(func(ctx context.Context, addr string) (net.Conn, error) {
		return listenerApp1.Dial()
	}))
	if err != nil {
		log.Fatal("no conn", err)
	}

	ctx = clientcontext.WithClientConn(ctx, conn)

	cli1 := helloworld.NewGreeterClient(cgrpc.ResolveConn(ctx, "test.registry"))
	resp1, err1 := cli1.SayHello(ctx, &helloworld.HelloRequest{Name: "test"})

	fmt.Println(resp1, err1)

	cli2 := helloworld.NewGreeterClient(cgrpc.ResolveConn(ctx, "service.that.does.not.exist"))
	resp2, err2 := cli2.SayHello(ctx, &helloworld.HelloRequest{Name: "test"}, grpc.WaitForReady(false))

	fmt.Println(resp2, err2)

}

type delayedRegistry struct {
	registry.Registry
}

func (r *delayedRegistry) Register(i registry.Item, option ...registry.RegisterOption) error {

	//<-time.After(5 * time.Second)
	return r.Registry.Register(i, option...)
}
