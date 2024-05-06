package test

import (
	"context"
	"strings"
	"text/template"

	"github.com/spf13/viper"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/service"

	_ "github.com/pydio/cells/v4/common/registry/config"
	_ "github.com/pydio/cells/v4/common/storage/bleve"
	_ "github.com/pydio/cells/v4/common/storage/boltdb"
	_ "github.com/pydio/cells/v4/common/storage/config"
	_ "github.com/pydio/cells/v4/common/storage/mongo"
	_ "github.com/pydio/cells/v4/common/storage/sql"
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

		f(ctx)
	}
}
