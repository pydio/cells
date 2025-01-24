package test

import (
	"context"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"text/template"

	"github.com/spf13/viper"
	"go.uber.org/zap"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage"
	"github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/uuid"

	_ "github.com/pydio/cells/v5/common/config/memory"
	_ "github.com/pydio/cells/v5/common/registry/config"
	_ "github.com/pydio/cells/v5/common/server/grpc"
	_ "github.com/pydio/cells/v5/common/storage/bleve"
	_ "github.com/pydio/cells/v5/common/storage/boltdb"
	_ "github.com/pydio/cells/v5/common/storage/config"
	_ "github.com/pydio/cells/v5/common/storage/mongodb"
	_ "github.com/pydio/cells/v5/common/storage/sql"
	_ "github.com/pydio/cells/v5/common/utils/cache/gocache"
)

type StorageTestCase struct {
	DSN       []string
	Condition bool
	DAO       any
	Label     string
}

type ServicesStorageTestCase struct {
	DSN       map[string]string
	Condition bool
	Services  map[string]map[string]any
	Label     string
}

func init() {
	sql.TestPrintQueries = false
}

// TemplateSQL returns a single SQL test case with the provided DAO func
func TemplateSQL(daoFunc any) []StorageTestCase {
	unique := uuid.New()[:6]
	ss := []StorageTestCase{
		{
			DSN:       []string{sql.SqliteDriver + "://" + sql.SharedMemDSN + "&hookNames=cleanTables&prefix=" + unique},
			Condition: os.Getenv("CELLS_TEST_SKIP_SQLITE") != "true",
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
		Condition: os.Getenv("CELLS_TEST_SKIP_LOCAL_INDEX") != "true",
		DAO:       daoFunc,
	}
}

// TemplateBleveWithPrefix creates a StorageTestCase for BleveDB
func TemplateBleveWithPrefix(daoFunc any, prefix string) StorageTestCase {
	return StorageTestCase{
		DSN:       []string{"bleve://" + filepath.Join(os.TempDir(), prefix+uuid.New()+".db")},
		Condition: os.Getenv("CELLS_TEST_SKIP_LOCAL_INDEX") != "true",
		DAO:       daoFunc,
	}
}

var (
	caser = cases.Title(language.English)
)

var (
	singleYAML = `
listeners:
  bufconn:
    type: bufconn
    bufsize: 1048576
connections:
  grpc:
    type: grpc
    uri: passthrough://bufnet
    listener: bufconn
    services:
      - filter: "{{ .Name }} ~= .*"
servers:
  grpc:
    type: grpc
    listener: bufconn
    services:
      - filter: "{{ .Name }} ~= .*"
caches:
  local:
    uri: pm://
  shared:
    uri: pm://
`

	singleTpl *template.Template
)

func init() {
	var err error
	singleTpl, err = template.New("test").Parse(singleYAML)
	if err != nil {
		panic(err)
	}
}

func RunTests(t *testing.T, init func(context.Context), f func(context.Context)) {
	ctx, cancel := context.WithCancel(context.Background())

	v := viper.New()
	v.Set(runtime.KeyConfig, "mem://")
	v.SetDefault(runtime.KeyArgTags, []string{"test"})
	v.Set(runtime.KeyBootstrapYAML, singleYAML)

	mem, _ := config.OpenStore(ctx, "mem://")
	ctx = propagator.With(ctx, config.ContextKey, mem)

	runtime.SetRuntime(v)

	init(ctx)

	mgr, err := manager.NewManager(ctx, "test", nil)
	if err != nil {
		t.Fatal(err)
	}

	ctx = mgr.Context()
	ctx = runtime.MultiContextManager().RootContext(ctx)

	mgr.ServeAll()

	log.SetLoggerInit(func(ctx context.Context) (*zap.Logger, []io.Closer) {
		cfg := zap.NewDevelopmentConfig()
		cfg.OutputPaths = []string{"stdout"}
		cfg.Level = zap.NewAtomicLevelAt(zap.DebugLevel)
		z, _ := cfg.Build()

		return z, nil
	}, nil)

	t.Run("Testing with server", func(t *testing.T) {
		f(ctx)
		cancel()
	})

	<-ctx.Done()
}

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
		runner := func(t *testing.T) {
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
		}
		if t != nil {
			t.Run(label, runner)
		} else {
			runner(nil)
		}

		//_ = manager.CloseStoragesForContext(ctx, manager.WithCleanBeforeClose())
	}
}

// RunServicesTests initialize a runtime and run the tests cases with correct DAOs in context
func RunServicesTests(testCases []ServicesStorageTestCase, t *testing.T, f func(context.Context)) {
	for _, tc := range testCases {
		if !tc.Condition {
			continue
		}
		runner := func(t *testing.T) {
			ctx, err := manager.MockServicesToContextDAO(context.Background(), tc.DSN, tc.Services)
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
		}
		if t != nil {
			t.Run(tc.Label, runner)
		} else {
			runner(nil)
		}

		//_ = manager.CloseStoragesForContext(ctx, manager.WithCleanBeforeClose())
	}
}
