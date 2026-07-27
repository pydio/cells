package restv2

import (
	"testing"

	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	. "github.com/smartystreets/goconvey/convey"
)

func TestApplyLookupSort(t *testing.T) {
	Convey("An omitted sort uses the distribution default", t, func() {
		originalDefault := GetDefaultListingSort()
		SetDefaultListingSort(tree.MetaSortRecency)
		Reset(func() { SetDefaultListingSort(originalDefault) })

		bulkRequest := &rest.GetBulkMetaRequest{}
		applyLookupSort(&rest.LookupRequest{}, bulkRequest)

		So(bulkRequest.SortField, ShouldEqual, tree.MetaSortRecency)
		So(bulkRequest.SortDirDesc, ShouldBeFalse)
	})

	Convey("An explicit sort always overrides the distribution default", t, func() {
		originalDefault := GetDefaultListingSort()
		SetDefaultListingSort(tree.MetaSortRecency)
		Reset(func() { SetDefaultListingSort(originalDefault) })

		bulkRequest := &rest.GetBulkMetaRequest{}
		applyLookupSort(&rest.LookupRequest{
			SortField:   tree.MetaSortSize,
			SortDirDesc: true,
		}, bulkRequest)

		So(bulkRequest.SortField, ShouldEqual, tree.MetaSortSize)
		So(bulkRequest.SortDirDesc, ShouldBeTrue)
	})
}

func TestDefaultListingSort(t *testing.T) {
	originalDefault := GetDefaultListingSort()
	SetDefaultListingSort(tree.MetaSortNatural)
	defer SetDefaultListingSort(originalDefault)

	Convey("Upstream preserves natural listing order by default", t, func() {
		So(GetDefaultListingSort(), ShouldEqual, tree.MetaSortNatural)
	})

	Convey("An invalid distribution default fails immediately", t, func() {
		So(func() { SetDefaultListingSort("unknown") }, ShouldPanic)
		So(GetDefaultListingSort(), ShouldEqual, tree.MetaSortNatural)
	})
}
