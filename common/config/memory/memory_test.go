package memory

import (
	"context"
	"fmt"
	"testing"

	"github.com/davecgh/go-spew/spew"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/openurl"

	. "github.com/smartystreets/goconvey/convey"
)

func TestMemory(t *testing.T) {
	mem := New(configx.WithJSON())

	w, err := mem.Watch()
	if err != nil {
		t.Fatal(err)
	}
	defer w.Stop()

	mem.Val("hello").Set("world")

	for {
		res, err := w.Next()
		if err != nil {
			t.Fatal(err)
		}

		if res.(configx.Values).Val("hello").String() != "world" {
			t.Fail()
		}

		break
	}
}

func TestWatch(t *testing.T) {
	mem := New(configx.WithJSON())

	w, err := mem.Watch(configx.WithPath("processes/test/processes/*"))
	if err != nil {
		t.Fatal(err)
	}
	defer w.Stop()

	if err := mem.Set([]byte(`{"processes": {
		"test": {
			"processes": {
				"test1": {
					"k1": "v1"
				},
				"test2": {
					"k2": "v2"
				}
			}
		}
	}}`)); err != nil {
		t.Fail()
	}

	for {
		res, err := w.Next()
		if err != nil {
			t.Fatal(err)
		}

		fmt.Println(res)

		break
	}
}

func TestReferencePool(t *testing.T) {
	Convey("Testing reference pool", t, func() {

		r2 := New(configx.WithJSON())
		if err := r2.Set([]byte(`{"refparam2":"refvalue2"}`)); err != nil {
			panic(err)
		}

		rp2, _ := openurl.OpenPool(context.Background(), []string{""}, func(ctx context.Context, u string) (config.Store, error) {
			return r2, nil
		})

		r1 := config.NewStoreWithReferencePool(New(configx.WithJSON()), map[string]*openurl.Pool[config.Store]{"rp": rp2})
		if err := r1.Set([]byte(`{"refparam1":{"$ref": "rp#/refparam2"}}`)); err != nil {
			panic(err)
		}

		rp1, _ := openurl.OpenPool(context.Background(), []string{""}, func(ctx context.Context, u string) (config.Store, error) {
			return r1, nil
		})

		c := config.NewStoreWithReferencePool(New(configx.WithJSON()), map[string]*openurl.Pool[config.Store]{"test1": rp1})

		c.Val("test").Set("test")
		c.Val("test[1]").Set("test")
		c.Val("test[0][1]").Set("test")
		c.Val("test[0][2]").Set(map[string]string{
			"$ref": "test1#/refparam1",
		})

		So(c.Val("test[0][1]").String(), ShouldEqual, "test")
		So(c.Val("test[0][2]").String(), ShouldEqual, "refvalue2")

		fmt.Println("Starting replacement here ")
		c.Val("test[0][2]").Set("newrefvalue1")

		spew.Dump(r2.Get())
		spew.Dump(r1.Get())
		spew.Dump(c.Get())
	})
}

func TestMarshal(t *testing.T) {
	r2 := config.NewStoreWithReferencePool(New(configx.WithJSON()), nil)

	r2.Get()

	r2.Val("whatever").Get()

	spew.Dump(r2)
}
