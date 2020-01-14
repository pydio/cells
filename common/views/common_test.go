package views

import (
	"context"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/tree"
)

func TestWalkFilterSkipPydioHiddenFile(t *testing.T) {
	Convey("Test skip .pydio files", t, func() {

		t1 := WalkFilterSkipPydioHiddenFile(context.Background(), &tree.Node{Path: "/toto/tata/.pydio"})
		So(t1, ShouldBeFalse)

		t2 := WalkFilterSkipPydioHiddenFile(context.Background(), &tree.Node{Path: "/toto/tata"})
		So(t2, ShouldBeTrue)

	})
}
