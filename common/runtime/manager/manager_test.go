package manager_test

import (
	"context"
	"testing"

	"github.com/spf13/viper"
	"go.etcd.io/bbolt"
	"go.mongodb.org/mongo-driver/mongo"
	"google.golang.org/grpc"
	"google.golang.org/grpc/examples/helloworld/helloworld"
	"gorm.io/gorm"

	cgrpc "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/server/generic"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/storage/bleve"
	"github.com/pydio/cells/v4/common/utils/propagator"

	_ "embed"
	_ "github.com/pydio/cells/v4/common/registry/config"
	_ "github.com/pydio/cells/v4/common/server/grpc"
	_ "github.com/pydio/cells/v4/common/storage/boltdb"
	_ "github.com/pydio/cells/v4/common/storage/mongodb"
	_ "github.com/pydio/cells/v4/common/storage/sql"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	//go:embed config-storage-test.yaml
	storageTestTemplate string

	//go:embed config-connection-test.yaml
	connectionTestTemplate string
)

type testHandler struct {
	helloworld.UnimplementedGreeterServer
}

func (*testHandler) SayHello(ctx context.Context, req *helloworld.HelloRequest) (*helloworld.HelloReply, error) {
	return &helloworld.HelloReply{Message: "Hello " + req.GetName()}, nil
}

func TestManagerStorage(t *testing.T) {
	v := viper.New()
	v.Set("name", "discovery")
	v.Set("tags", "storages")
	v.Set(runtime.KeyBootstrapYAML, storageTestTemplate)
	runtime.SetRuntime(v)

	ctx := context.Background()

	mg, err := manager.NewManager(ctx, "main", nil)
	if err != nil {
		t.Error("cannot run test", err)
		t.Fail()
		return
	}

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

		Convey("Mongo", func() {
			var cli *mongo.Database
			err := mg.GetStorage(ctx, "mongo", &cli)
			So(err, ShouldBeNil)

			cli.CreateCollection(ctx, "collection")
		})

		Convey("Bolt", func() {
			var cli *bbolt.DB
			err := mg.GetStorage(ctx, "bolt", &cli)
			So(err, ShouldBeNil)

			cli.Update(func(tx *bbolt.Tx) error {
				_, err := tx.CreateBucketIfNotExists([]byte(`test`))
				return err
			})
		})

		Convey("Bleve", func() {
			var cli bleve.Indexer
			err := mg.GetStorage(ctx, "bleve", &cli)
			So(err, ShouldBeNil)

			err = cli.InsertOne(context.TODO(), "test")
			So(err, ShouldBeNil)

		})
	})

	// Add service
	svc := service.NewService(
		service.Name("service.test"),
		service.Context(ctx),
		/*
			service.WithStorage("sqlite", func(db *gorm.DB) {
				fmt.Println("db")
			}),
		*/
		service.WithGeneric(func(c context.Context, srv *generic.Server) error {
			return nil
		}),
	)

	svc.Start()
}

func TestManagerConnection(t *testing.T) {
	v := viper.New()
	v.Set("config", "mem://")
	v.Set(runtime.KeyBootstrapYAML, connectionTestTemplate)
	runtime.SetRuntime(v)

	ctx := context.Background()

	runtime.Register("test", func(ctx context.Context) {
		service.NewService(
			service.Name("service.test"),
			service.Context(ctx),
			service.WithGRPC(func(ctx context.Context, registrar grpc.ServiceRegistrar) error {
				helloworld.RegisterGreeterServer(registrar, &testHandler{})
				return nil
			}),
		)
	})

	mg, err := manager.NewManager(ctx, "test", nil)
	if err != nil {
		t.Error("cannot run test", err)
		t.Fail()
		return
	}

	mg.ServeAll()

	Convey("Testing the manager connections", t, func() {
		conn := cgrpc.ResolveConn(mg.Context(), "service.test")
		So(conn, ShouldNotBeNil)

		cli := helloworld.NewGreeterClient(conn)
		resp, err := cli.SayHello(ctx, &helloworld.HelloRequest{Name: "John"})
		So(err, ShouldBeNil)
		So(resp.GetMessage(), ShouldEqual, "Hello John")
	})
}
