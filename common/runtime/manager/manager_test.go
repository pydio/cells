package manager

import (
	"context"
	"fmt"
	"testing"

	"github.com/spf13/viper"
	"go.etcd.io/bbolt"
	"go.mongodb.org/mongo-driver/mongo"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/runtime"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"github.com/pydio/cells/v4/common/server/generic"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/storage/bleve"

	_ "embed"
	_ "github.com/pydio/cells/v4/common/registry/config"
	_ "github.com/pydio/cells/v4/common/storage/boltdb"
	_ "github.com/pydio/cells/v4/common/storage/mongo"
	_ "github.com/pydio/cells/v4/common/storage/sql"

	. "github.com/smartystreets/goconvey/convey"
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
			var cli *mongo.Database
			err := manager.GetStorage(ctx, "mongo", &cli)
			So(err, ShouldBeNil)

			cli.CreateCollection(ctx, "collection")
		})

		Convey("Bolt", func() {
			var cli *bbolt.DB
			err := manager.GetStorage(ctx, "bolt", &cli)
			So(err, ShouldBeNil)

			cli.Update(func(tx *bbolt.Tx) error {
				_, err := tx.CreateBucketIfNotExists([]byte(`test`))
				return err
			})
		})

		Convey("Bleve", func() {
			var cli bleve.Indexer
			err := manager.GetStorage(ctx, "bleve", &cli)
			So(err, ShouldBeNil)

			err = cli.InsertOne(context.TODO(), "test")
			So(err, ShouldBeNil)

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
