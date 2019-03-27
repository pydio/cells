package mtree

import (
	"testing"

	"github.com/smartystreets/goconvey/convey"
)

var mockPath = MPath{2, 4, 2}

func TestPath(t *testing.T) {
	convey.Convey("Test generation of a sibling path", t, func() {

		p := mockPath.Sibling()

		convey.So(p, convey.ShouldResemble, MPath{2, 4, 3})
	})

	convey.Convey("Test generation of a parent path", t, func() {

		p := mockPath.Parent()

		convey.So(p, convey.ShouldResemble, MPath{2, 4})
	})
}
