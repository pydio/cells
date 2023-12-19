package jobs

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestDataSelector_PreParseJsonPath(t *testing.T) {
	Convey("Test Preparse JsonPath", t, func() {
		ds := &DataSelector{}
		i, j, v, ee := ds.PreParseJsonPath("$.Vars.VarName.*")
		So(i, ShouldBeFalse)
		So(j, ShouldBeFalse)
		So(v, ShouldBeTrue)
		So(ee, ShouldHaveLength, 1)
		So(ee[0], ShouldEqual, "VarName")

		i, j, v, ee = ds.PreParseJsonPath("$.Vars.VarName")
		So(i, ShouldBeFalse)
		So(j, ShouldBeFalse)
		So(v, ShouldBeTrue)
		So(ee, ShouldHaveLength, 1)
		So(ee[0], ShouldEqual, "VarName")

		i, j, v, ee = ds.PreParseJsonPath("$.Vars.VarName.*.SubList.*")
		So(i, ShouldBeFalse)
		So(j, ShouldBeFalse)
		So(v, ShouldBeTrue)
		So(ee, ShouldHaveLength, 1)
		So(ee[0], ShouldEqual, "VarName")

		i, j, v, ee = ds.PreParseJsonPath("$.Vars")
		So(i, ShouldBeFalse)
		So(j, ShouldBeFalse)
		So(v, ShouldBeTrue)
		So(ee, ShouldHaveLength, 0)

		i, j, v, ee = ds.PreParseJsonPath("$.Vars.*.Subset.*")
		So(i, ShouldBeFalse)
		So(j, ShouldBeFalse)
		So(v, ShouldBeTrue)
		So(ee, ShouldHaveLength, 0)

		i, j, v, ee = ds.PreParseJsonPath("$.Input.Nodes")
		So(i, ShouldBeTrue)
		So(j, ShouldBeFalse)
		So(v, ShouldBeFalse)
		So(ee, ShouldHaveLength, 0)

		i, j, v, ee = ds.PreParseJsonPath("$.JsonBody")
		So(i, ShouldBeFalse)
		So(j, ShouldBeTrue)
		So(v, ShouldBeFalse)
		So(ee, ShouldHaveLength, 0)

	})

}
