package model

import (
	"github.com/pydio/cells/v4/common/proto/tree"
	. "github.com/smartystreets/goconvey/convey"
	"testing"
)

func TestStatusMarshall(t *testing.T) {
	Convey("Test marshall interface", t, func() {
		p := NewProcessingStatus("info string")
		p.SetNode(&tree.Node{Path: "Stuff/Path", MetaStore: map[string]string{"data": "value"}})
		p.SetProgress(50)
		bb, er := p.MarshalJSON()
		So(er, ShouldBeNil)
		p1 := &ProcessingStatus{}
		e := p1.UnmarshalJSON(bb)
		So(e, ShouldBeNil)
		So(p1.String(), ShouldEqual, "info string")
		So(p1.Node(), ShouldNotBeNil)
		So(p1.Node().GetMetaStore(), ShouldHaveLength, 1)
	})
}
