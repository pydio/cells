package service

import (
	"context"
	"fmt"
	"testing"

	"github.com/spf13/viper"
	"google.golang.org/grpc"

	cgrpc "github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/config/memory"
	pb "github.com/pydio/cells/v5/common/proto/config"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/utils/configx"

	_ "embed"
	_ "github.com/pydio/cells/v5/common/registry/config"
	_ "github.com/pydio/cells/v5/common/server/grpc"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	//go:embed remote_test.yaml
	connectionTestTemplate string
)

type testHandler struct {
	pb.UnimplementedConfigServer
	store config.Store
}

func (t *testHandler) Get(ctx context.Context, request *pb.GetRequest) (*pb.GetResponse, error) {
	return &pb.GetResponse{Value: &pb.Value{
		Data: t.store.Val(request.GetPath()).Bytes(),
	}}, nil
}

func (t *testHandler) Set(ctx context.Context, request *pb.SetRequest) (*pb.SetResponse, error) {
	t.store.Val(request.GetPath()).Set(request.GetValue().GetData())
	return &pb.SetResponse{}, nil
}

func (t *testHandler) Delete(ctx context.Context, request *pb.DeleteRequest) (*pb.DeleteResponse, error) {
	if err := t.store.Val(request.GetPath()).Del(); err != nil {
		return nil, err
	}

	return &pb.DeleteResponse{}, nil
}

func (t *testHandler) Watch(request *pb.WatchRequest, stream pb.Config_WatchServer) error {
	w, err := t.store.Watch(configx.WithPath(request.GetPath()))
	if err != nil {
		return err
	}

	defer w.Stop()

	for {
		res, err := w.Next()
		if err != nil {
			return err
		}

		if v, ok := res.(configx.Values); ok {
			stream.Send(&pb.WatchResponse{
				Value: &pb.Value{
					Data: v.Bytes(),
				},
			})
		}
	}

	return nil
}

func TestManagerConnection(t *testing.T) {
	v := viper.New()
	v.Set("config", "mem://")
	v.Set("yaml", connectionTestTemplate)
	v.Set(runtime.KeyKeyring, "mem://")
	runtime.SetRuntime(v)

	ctx := context.Background()

	runtime.Register("test", func(ctx context.Context) {
		service.NewService(
			service.Name("service.test"),
			service.Context(ctx),
			service.WithGRPC(func(ctx context.Context, registrar grpc.ServiceRegistrar) error {
				fmt.Println("Registering test handler")
				pb.RegisterConfigServer(registrar, &testHandler{
					store: memory.New(configx.WithJSON()),
				})
				return nil
			}),
		)
	})

	// Setting up manager
	fmt.Println("Setting up manager")
	mg, err := manager.NewManager(ctx, "test", nil)
	if err != nil {
		t.Error("cannot run test", err)
		t.Fail()
		return
	}

	// Serving all
	fmt.Println("Serving all")
	if err := mg.ServeAll(); err != nil {
		fmt.Println("Error is ", err)
	}

	Convey("Testing the manager connections", t, func() {

		fmt.Println("Resolving conn")
		conn := cgrpc.ResolveConn(mg.Context(), "service.test")
		So(conn, ShouldNotBeNil)

		fmt.Println("Setting up new connection")
		c := New(ctx, conn, "", "")
		err := c.Val("whatever").Set("whatever")
		So(err, ShouldBeNil)

		str := c.Val("whatever").String()
		So(str, ShouldEqual, "whatever")

	})
}
