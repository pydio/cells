package manager_test

import (
	"context"
	"fmt"
	"io"
	"os"
	"testing"

	"github.com/spf13/viper"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/examples/helloworld/helloworld"
	"gorm.io/gorm"

	cgrpc "github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/openurl"
	"github.com/pydio/cells/v5/common/utils/propagator"

	_ "embed"
	_ "github.com/pydio/cells/v5/common/config/memory"
	_ "github.com/pydio/cells/v5/common/registry/config"
	_ "github.com/pydio/cells/v5/common/registry/service"
	_ "github.com/pydio/cells/v5/common/server/grpc"
	_ "github.com/pydio/cells/v5/common/server/http"
	_ "github.com/pydio/cells/v5/common/storage/boltdb"
	_ "github.com/pydio/cells/v5/common/storage/mongodb"
	_ "github.com/pydio/cells/v5/common/storage/sql"
	_ "github.com/pydio/cells/v5/discovery/registry/service"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	//go:embed config-storage-test.yaml
	storageTestTemplate string

	//go:embed config-connection-test.yaml
	connectionTestTemplate string
)

func init() {
	log.SetLoggerInit(func(_ context.Context) (*zap.Logger, []io.Closer) {
		conf := zap.NewDevelopmentConfig()
		conf.OutputPaths = []string{"stdout"}
		logger, _ := conf.Build()
		return logger, nil
	}, nil)

	// TODO - remove storage
	openurl.RegisterTplFunc("autoMkdirTmp", func(dir string) string {
		dirname, err := os.MkdirTemp("", dir)
		if err != nil {
			panic(err)
		}

		return dirname
	})
}

type testHandler struct {
	helloworld.UnimplementedGreeterServer
}

func (*testHandler) SayHello(ctx context.Context, req *helloworld.HelloRequest) (*helloworld.HelloReply, error) {

	rootContext := runtime.MultiContextManager().CurrentContextProvider(ctx).Context(ctx)

	if req.GetName() == "DAO" {
		_, err := manager.Resolve[T](rootContext)
		if err != nil {
			return nil, err
		}

		return &helloworld.HelloReply{Message: "Hello with DAO " + req.GetName()}, nil
	}

	return &helloworld.HelloReply{Message: "Hello " + req.GetName()}, nil
}

func TestManagerStorage(t *testing.T) {
	v := viper.New()
	v.Set("tags", "storages")
	v.Set(runtime.KeyKeyring, "mem://")
	v.Set(runtime.KeyConfig, "mem://")
	v.Set(runtime.KeyRegistry, "mem://")
	v.Set(runtime.KeyBootstrapRoot, "")
	runtime.SetRuntime(v)

	ctx := context.Background()

	mg, err := manager.NewManager(ctx, "main", nil)
	if err != nil {
		t.Error("cannot run test", err)
		t.Fail()
		return
	}

	mg.Bootstrap(storageTestTemplate)

	ctx = propagator.With(ctx, registry.ContextKey, mg.Registry())

	Convey("Testing the manager connections", t, func() {
		Convey("SQLite", func() {
			var db *gorm.DB
			err := mg.GetStorage(ctx, "sql", &db)
			So(err, ShouldBeNil)

			type Test struct {
				Name string
			}

			var t Test
			db.Table("whatever").AutoMigrate(t)
			db.Table("whatever").Create(Test{"test"})
			db.Table("whatever").First(&t)
		})

		/*Convey("Mongo", func() {
			var cli *mongodb.Indexer
			err := mg.GetStorage(ctx, "mongo", &cli)
			So(err, ShouldBeNil)

			cli.CreateCollection(ctx, "collection")
		})

		Convey("Bolt", func() {
			var cli boltdb.DB
			err := mg.GetStorage(ctx, "bolt", &cli)
			So(err, ShouldBeNil)

			cli.Update(func(tx *bbolt.Tx) error {
				_, err := tx.CreateBucketIfNotExists([]byte(`test`))
				return err
			})
		})

		Convey("Bleve", func() {
			var cli *bleve.Indexer
			err := mg.GetStorage(ctx, "bleve", &cli)
			So(err, ShouldBeNil)

			err = cli.InsertOne(context.TODO(), "test")
			So(err, ShouldBeNil)

		})*/
	})
}

