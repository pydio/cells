package test

import (
	"context"
	"fmt"
	"reflect"

	"github.com/spf13/viper"

	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage"

	_ "github.com/pydio/cells/v4/common/registry/config"
	_ "github.com/pydio/cells/v4/common/storage/config"
	_ "github.com/pydio/cells/v4/common/storage/sql"
	_ "github.com/pydio/cells/v4/common/utils/cache/gocache"
)

type StorageTestCase struct {
	DSN       string
	Condition bool
	DAO       any
}

func RunStorageTests(testCases []StorageTestCase, f any) {

	v := viper.New()
	v.Set(runtime.KeyConfig, "mem://")
	v.SetDefault(runtime.KeyCache, "pm://")
	v.SetDefault(runtime.KeyShortCache, "pm://")

	runtime.SetRuntime(v)

	mgr, err := manager.NewManager(context.Background(), "test", nil)
	if err != nil {
		panic(err)
	}

	ctx := mgr.Context()

	funcTestType := reflect.TypeOf(f)
	if funcTestType.Kind() != reflect.Func {
		fmt.Println("wrong test format")
		return
	}

	for _, tc := range testCases {
		if !tc.Condition {
			continue
		}

		st, err := storage.OpenStorage(ctx, tc.DSN)
		if err != nil {
			panic(err)
		}

		funcDAOType := reflect.TypeOf(tc.DAO)
		if funcDAOType.Kind() != reflect.Func {
			fmt.Println("wrong dao format")
			continue
		}

		var dao reflect.Value
		var in []reflect.Value
		if funcDAOType.NumIn() == 1 {
			dao = reflect.New(funcDAOType.In(0))
		} else if funcDAOType.NumIn() == 2 {
			in = append(in, reflect.ValueOf(ctx))
			dao = reflect.New(funcDAOType.In(1))
		}

		if st.Get(ctx, dao.Interface()) {
			in = append(in, dao.Elem())

			out := reflect.ValueOf(tc.DAO).Call(in)

			reflect.ValueOf(f).Call(append([]reflect.Value{reflect.ValueOf(ctx)}, out[0]))
		} else {
			panic("wrong type")
		}
	}
}
