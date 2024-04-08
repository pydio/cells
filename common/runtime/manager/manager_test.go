package manager

import (
	"context"
	_ "embed"
	"fmt"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
	"github.com/spf13/viper"
	"go.mongodb.org/mongo-driver/mongo"
	"gorm.io/gorm"

	_ "github.com/pydio/cells/v4/common/registry/config"
	"github.com/pydio/cells/v4/common/runtime"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"github.com/pydio/cells/v4/common/server/generic"
	"github.com/pydio/cells/v4/common/service"
	_ "github.com/pydio/cells/v4/common/storage/bleve"
	_ "github.com/pydio/cells/v4/common/storage/boltdb"
	_ "github.com/pydio/cells/v4/common/storage/mem"
	_ "github.com/pydio/cells/v4/common/storage/mongo"
	_ "github.com/pydio/cells/v4/common/storage/sql"
)

var (
	//go:embed config-storage-test.yaml
	storageTestTemplate string
)

func TestManager(t *testing.T) {
	v := viper.New()
	v.Set("name", "discovery")
	v.Set("tags", "storages")
	v.Set("yaml", storageTestTemplate)
	runtime.SetRuntime(v)

	ctx := context.Background()

	manager, err := NewManager(ctx, "main", nil)
	if err != nil {
		t.Error("cannot run test", err)
		t.Fail()
		return
	}

	ctx = servercontext.WithRegistry(ctx, manager.Registry())

	Convey("Testing the manager connections", t, func() {
		Convey("SQLite", func() {
			var db *gorm.DB
			err := manager.GetStorage(ctx, "sql", &db)
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
			var cli *mongo.Client
			err := manager.GetStorage(ctx, "mongo", &cli)
			So(err, ShouldBeNil)

			cli.Database("test").CreateCollection(ctx, "collection")
		})
	})

	// Add service
	svc := service.NewService(
		service.Name("service.test"),
		service.Context(ctx),
		service.WithStorage("sqlite", func(db *gorm.DB) {
			fmt.Println("db")
		}),
		service.WithGeneric(func(c context.Context, srv *generic.Server) error {
			return nil
		}),
	)

	svc.Start()
}
