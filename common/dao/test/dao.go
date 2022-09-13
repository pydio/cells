package test

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/conn"
	"os"
	"strings"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/bleve"
	"github.com/pydio/cells/v4/common/dao/mongodb"
	"github.com/pydio/cells/v4/common/utils/configx"

	// Import all drivers
	_ "github.com/pydio/cells/v4/common/dao/bleve"
	_ "github.com/pydio/cells/v4/common/dao/boltdb"
	_ "github.com/pydio/cells/v4/common/dao/mongodb"
	_ "github.com/pydio/cells/v4/common/dao/sqlite"
)

func OnFileTestDAO(driver, dsn, prefix, altPrefix string, asIndexer bool, wrapper dao.DaoWrapperFunc) (dao.DAO, func(), error) {

	ctx := context.Background()
	cfg := configx.New()
	mongoEnv := os.Getenv("CELLS_TEST_MONGODB_DSN")
	if (driver == "boltdb" || driver == "bleve") && altPrefix != "" && mongoEnv != "" {
		// Replace DAO with a Mongo Driver
		driver = "mongodb"
		dsn = mongoEnv
		prefix = altPrefix
	}

	var c conn.Conn
	var d dao.DAO
	var e error

	c, e = conn.InitConn(ctx, driver, dsn)

	if asIndexer {
		d, e = dao.InitIndexer(ctx, driver, dsn, prefix, wrapper, c, cfg)
	} else {
		d, e = dao.InitDAO(ctx, driver, dsn, prefix, wrapper, c, cfg)
	}
	if e != nil {
		return nil, nil, e
	}

	closer := func() {}
	switch driver {
	case "boltdb", "bleve":
		bleve.UnitTestEnv = true
		closer = func() {
			d.CloseConn(ctx)
			dropFile := dsn
			if strings.Contains(dsn, "?") {
				dropFile = strings.Split(dsn, "?")[0]
			}
			if er := os.RemoveAll(dropFile); er != nil {
				fmt.Println("Closer : cannot drop on-file db", dropFile, er)
			} else {
				fmt.Println("Closer : dropped on-file db", dropFile)
			}
		}
	case "mongodb":
		closer = func() {
			fmt.Println("Closer : dropping collection", prefix)
			d.(mongodb.DAO).DB().Drop(context.Background())
			d.CloseConn(ctx)
		}
	}

	return d, closer, nil

}
