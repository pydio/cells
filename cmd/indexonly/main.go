package main

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/index/scorch"
	"github.com/blevesearch/bleve/v2/index/upsidedown/store/boltdb"
	"github.com/manifoldco/promptui"
	"github.com/pydio/cells/v4/common/crypto"
	cellssqlite "github.com/pydio/cells/v4/common/dao/sqlite"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime/manager"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	bolt "go.etcd.io/bbolt"
	"go.mongodb.org/mongo-driver/mongo"
	mongooptions "go.mongodb.org/mongo-driver/mongo/options"
	"net"
	"os"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/runtime"
	cgrpc "github.com/pydio/cells/v4/common/server/grpc"
	"github.com/pydio/cells/v4/common/storage"

	//	_ "github.com/pydio/cells/v4/data/source/index"
	// _ "github.com/pydio/cells/v4/data/source/index/grpc"

	_ "github.com/pydio/cells/v4/idm/meta/grpc"

	// Config drivers
	_ "github.com/pydio/cells/v4/common/config/file"
	_ "github.com/pydio/cells/v4/common/config/memory"

	// Registry
	_ "github.com/pydio/cells/v4/common/registry/config"

	// Broker
	_ "gocloud.dev/pubsub/mempubsub"

	// DAO Drivers
	_ "github.com/pydio/cells/v4/common/dao/bleve"
	_ "github.com/pydio/cells/v4/common/dao/boltdb"
	_ "github.com/pydio/cells/v4/common/dao/mongodb"
	_ "github.com/pydio/cells/v4/common/dao/mysql"

	// Servers
	_ "github.com/pydio/cells/v4/common/server/grpc"
)

func main() {
	common.PackageType = "PydioHome"
	common.PackageLabel = "Pydio Cells Home Edition"

	ctx, cancel := context.WithCancel(context.Background())

	sqliteConn1, _ := sql.Open(cellssqlite.Driver, "test1.db")
	storage.Register(sqliteConn1, "", "")

	sqliteConn2, _ := sql.Open(cellssqlite.Driver, "test2.db")
	storage.Register(sqliteConn2, "whatever", "pydio.grpc.meta")

	boltConn, _ := bolt.Open("versions.db", os.ModePerm, &bolt.Options{})
	storage.Register(boltConn, "boltdb", "pydio.grpc.versions")

	var bleveConn bleve.Index
	if _, err := os.Stat("docstore.bleve"); !os.IsNotExist(err) {
		bleveConn, _ = bleve.Open("docstore.bleve")
	} else {
		bleveConn, err = bleve.NewUsing("docstore.bleve", bleve.NewIndexMapping(), scorch.Name, boltdb.Name, nil)
		if err != nil {
			panic(err)
		}
	}
	storage.Register(bleveConn, "boltdb", "pydio.grpc.docstore")

	mongoConn, _ := mongo.Connect(ctx, mongooptions.Client().ApplyURI("mongodb://localhost:27017"))
	storage.Register(mongoConn, "mongodb", "pydio.grpc.versions")

	// Keyring store
	keyringStore, err := config.OpenStore(ctx, runtime.DefaultKeyKeyring)
	if err != nil {
		panic(err)
	}
	// Keyring start and creation of the master password
	keyring := crypto.NewConfigKeyring(keyringStore, crypto.WithAutoCreate(true, func(s string) {
		fmt.Println(promptui.IconWarn + " [Keyring] " + s)
	}))
	password, err := keyring.Get(common.ServiceGrpcNamespace_+common.ServiceUserKey, common.KeyringMasterKey)
	if err != nil {
		panic(err)
	}
	runtime.SetVaultMasterKey(password)

	ctx = servicecontext.WithKeyring(ctx, keyring)

	reg, err := registry.OpenRegistry(ctx, "mem:///?cache=plugins&byname=true")
	if err != nil {
		panic(err)
	}

	mainConfig, err := config.OpenStore(ctx, runtime.DefaultKeyConfig)
	config.Register(mainConfig)

	runtime.Register("main", func(ctx context.Context) {
		lis, err := net.Listen("tcp", "0.0.0.0:4233")
		if err != nil {
			panic(err)
		}

		cgrpc.New(ctx, cgrpc.WithListener(lis))
	})

	managerLogger := log.Logger(servicecontext.WithServiceName(ctx, "pydio.server.manager"))
	m := manager.NewManager(ctx, reg, "mem:///?cache=plugins", "main", managerLogger)
	if err := m.Init(ctx); err != nil {
		panic(err)
	}

	m.ServeAll()

	<-ctx.Done()

	cancel()
}
