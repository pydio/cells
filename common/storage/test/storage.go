package test

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"text/template"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"

	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/storage/sql"
	"github.com/pydio/cells/v4/common/utils/uuid"

	_ "github.com/pydio/cells/v4/common/config/memory"
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
	Label     string
}

func init() {
	sql.TestPrintQueries = true
	var err error
	tmpl, err = template.New("test").Parse(yaml)
	if err != nil {
		panic(err)
	}
}

// TemplateSQL returns a single SQL test case with the provided DAO func
func TemplateSQL(daoFunc any) []StorageTestCase {
	unique := uuid.New()[:6]
	ss := []StorageTestCase{
		{
			DSN:       []string{sql.SqliteDriver + "://" + sql.SharedMemDSN + "&hookNames=cleanTables&prefix=" + unique},
			Condition: true,
			DAO:       daoFunc,
		},
	}
	if other := os.Getenv("CELLS_TEST_MYSQL_DSN"); other != "" {
		for _, dsn := range strings.Split(other, ";") {
			ss = append(ss, StorageTestCase{
				DSN:       []string{strings.TrimSpace(dsn) + "?parseTime=true&hookNames=cleanTables&prefix=" + unique},
				Condition: true,
				DAO:       daoFunc,
			})
		}
	}
	if other := os.Getenv("CELLS_TEST_PGSQL_DSN"); other != "" {
		for _, dsn := range strings.Split(other, ";") {
			ss = append(ss, StorageTestCase{
				DSN:       []string{strings.TrimSpace(dsn) + "&hookNames=cleanTables&prefix=" + unique},
				Condition: true,
				DAO:       daoFunc,
			})
		}
	}
	return ss
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

var (
	caser = cases.Title(language.English)
)

// RunStorageTests initialize a runtime and run the tests cases with correct DAOs in context
func RunStorageTests(testCases []StorageTestCase, t *testing.T, f func(context.Context)) {
	for _, tc := range testCases {
		if !tc.Condition {
			continue
		}

		label := tc.Label
		if label == "" {
			scheme := strings.SplitN(tc.DSN[0], "://", 2)[0]
			label = caser.String(scheme)
		}

		t.Run(label, func(t *testing.T) {
			/*
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

				runtime.SetRuntime(v)

				var svc service.Service
				runtime.Register("test", func(ctx context.Context) {
					svc = service.NewService(
						service.Name("test"),
						service.Context(ctx),
						service.WithStorageDrivers(tc.DAO),
						service.Migrations([]*service.Migration{{
							TargetVersion: service.FirstRun(),
							Up:            manager.StorageMigration(),
						}}),
					)
				})

				mgr, err := manager.NewManager(context.Background(), "test", nil)
				if err != nil {
					panic(err)
				}

				ctx := mgr.Context()
				ctx = propagator.With(ctx, service.ContextKey, svc)
				ctx = propagator.With(ctx, tenant.ContextKey, tenant.GetManager().GetMaster())
			*/
			ctx, err := manager.DSNtoContextDAO(context.Background(), tc.DSN, tc.DAO)
			if err != nil {
				panic(err)
			}
			f(ctx)

			// Clean up hooks - we cannot resolve gorm.DB as a Closer or Dropper...
			for _, tf := range storage.TestFinisherHooks {
				if er := tf(); er != nil {
					panic(er)
				}
			}

			// Close and drop, or just close
			if dropper, er := manager.Resolve[storage.Dropper](ctx); er == nil {
				if er = dropper.CloseAndDrop(ctx); er != nil {
					panic(er)
				}
			} else if cl, er := manager.Resolve[storage.Closer](ctx); er == nil {
				if er = cl.Close(ctx); er != nil {
					panic(er)
				}
			}
		})

		//_ = manager.CloseStoragesForContext(ctx, manager.WithCleanBeforeClose())
	}
}
