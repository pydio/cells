package jsonx

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/pydio/cells/x/configx"

	. "github.com/smartystreets/goconvey/convey"
)

func TestJSON(t *testing.T) {
	Convey("Testing json marshal", t, func() {
		data := map[string]interface{}{
			"test": map[string]string{
				"test": "test",
			},
		}

		b, err := MarshalIndent(data, "", "  ")
		So(err, ShouldBeNil)
		fmt.Println(string(b))

	})

	
}
