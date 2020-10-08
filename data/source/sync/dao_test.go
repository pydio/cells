package sync

import (
	"fmt"
	"testing"

	_ "github.com/mattn/go-sqlite3"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/x/configx"
)

var (
	mockDAO DAO
)

func TestMain(m *testing.M) {
	options := configx.New()

	sqlDAO := sql.NewDAO("sqlite3", "file::memory:?mode=memory&cache=shared", "test")
	if sqlDAO == nil {
		fmt.Print("Could not start test")
		return
	}

	d := NewDAO(sqlDAO)
	if err := d.Init(options); err != nil {
		fmt.Print("Could not start test ", err)
		return
	}

	mockDAO = d.(DAO)

	m.Run()
}

func TestNewMemChecksumMapper(t *testing.T) {
	Convey("Test ChecksumMapper in memory", t, func() {
		mockDAO.Set("eTag-1", "checksum")
		v, o := mockDAO.Get("eTag-1")
		So(v, ShouldEqual, "checksum")
		So(o, ShouldBeTrue)

		v2, o2 := mockDAO.Get("eTag-2")
		So(v2, ShouldBeEmpty)
		So(o2, ShouldBeFalse)

		c := mockDAO.Purge([]string{"eTag-1"})
		So(c, ShouldEqual, 0)

		c = mockDAO.Purge([]string{"eTag-other"})
		So(c, ShouldEqual, 1)
	})
}
