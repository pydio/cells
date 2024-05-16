package test

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"text/template"

	"github.com/spf13/viper"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/runtime/tenant"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/storage/sql"
	"github.com/pydio/cells/v4/common/utils/uuid"

	_ "github.com/pydio/cells/v4/common/registry/config"
	_ "github.com/pydio/cells/v4/common/storage/bleve"
	_ "github.com/pydio/cells/v4/common/storage/boltdb"
	_ "github.com/pydio/cells/v4/common/storage/config"
	_ "github.com/pydio/cells/v4/common/storage/mongodb"
	_ "github.com/pydio/cells/v4/common/utils/cache/gocache"
)

var (
	yaml = `
storages:
  {{- range $idx, $dsn := . }}
  storage{{ $idx }}: 
    uri: {{ $dsn }}
  {{- end }}
services:
  test:
    storages:
      main:
	    {{- range $idx, $dsn := . }}
        - type: storage{{ $idx }}
	    {{- end }}
`

	tmpl *template.Template
)

type StorageTestCase struct {
	DSN       []string
	Condition bool
	DAO       any
}

func init() {
	var err error
	tmpl, err = template.New("test").Parse(yaml)
	if err != nil {
		panic(err)
	}
}

// TemplateSQL returns a single SQL test case with the provided DAO func
func TemplateSQL(daoFunc any) []StorageTestCase {
	return []StorageTestCase{
		{
			DSN:       []string{sql.SqliteDriver + "://" + sql.SharedMemDSN + "&hookNames=cleanTables"},
			Condition: true,
			DAO:       daoFunc,
		},
		{
			DSN:       []string{sql.MySQLDriver + "://root@tcp(127.0.0.1:3306)/cellst?hookNames=cleanTables"},
			Condition: false,
			DAO:       daoFunc,
		},
	}
}

// TemplateMongoEnvWithPrefix creates a StorageTestCase for MongoDB
func TemplateMongoEnvWithPrefix(daoFunc any, prefix string) StorageTestCase {
	return StorageTestCase{
		DSN:       []string{os.Getenv("CELLS_TEST_MONGODB_DSN") + "?hookNames=cleanCollections&prefix=" + prefix},
		Condition: os.Getenv("CELLS_TEST_MONGODB_DSN") != "",
		DAO:       daoFunc,
	}
}

// TemplateMongoEnvWithPrefixAndIndexerCollection creates a StorageTestCase for MongoDB
func TemplateMongoEnvWithPrefixAndIndexerCollection(daoFunc any, prefix, collection string) StorageTestCase {
	return StorageTestCase{
		DSN:       []string{os.Getenv("CELLS_TEST_MONGODB_DSN") + "?hookNames=cleanCollections&prefix=" + prefix + "&collection=" + collection},
		Condition: os.Getenv("CELLS_TEST_MONGODB_DSN") != "",
		DAO:       daoFunc,
	}
}

// TemplateBoltWithPrefix creates a StorageTestCase for BoltDB
func TemplateBoltWithPrefix(daoFunc any, prefix string) StorageTestCase {
	return StorageTestCase{
		DSN:       []string{"boltdb://" + filepath.Join(os.TempDir(), prefix+uuid.New()+".db")},
		Condition: true,
		DAO:       daoFunc,
	}
}

// TemplateBleveWithPrefix creates a StorageTestCase for BleveDB
func TemplateBleveWithPrefix(daoFunc any, prefix string) StorageTestCase {
	return StorageTestCase{
		DSN:       []string{"bleve://" + filepath.Join(os.TempDir(), prefix+uuid.New()+".db")},
		Condition: true,
		DAO:       daoFunc,
	}
}

// RunStorageTests initialize a runtime and run the tests cases with correct DAOs in context
func RunStorageTests(testCases []StorageTestCase, f func(context.Context)) {
	for _, tc := range testCases {
		if !tc.Condition {
			continue
		}

		// read template
		b := &strings.Builder{}
		err := tmpl.Execute(b, tc.DSN)
		if err != nil {
			panic(err)
		}
		v := viper.New()
		v.Set(runtime.KeyConfig, "mem://")
		v.SetDefault(runtime.KeyCache, "pm://")
		v.SetDefault(runtime.KeyShortCache, "pm://")
		v.Set("yaml", b.String())

		// TODO - this should be handled by the controller
		store, er := config.OpenStore(context.Background(), "mem://")
		if er != nil {
			panic(er)
		}
		config.Register(store)
		runtime.SetRuntime(v)

		var svc service.Service
		runtime.Register("test", func(ctx context.Context) {
			svc = service.NewService(
				service.Name("test"),
				service.Context(ctx),
				service.WithStorageDrivers(tc.DAO),
			)
		})

		mgr, err := manager.NewManager(context.Background(), "test", nil)
		if err != nil {
			panic(err)
		}

		ctx := mgr.Context()
		ctx = runtimecontext.With(ctx, service.ContextKey, svc)
		ctx = runtimecontext.With(ctx, tenant.ContextKey, tenant.GetManager().GetMaster())

		f(ctx)

		_ = manager.CloseStoragesForContext(ctx, manager.WithCleanBeforeClose())
	}
}