func TestManagerConnection(t *testing.T) {
	v := viper.New()
	v.Set(runtime.KeyConfig, "mem://")
	v.Set(runtime.KeyKeyring, "mem://")
	v.Set(runtime.KeyRegistry, "mem://")
	runtime.SetRuntime(v)

	ctx := context.Background()

	runtime.Register("main", func(ctx context.Context) {
		for i := 0; i <= 1; i++ {
			service.NewService(
				service.Name(fmt.Sprintf("service.%d.test", i)),
				service.Context(ctx),
				service.WithGRPC(func(ctx context.Context, registrar grpc.ServiceRegistrar) error {
					helloworld.RegisterGreeterServer(registrar, &testHandler{})
					return nil
				}),
			)
		}
	})

	mg, err := manager.NewManager(ctx, "main", nil)
	if err != nil {
		t.Error("cannot run test", err)
		t.Fail()
		return
	}

	if err := mg.Bootstrap(connectionTestTemplate); err != nil {
		t.Error("cannot bootstrap", err)
		t.Fail()
		return
	}

	if err := mg.ServeAll(); err != nil {
		t.Error("cannot serve", err)
		t.Fail()
		return
	}

	Convey("Testing the manager connections", t, func() {
		conn := cgrpc.ResolveConn(mg.Context(), "service.0.test")
		So(conn, ShouldNotBeNil)

		cli := helloworld.NewGreeterClient(conn)
		resp, err := cli.SayHello(ctx, &helloworld.HelloRequest{Name: "John"})
		So(err, ShouldBeNil)
		So(resp.GetMessage(), ShouldEqual, "Hello John")
	})
}

type T struct{}

func NewDAO(*gorm.DB) T {
	return T{}
}

func TestManagerConnectionAndStorage(t *testing.T) {
	v := viper.New()
	v.Set(runtime.KeyConfig, "mem://")
	v.Set(runtime.KeyKeyring, "mem://")
	v.Set(runtime.KeyRegistry, "mem://")
	runtime.SetRuntime(v)

	ctx := context.Background()

	runtime.Register("main", func(ctx context.Context) {

		drivers := service.StorageDrivers{}
		drivers.Register(NewDAO)

		service.NewService(
			service.Name("service.test"),
			service.Context(ctx),
			service.WithStorageDrivers(drivers),
			service.WithGRPC(func(ctx context.Context, registrar grpc.ServiceRegistrar) error {
				helloworld.RegisterGreeterServer(registrar, &testHandler{})
				return nil
			}),
		)
	})

	mg, err := manager.NewManager(ctx, "main", nil)
	if err != nil {
		t.Error("cannot run test", err)
		t.Fail()
		return
	}

	if err := mg.Bootstrap(connectionTestTemplate); err != nil {
		t.Error("cannot bootstrap", err)
		t.Fail()
		return
	}

	if err := mg.Bootstrap(storageTestTemplate); err != nil {
		t.Error("cannot bootstrap", err)
		t.Fail()
		return
	}

	items, err := mg.Registry().List()
	for _, item := range items {
		fmt.Println(item)
	}

	if err := mg.ServeAll(); err != nil {
		t.Error("cannot serve", err)
		t.Fail()
		return
	}

	Convey("Testing the manager connections", t, func() {
		conn := cgrpc.ResolveConn(mg.Context(), "service.test")
		So(conn, ShouldNotBeNil)

		cli := helloworld.NewGreeterClient(conn)
		resp, err := cli.SayHello(mg.Context(), &helloworld.HelloRequest{Name: "John"})
		So(err, ShouldBeNil)
		So(resp.GetMessage(), ShouldEqual, "Hello John")
	})

	fmt.Println("Done")
}

func TestMultiContextManagerStorage(t *testing.T) {
	v := viper.New()
	v.Set(runtime.KeyConfig, "mem://")
	v.Set(runtime.KeyKeyring, "mem://")
	v.Set(runtime.KeyRegistry, "mem://")
	runtime.SetRuntime(v)

	ctx := context.Background()

	runtime.Register("main", func(ctx context.Context) {

		drivers := service.StorageDrivers{}
		drivers.Register(NewDAO)

		service.NewService(
			service.Name("service.test"),
			service.Context(ctx),
			service.WithStorageDrivers(drivers),
			service.WithGRPC(func(ctx context.Context, registrar grpc.ServiceRegistrar) error {
				helloworld.RegisterGreeterServer(registrar, &testHandler{})
				return nil
			}),
		)
	})

	mg, err := manager.NewManager(ctx, "main", nil)
	if err != nil {
		t.Error("cannot run test", err)
		t.Fail()
		return
	}

	mg.Bootstrap(connectionTestTemplate)

	mg.ServeAll()

	runtime.MultiContextManager().Iterate(mg.Context(), func(ctx context.Context, name string) error {

		var configStore config.Store
		propagator.Get(ctx, config.ContextKey, &configStore)

		if configStore == nil {
			return nil
		}

		mgctx, err := manager.NewManager(ctx, name, nil)
		if err != nil {
			t.Error("cannot run test", err)
			t.Fail()
			return err
		}

		mgctx.Bootstrap(storageTestTemplate)

		runtime.MultiContextManager().CurrentContextProvider(ctx).SetRootContext(mgctx.Context())

		return nil
	})

	Convey("Testing the manager connections", t, func() {
		conn := cgrpc.ResolveConn(mg.Context(), "service.test")
		So(conn, ShouldNotBeNil)

		cli := helloworld.NewGreeterClient(conn)
		resp, err := cli.SayHello(mg.Context(), &helloworld.HelloRequest{Name: "John"})
		So(err, ShouldBeNil)
		So(resp.GetMessage(), ShouldEqual, "Hello John")
	})

	fmt.Println("Done")
}
