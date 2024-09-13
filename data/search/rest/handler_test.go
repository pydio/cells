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

func TestFactorizePathPrefix(t *testing.T) {
	Convey("Test factorize path prefix", t, func() {
		s := &Handler{}
		mm := s.factorizePathPrefixes([]string{
			"slug1",
			"slug2",
			"slug2/path",
			"slug3/other/path",
			"slug3",
			"slug4/something/else",
			"slug4/something",
			"slug4/something/else/below",
			"slug4/keepme",
		})
		So(mm, ShouldHaveLength, 5)
		So(mm, ShouldContainKey, "slug1")
		So(mm["slug1"], ShouldBeTrue)
		So(mm, ShouldContainKey, "slug2")
		So(mm["slug2"], ShouldBeTrue)
		So(mm, ShouldContainKey, "slug3")
		So(mm["slug3"], ShouldBeTrue)
		So(mm, ShouldContainKey, "slug4/something")
		So(mm["slug4/something"], ShouldBeFalse)
		So(mm, ShouldContainKey, "slug4/keepme")
		So(mm["slug4/keepme"], ShouldBeFalse)
	})
}
