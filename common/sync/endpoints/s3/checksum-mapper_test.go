package s3

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestNewMemChecksumMapper(t *testing.T) {
	Convey("Test ChecksumMapper in memory", t, func() {
		m := NewMemChecksumMapper()
		m.Set("eTag-1", "checksum")
		v, o := m.Get("eTag-1")
		So(v, ShouldEqual, "checksum")
		So(o, ShouldBeTrue)

		v2, o2 := m.Get("eTag-2")
		So(v2, ShouldBeEmpty)
		So(o2, ShouldBeFalse)

		c := m.Purge([]string{"eTag-1"})
		So(c, ShouldEqual, 0)

		c = m.Purge([]string{"eTag-other"})
		So(c, ShouldEqual, 1)
	})
}
