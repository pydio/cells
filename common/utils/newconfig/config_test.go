package newconfig

import (
	"context"
	"fmt"
	"testing"

	"github.com/davecgh/go-spew/spew"

	"github.com/pydio/cells/v4/common/utils/openurl"
)

func TestSetting(t *testing.T) {

	rp, _ := openurl.OpenPool(context.Background(), []string{""}, func(ctx context.Context, u string) (Values, error) {
		r := New(WithJSON())
		if err := r.Set([]byte(`{"refparam1":"refvalue1"}`)); err != nil {
			panic(err)
		}

		return r, nil
	})

	c := New(WithJSON(), WithReferencePool(rp))

	err := c.Set([]byte(`{
		"param1": [{"param1_1": "value1_1"}, {"param1_1": "value1_2"}],
		"refparam1": {
			"$ref": "test#/refparam1"
		}
	}`)) /**/

	if err != nil {
		panic(err)
	}

	// c.Val("param1").Set("test")
	if err := c.Val("test[0]").Set([]any{struct {
		Whatever string `json:"whatever"`
	}{
		Whatever: "whatever",
	}}); err != nil {
		panic(err)
	}

	if err := c.Val("test[0][0]").Set([]any{"test"}); err != nil {
		panic(err)
	}

	spew.Dump(c.Val("refparam1").Get())

	//spew.Dump(c)
	//spew.Dump(c.Val("param1[0]").Get())
	//spew.Dump(c.Val("param1[1]").Get())
	//spew.Dump(c.Val("param2").Get())
	//
	//c.Val("param2").Set("test")
	//
	//spew.Dump(c.Val("param1[1]").Get())

}

func TestBinary(t *testing.T) {
	c := New(WithBinary())

	err := c.Set([]byte(`{
			"param1": "param1"
		}`))

	if err != nil {
		panic(err)
	}

	fmt.Println(c)

	err = c.Set(struct {
		Param1 string
	}{"structparam1"})

	if err != nil {
		panic(err)
	}

	fmt.Println(c)
}

//func TestDefaultVal(t *testing.T) {
//	Convey("Test default", t, func() {
//
//		c := New(WithJSON())
//		if err := c.Set([]byte(`{
//			"param1": "param1"
//		}`)); err != nil {
//			So(err, ShouldBeNil)
//		}
//
//		So(c.Val("param1").Default("default1").String(), ShouldEqual, "param1")
//	})
//}
