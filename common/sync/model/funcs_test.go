package model

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestIsIgnoredFile(t *testing.T) {
	Convey("Test IsIgnoredFile", t, func() {

		So(IsIgnoredFile(".minio.sys"), ShouldBeTrue)
		So(IsIgnoredFile(".minio.system"), ShouldBeFalse)
		So(IsIgnoredFile("/.minio.sys"), ShouldBeTrue)
		So(IsIgnoredFile("/.minio.sys/toto"), ShouldBeTrue)
		So(IsIgnoredFile(".minio.sys/toto"), ShouldBeTrue)
		So(IsIgnoredFile(".minio.sys/toto/aa/zz/aqqq"), ShouldBeTrue)
		So(IsIgnoredFile("toto.minio.sys"), ShouldBeFalse)
		So(IsIgnoredFile("toto/.minio.sys"), ShouldBeTrue)
	})
}
