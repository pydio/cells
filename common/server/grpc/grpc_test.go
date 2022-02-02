package grpc

import (
	"context"
	"fmt"
	"time"

	clientcontext "github.com/pydio/cells/v4/common/client/context"

	"log"
	"net"
	"testing"

	"google.golang.org/grpc"
	"google.golang.org/grpc/examples/helloworld/helloworld"
	"google.golang.org/grpc/test/bufconn"

	cgrpc "github.com/pydio/cells/v4/common/client/grpc"
	pbregistry "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	discoveryregistry "github.com/pydio/cells/v4/discovery/registry"

	_ "github.com/pydio/cells/v4/common/registry/memory"
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
	ctx = servicecontext.WithRegistry(ctx, reg)
	ctx = servercontext.WithRegistry(ctx, reg)

	listener := bufconn.Listen(1024 * 1024)
	srv := New(ctx, WithListener(listener))

	svcRegistry := service.NewService(
		service.Name("test.registry"),
		service.Context(ctx),
		service.WithServer(srv),
		service.WithGRPC(func(ctx context.Context, srv *grpc.Server) error {
			pbregistry.RegisterRegistryServer(srv, discoveryregistry.NewHandler(reg))
			return nil
		}),
	)

	// Create a new service
	svcHello := service.NewService(
		service.Name("test.service"),
		service.Context(ctx),
		service.WithServer(srv),
		service.WithGRPC(func(ctx context.Context, srv *grpc.Server) error {
			helloworld.RegisterGreeterServer(srv, &mock{})
			return nil
		}),
	)

	srv.BeforeServe(svcHello.Start)
	srv.BeforeStop(svcHello.Stop)

	srv.BeforeServe(svcRegistry.Start)
	srv.BeforeStop(svcRegistry.Stop)

	go func() {
		if err := srv.Serve(); err != nil {
			log.Fatal(err)
		}
	}()

	return listener
}

func createApp2(reg registry.Registry) {
	ctx := context.Background()
	ctx = servicecontext.WithRegistry(ctx, reg)
	ctx = servercontext.WithRegistry(ctx, reg)

	listener := bufconn.Listen(1024 * 1024)
	srv := New(ctx, WithListener(listener))

	// Create a new service
	svcHello := service.NewService(
		service.Name("test.service"),
		service.Context(ctx),
		service.WithServer(srv),
		service.WithGRPC(func(ctx context.Context, srv *grpc.Server) error {
			helloworld.RegisterGreeterServer(srv, &mock{})
			return nil
		}),
	)

	srv.BeforeServe(svcHello.Start)
	srv.BeforeStop(svcHello.Stop)

	go func() {
		if err := srv.Serve(); err != nil {
			log.Fatal(err)
		}
	}()
}

func TestServiceRegistry(t *testing.T) {

	ctx := context.Background()
	mem, err := registry.OpenRegistry(ctx, "memory:///")
	if err != nil {
		log.Fatal("could not create memory registry", err)
	}

	listenerApp1 := createApp1(&delayedRegistry{mem})

	conn, err := grpc.Dial("cells:///", grpc.WithInsecure(), grpc.WithResolvers(cgrpc.NewBuilder(mem)), grpc.WithContextDialer(func(ctx context.Context, addr string) (net.Conn, error) {
		fmt.Println("And the address is ? ", addr)
		return listenerApp1.Dial()
	}))
	if err != nil {
		log.Fatal("no conn", err)
	}

	ctx = clientcontext.WithClientConn(ctx, conn)

	cli1 := helloworld.NewGreeterClient(cgrpc.GetClientConnFromCtx(ctx, "test.registry"))
	resp1, err1 := cli1.SayHello(ctx, &helloworld.HelloRequest{Name: "test"})

	fmt.Println(resp1, err1)

	//reg := registryservice.NewRegistry(registryservice.WithConn(conn))
	//
	//createApp2(reg)
	//
	//fmt.Println(listenerApp1, reg)

	//cgrpc.RegisterMock("test.registry", discoverytest.NewRegistryService())
	//ctx := context.Background()
	//mem, _ := registry.OpenRegistry(ctx, "memory://")
	//
	//ctx = servicecontext.WithRegistry(ctx, reg)
	//ctx = servercontext.WithRegistry(ctx, reg)
	//
	//listener := bufconn.Listen(1024 * 1024)
	//srv := New(ctx, WithListener(listener))
	//
	//svcRegistry := service.NewService(
	//	service.Name("test.registry"),
	//	service.Context(ctx),
	//	service.WithServer(srv),
	//	service.WithGRPC(func(ctx context.Context, srv *grpc.Server) error {
	//		pbregistry.RegisterRegistryServer(srv, discoveryregistry.NewHandler(mem))
	//		return nil
	//	}),
	//)
	//
	//srv.BeforeServe(svcRegistry.Start)
	//srv.BeforeStop(svcRegistry.Stop)
	//
	//reg, _ := registry.OpenRegistry(ctx, "grpc://test.registry")
	//
	//// Create a new service
	//svc := service.NewService(
	//	service.Name("test.service"),
	//	service.Context(ctx),
	//	service.WithServer(srv),
	//	service.WithGRPC(func(ctx context.Context, srv *grpc.Server) error {
	//		helloworld.RegisterGreeterServer(srv, &mock{})
	//		return nil
	//	}),
	//)
	//
	//srv.BeforeServe(svc.Start)
	//srv.BeforeStop(svc.Stop)
	//
	//go func() {
	//	<-time.After(5 * time.Second)
	//	if err := srv.Serve(); err != nil {
	//		log.Fatal(err)
	//	}
	//}()
	//conn2 := cgrpc.GetClientConnFromCtx(ctx, "test.service", cgrpc.WithDialOptions(
	//	grpc.WithResolvers(cgrpc.NewBuilder(reg)),
	//))

	//
	//cli2 := helloworld.NewGreeterClient(conn)
	//resp2, err2 := cli2.SayHello(ctx, &helloworld.HelloRequest{Name: "test2"})
	//
	//fmt.Println(resp2, err2)
}

type delayedRegistry struct {
	registry.Registry
}

func (r *delayedRegistry) Register(i registry.Item) error {
	go func() {
		<-time.After(5 * time.Second)
		r.Registry.Register(i)
	}()

	return nil
}
