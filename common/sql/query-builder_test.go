package sql

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestDeleteStringFromExpression(t *testing.T) {
	Convey("Test Delete String Expr", t, func() {
		s, e := DeleteStringFromExpression("tableName", "mysql", nil)
		So(s, ShouldBeEmpty)
		So(e, ShouldNotBeNil)
	})
}
