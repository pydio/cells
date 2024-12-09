//go:build storage || kv

package boltdb

import (
	"context"
	"testing"

	"github.com/spf13/viper"
	"go.etcd.io/bbolt"

	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"

	_ "embed"
	_ "github.com/pydio/cells/v5/common/registry/config"
)

var (
	//go:embed boltdb_test.yaml
	storageTestTemplate string
)

// SkipTestController TODO may need some rewrite
func SkipTestController(t *testing.T) {
	v := viper.New()
	v.Set(runtime.KeyConfig, "mem://")
	v.Set(runtime.KeyName, "discovery")
	v.Set(runtime.KeyArgTags, "storages")
	v.Set(runtime.KeyBootstrapYAML, storageTestTemplate)
	runtime.SetRuntime(v)

	ctx := context.Background()

	mg, err := manager.NewManager(ctx, "main", nil)
	if err != nil {
		t.Error("cannot run test", err)
		t.Fail()
		return
	}

	var db *bbolt.DB
	if err := mg.GetStorage(ctx, "bolt", &db); err != nil {
		panic(err)
	}
}

func MustAs[T any](in any) T {
	return in.(T)
}
