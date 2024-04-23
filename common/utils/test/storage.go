package test

import (
	"context"
	"fmt"
	"reflect"

	"github.com/pydio/cells/v4/common/storage"
)

type StorageTestCase struct {
	DSN       string
	Condition bool
	DAO       any
}

func RunStorageTests(ctx context.Context, testCases []StorageTestCase, f any) {
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

			reflect.ValueOf(f).Call(out)
		} else {
			panic("wrong type")
		}
	}
}
