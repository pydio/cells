package sql

import (
	"context"
	"database/sql"
	"testing"

	"github.com/spf13/viper"

	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"

	_ "embed"
	_ "github.com/pydio/cells/v4/common/registry/config"
)

var (
	//go:embed gorm_test.yaml
	storageTestTemplate string
)

func TestController(t *testing.T) {
	v := viper.New()
	v.Set("name", "discovery")
	v.Set("tags", "storages")
	v.Set("yaml", storageTestTemplate)
	runtime.SetRuntime(v)

	ctx := context.Background()

	mg, err := manager.NewManager(ctx, "main", nil)
	if err != nil {
		t.Error("cannot run test", err)
		t.Fail()
		return
	}

	var db *sql.DB
	if err := mg.GetStorage(ctx, "sql1", &db); err != nil {
		panic(err)
	}
}

func MustAs[T any](in any) T {
	return in.(T)
}
