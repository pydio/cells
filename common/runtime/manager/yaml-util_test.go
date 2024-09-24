package manager

import (
	"fmt"
	"os"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestPatchYaml(t *testing.T) {
	Convey("TestPatchYaml", t, func() {
		bb, er := os.ReadFile("./bootstrap-defaults.yaml")
		So(er, ShouldBeNil)
		pairs := []keyPair{{key: "defaults/storages/sql/uri", val: "new-sql-url"}}
		out, er := patchYaml(string(bb), pairs)
		So(er, ShouldBeNil)
		fmt.Println(out)
	})
}
