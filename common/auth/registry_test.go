package auth

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestRange(t *testing.T) {
	Convey("Test Range of string", t, func() {
		str := rangeFromStr("http://localhost:[30000-30005]")
		So(len(str), ShouldEqual, 6)

		strFail := rangeFromStr("http://localhost:[30000-29995]")
		So(len(strFail), ShouldEqual, 1)
	})
}
