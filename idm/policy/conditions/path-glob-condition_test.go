package conditions

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestPathGlobCondition(t *testing.T) {

	Convey("Test PathGlob Condition", t, func() {

		c := &PathGlobCondition{Glob: "/a/b/c/*/e"}
		So(c.Fulfills("/a/b/c/d/e", nil), ShouldBeTrue)
		So(c.Fulfills("/A/B/C/D/E", nil), ShouldBeFalse)
		So(c.Fulfills("/a/b/c", nil), ShouldBeFalse)

		c = &PathGlobCondition{Glob: "(i)/a/b/c/*/e"}
		So(c.Fulfills("/a/b/c/d/e", nil), ShouldBeTrue)
		So(c.Fulfills("/A/B/C/D/E", nil), ShouldBeTrue)
		So(c.Fulfills("/a/b/c", nil), ShouldBeFalse)

		c = &PathGlobCondition{Glob: "(ip)/a/b/c/*/e"}
		So(c.Fulfills("/a/b/c/d/e", nil), ShouldBeTrue)
		So(c.Fulfills("/A/B/C/D/E", nil), ShouldBeTrue)
		So(c.Fulfills("/a/b/c", nil), ShouldBeTrue)

		c = &PathGlobCondition{Glob: "(p)/a/b/c/*/e"}
		So(c.Fulfills("/a/b/c/d/e", nil), ShouldBeTrue)
		So(c.Fulfills("/A/B/C/D/E", nil), ShouldBeFalse)
		So(c.Fulfills("/a/b/c", nil), ShouldBeTrue)

		c = &PathGlobCondition{Glob: "(ip)/a/b/c/1222_*/*/e/*"}
		So(c.Fulfills("/a/b/c/1222_toto", nil), ShouldBeTrue)
		So(c.Fulfills("/a/b/c/1222_toto/2022/e", nil), ShouldBeTrue)
		So(c.Fulfills("/a/b/c/1222_toto/2022/e/ALL.txt", nil), ShouldBeTrue)

		c = &PathGlobCondition{Glob: "a/b/c/*/e"}
		So(c.Fulfills("a/b/c/d/e", nil), ShouldBeTrue)
		So(c.Fulfills("a/b/C/D/E", nil), ShouldBeFalse)
		So(c.Fulfills("a/b/c", nil), ShouldBeFalse)

		c = &PathGlobCondition{Glob: "(i)a/b/c/*/e"}
		So(c.Fulfills("a/b/c/d/e", nil), ShouldBeTrue)
		So(c.Fulfills("a/b/C/D/E", nil), ShouldBeTrue)
		So(c.Fulfills("a/b/c", nil), ShouldBeFalse)

		c = &PathGlobCondition{Glob: "(ip)a/b/c/*/e"}
		So(c.Fulfills("a/b/c/d/e", nil), ShouldBeTrue)
		So(c.Fulfills("a/b/C/D/E", nil), ShouldBeTrue)
		So(c.Fulfills("a/b/c", nil), ShouldBeTrue)

		c = &PathGlobCondition{Glob: "(p)a/b/c/*/e"}
		So(c.Fulfills("a/b/c/d/e", nil), ShouldBeTrue)
		So(c.Fulfills("a/b/C/D/E", nil), ShouldBeFalse)
		So(c.Fulfills("a/b/c", nil), ShouldBeTrue)

		c = &PathGlobCondition{Glob: "(ip)a/b/c/1222_*/*/e/*"}
		So(c.Fulfills("a/b/c/1222_toto", nil), ShouldBeTrue)
		So(c.Fulfills("a/b/c/1222_toto/2022/e", nil), ShouldBeTrue)
		So(c.Fulfills("a/b/c/1222_toto/2022/e/ALL.txt", nil), ShouldBeTrue)

		c = &PathGlobCondition{Glob: "(i)a/b/c/1222/ae{,/**}"}
		So(c.Fulfills("a/b/c/1222/ae", nil), ShouldBeTrue)
		So(c.Fulfills("a/b/c/1222/ae/a/b/c", nil), ShouldBeTrue)
		So(c.Fulfills("a/b/c/1222/ae/", nil), ShouldBeTrue)
		So(c.Fulfills("a/b/c/1222/be", nil), ShouldBeFalse)
		So(c.Fulfills("a/b/c/1222/aed", nil), ShouldBeFalse)
		So(c.Fulfills("a/b/c/1222/aed/", nil), ShouldBeFalse)
		So(c.Fulfills("a/b/c/1222/aed/ae", nil), ShouldBeFalse)
		So(c.Fulfills("a/b/c/1222/dae", nil), ShouldBeFalse)
	})
}

