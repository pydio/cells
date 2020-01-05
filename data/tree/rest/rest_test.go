package rest

import (
	"testing"

	"github.com/pydio/cells/common/proto/tree"
	. "github.com/smartystreets/goconvey/convey"
)

func TestHandler_deduplication(t *testing.T) {

	Convey("Test deduplication", t, func() {

		nn := []*tree.Node{
			{Path: "/toto"},
			{Path: "/toto"},
			{Path: "/toto"},
			{Path: "/toto2"},
			{Path: "/toto3"},
			{Path: "/toto"},
		}

		h := &Handler{}
		n2 := h.deduplicateByPath(nn)

		So(n2, ShouldHaveLength, 3)
		t.Log(n2)

	})

}
