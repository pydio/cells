package main

import (
	"context"
	"google.golang.org/grpc"
	"net"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/runtime"
	cgrpc "github.com/pydio/cells/v4/common/server/grpc"
	"github.com/pydio/cells/v4/common/storage"

	//	_ "github.com/pydio/cells/v4/data/source/index"
	_ "github.com/pydio/cells/v4/data/source/index/grpc"

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
	storage.New("main", "sqlite3", "test.db")

	var srv *grpc.Server
	cgrpc.New(ctx).As(&srv)

	lis, err := net.Listen("tcp", "0.0.0.0:4233")
	if err != nil {
		panic(err)
	}

	mainConfig, err := config.OpenStore(ctx, runtime.DefaultKeyConfig)
	config.Register(mainConfig)

	runtime.Init(ctx, "main")

	srv.Serve(lis)

	cancel()
}
