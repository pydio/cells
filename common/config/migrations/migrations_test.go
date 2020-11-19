package migrations

import (
	"fmt"
	"testing"

	json "github.com/pydio/cells/x/jsonx"

	"github.com/pydio/cells/x/configx"
	. "github.com/smartystreets/goconvey/convey"
)

func PrettyPrint(v interface{}) (err error) {
	b, err := json.MarshalIndent(v, "", "  ")
	if err == nil {
		fmt.Println(string(b))
	}
	return
}

func TestUpdateKeys(t *testing.T) {

	// Create new config
	conf := configx.New(configx.WithJSON())
	conf.Set(data)

	Convey("UpdateKeys", t, func() {

		PrettyPrint(conf.Map())

		err := UpdateKeys(conf, map[string]string{"#non-existing": "new-value"})
		So(err, ShouldBeNil)
		PrettyPrint(conf.Map())

		err = UpdateKeys(conf, map[string]string{"services/pydio.grpc.auth": "services/pydio.grpc.oauth"})
		So(err, ShouldBeNil)
		So(conf.Val("services/pydio.grpc.oauth").Get(), ShouldNotBeNil)
		PrettyPrint(conf.Map())

	})
}
