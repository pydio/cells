package test

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/mongodb"
	"github.com/pydio/cells/v4/common/utils/configx"
	"os"

	// Import all drivers
	_ "github.com/pydio/cells/v4/common/dao/bleve"
	_ "github.com/pydio/cells/v4/common/dao/boltdb"
	_ "github.com/pydio/cells/v4/common/dao/mongodb"
	_ "github.com/pydio/cells/v4/common/dao/sql"
)

func OnFileTestDAO(driver, dsn, prefix, altPrefix string, asIndexer bool, wrapper func(dao.DAO) dao.DAO) (dao.DAO, func(), error) {

	cfg := configx.New()
	mongoEnv := os.Getenv("CELLS_TEST_MONGODB_DSN")
	if (driver == "boltdb" || driver == "bleve") && altPrefix != "" && mongoEnv != "" {
		// Replace DAO with a Mongo Driver
		driver = "mongodb"
		dsn = mongoEnv
		prefix = altPrefix
	} else {
	}
	var d dao.DAO
	var e error
	if asIndexer {
		d, e = dao.InitIndexer(driver, dsn, prefix, wrapper, cfg)
	} else {
		d, e = dao.InitDAO(driver, dsn, prefix, wrapper, cfg)
	}
	if e != nil {
		return nil, nil, e
	}

	closer := func() {}
	switch driver {
	case "boltdb", "bleve":
		closer = func() {
			d.CloseConn()
			fmt.Println("Closer : dropping on-file db", dsn)
			os.Remove(dsn)
		}
	case "mongodb":
		closer = func() {
			fmt.Println("Closer : dropping collection", prefix)
			d.(mongodb.DAO).DB().Drop(context.Background())
			d.CloseConn()
		}
	}

	return d, closer, nil

}
