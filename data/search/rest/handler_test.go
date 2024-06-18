package rest

import (
	"testing"

	"github.com/pydio/cells/v4/common/proto/idm"

	. "github.com/smartystreets/goconvey/convey"
)

func TestRegexp(t *testing.T) {
	Convey("Test shared regexp", t, func() {
		s := &Handler{}
		scope, newString, has := s.extractSharedMeta("+Meta.shared_resource_type:other")
		So(has, ShouldBeFalse)

		scope, newString, has = s.extractSharedMeta("Meta.shared_resource_type")
		So(has, ShouldBeFalse)

		scope, newString, has = s.extractSharedMeta("+Meta.shared_resource_type:any")
		So(has, ShouldBeTrue)
		So(scope, ShouldEqual, idm.WorkspaceScope_ANY)
		So(newString, ShouldEqual, "")

		scope, newString, has = s.extractSharedMeta("+Meta.stuff:value +Meta.shared_resource_type:cell")
		So(has, ShouldBeTrue)
		So(scope, ShouldEqual, idm.WorkspaceScope_ROOM)
		So(newString, ShouldEqual, "+Meta.stuff:value")

		scope, newString, has = s.extractSharedMeta("+Meta.shared_resource_type:link +Meta.stuff:value")
		So(has, ShouldBeTrue)
		So(scope, ShouldEqual, idm.WorkspaceScope_LINK)
		So(newString, ShouldEqual, "+Meta.stuff:value")
	})
}
