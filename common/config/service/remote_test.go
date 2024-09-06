package service

import (
	"context"
	_ "embed"
	"fmt"
	cgrpc "github.com/pydio/cells/v4/common/client/grpc"
	pb "github.com/pydio/cells/v4/common/proto/config"
	_ "github.com/pydio/cells/v4/common/registry/config"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	_ "github.com/pydio/cells/v4/common/server/grpc"
	"github.com/pydio/cells/v4/common/service"
	"github.com/spf13/viper"
	"google.golang.org/grpc"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	//go:embed remote_test.yaml
	connectionTestTemplate string
)

type testHandler struct {
	pb.UnimplementedConfigServer
}

func TestManagerConnection(t *testing.T) {
	v := viper.New()
	v.Set("config", "mem://")
	v.Set("yaml", connectionTestTemplate)
	runtime.SetRuntime(v)

	ctx := context.Background()

	runtime.Register("test", func(ctx context.Context) {
		fmt.Println("In here")
		service.NewService(
			service.Name("service.test"),
			service.Context(ctx),
			service.WithGRPC(func(ctx context.Context, registrar grpc.ServiceRegistrar) error {
				fmt.Println("Registering test handler")
				pb.RegisterConfigServer(registrar, &testHandler{})
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
		c.Val("whatever").Set("whatever")
	})
}
