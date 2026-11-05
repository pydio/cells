package nodes

import (
	"fmt"
	"sync"
	"testing"

	"github.com/pydio/cells/v5/common/errors"
	. "github.com/smartystreets/goconvey/convey"
)

func TestCopyMoveChildrenResult(t *testing.T) {
	Convey("forbidden concurrent child preserves progress and fails", t, func() {
		var result copyMoveChildrenResult
		var wg sync.WaitGroup
		wg.Add(2)
		go func() {
			defer wg.Done()
			result.record(nil)
		}()
		go func() {
			defer wg.Done()
			result.record(errors.StatusForbidden)
		}()
		wg.Wait()

		So(result.childrenMoved, ShouldEqual, 1)
		So(Is403(result.firstError()), ShouldBeTrue)
	})

	Convey("forbidden last child fails without discarding prior progress", t, func() {
		var result copyMoveChildrenResult
		result.record(nil)                                                         // A permitted sibling was moved first.
		result.record(fmt.Errorf("%w: secret-child-path", errors.StatusForbidden)) // The designated last child was denied.

		So(result.childrenMoved, ShouldEqual, 1)
		So(result.firstError(), ShouldEqual, errors.StatusForbidden)
	})

	Convey("first error remains after another child fails", t, func() {
		var result copyMoveChildrenResult
		first := fmt.Errorf("first failure")
		result.record(first)
		result.record(errors.StatusForbidden)

		So(result.firstError(), ShouldEqual, first)
		So(result.childrenMoved, ShouldEqual, 0)
	})

	Convey("all children succeed", t, func() {
		var result copyMoveChildrenResult
		result.record(nil)
		result.record(nil)

		So(result.childrenMoved, ShouldEqual, 2)
		So(result.firstError(), ShouldBeNil)
	})
}
