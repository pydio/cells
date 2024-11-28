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
	"strings"
	"testing"
	"text/template"
	"time"

	"github.com/spf13/viper"
	"google.golang.org/grpc"
	"google.golang.org/grpc/examples/helloworld/helloworld"
	"google.golang.org/grpc/test/bufconn"

	"github.com/pydio/cells/v5/common/config"
	pbregistry "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/registry/util"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/server"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/utils/cache/gocache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
	"github.com/pydio/cells/v5/common/utils/propagator"
	discoveryregistry "github.com/pydio/cells/v5/discovery/registry"

	_ "github.com/pydio/cells/v5/common/registry/config"
)

var (
	yaml = `
listeners:
  bufconn:
    type: bufconn
    bufsize: 1048576
servers:
  grpc:
    type: grpc
    listener: bufconn
services:
  test:
`

	tmpl *template.Template
)

func init() {
	var err error
	tmpl, err = template.New("test").Parse(yaml)
	if err != nil {
		panic(err)
	}
}

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

/*func TestServiceRegistry(t *testing.T) {

	ctx, _ := mock2.RegisterMockConfig(context.Background())

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

	ctx = runtime.WithClientConn(ctx, conn)

	cli1 := helloworld.NewGreeterClient(cgrpc.ResolveConn(ctx, "test.registry"))
	resp1, err1 := cli1.SayHello(ctx, &helloworld.HelloRequest{Name: "test"})

	fmt.Println(resp1, err1)

	cli2 := helloworld.NewGreeterClient(cgrpc.ResolveConn(ctx, "service.that.does.not.exist"))
	resp2, err2 := cli2.SayHello(ctx, &helloworld.HelloRequest{Name: "test"}, grpc.WaitForReady(false))

	fmt.Println(resp2, err2)

}*/

func TestGetServiceInfo(t *testing.T) {
	// read template
	b := &strings.Builder{}
	err := tmpl.Execute(b, nil)
	if err != nil {
		panic(err)
	}

	v := viper.New()
	v.Set(runtime.KeyConfig, "mem://")
	v.Set(runtime.KeyArgTags, "test")
	v.Set(runtime.KeyBootstrapYAML, b.String())
	runtime.SetRuntime(v)

	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Minute)
	defer cancel()

	mem, _ := config.OpenStore(ctx, "mem://")
	ctx = propagator.With(ctx, config.ContextKey, mem)
	cache_helper.SetStaticResolver("pm://", &gocache.URLOpener{})

	runtime.Register("test", func(ctx context.Context) {
		listener := bufconn.Listen(1024 * 1024)
		srv := New(ctx, WithListener(listener))

		svc := service.NewService(
			service.Name("test"),
			service.Tag("test"),
			service.Context(ctx),
			service.WithServer(srv),
			service.WithGRPC(func(_ context.Context, srv grpc.ServiceRegistrar) error {
				fmt.Println("Registering")
				helloworld.RegisterGreeterServer(srv, &mock{})
				return nil
			}),
		)

		var mgr manager.Manager
		if propagator.Get(ctx, manager.ContextKey, &mgr) {
			for i := 0; i < 100; i++ {
				endpoint := util.CreateEndpoint("/tests/test", nil, map[string]string{})

				go func(endpoint registry.Item) {
					duration := 5 * time.Second
					ticker := time.NewTicker(10 * time.Millisecond)
					defer ticker.Stop()

					start := time.Now()

					for range ticker.C {
						// Check if the total duration has elapsed
						if time.Since(start) >= duration {
							break
						}

						mgr.Registry().Register(endpoint,
							registry.WithEdgeTo(svc.ID(), "handler", map[string]string{
								"modtime": time.Now().String(),
							}),
							registry.WithEdgeTo(srv.ID(), "server", map[string]string{
								"modtime": time.Now().String(),
							}),
						)
					}
					for {
						select {
						case <-time.After(1 * time.Nanosecond):

						}
					}
				}(endpoint)
			}
		}

		var grpcServer *grpc.Server
		if srv.As(&grpcServer) {
			go func() {
				start := time.Now()
				duration := 5 * time.Second
				ticker := time.NewTicker(10 * time.Millisecond)
				defer ticker.Stop()

				for range ticker.C {
					// Check if the total duration has elapsed
					if time.Since(start) >= duration {
						break
					}

					fmt.Println("Geting service info ", grpcServer.GetServiceInfo())
				}

				// Cancelling context
				cancel()
			}()
		}
	})

	mgr, err := manager.NewManager(ctx, "test", nil)
	if err != nil {
		panic(err)
	}

	if err := mgr.ServeAll(); err != nil {
		fmt.Println(err)
	}

	<-ctx.Done()

}

type delayedRegistry struct {
	registry.Registry
}

func (r *delayedRegistry) Register(i registry.Item, option ...registry.RegisterOption) error {

	//<-time.After(5 * time.Second)
	return r.Registry.Register(i, option...)
}
