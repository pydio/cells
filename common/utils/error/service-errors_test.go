package error

import (
	"fmt"
	"testing"

	// Silently import convey to ease implementation
	. "github.com/smartystreets/goconvey/convey"
)

func TestServiceErrorsUtils(t *testing.T) {
	Convey("Given an error", t, func() {
		Convey("When having a permission port issue", func() {
			err := fmt.Errorf("listen tcp :80: bind: permission denied")
			Convey("IsErrorPortPermissionDenied should return true", func() {
				isErr, port := IsErrorPortPermissionDenied(err)
				So(isErr, ShouldBeTrue)
				So(port, ShouldEqual, 80)
			})
			Convey("IsErrorPortBusy should return false", func() {
				So(IsErrorPortBusy(err), ShouldBeFalse)
			})
		})
		Convey("When having a permission port issue with port > than 1024", func() {
			err := fmt.Errorf("listen tcp :8080: bind: permission denied")
			Convey("IsErrorPortPermissionDenied should return false", func() {
				isErr, port := IsErrorPortPermissionDenied(err)
				So(isErr, ShouldBeFalse)
				So(port, ShouldEqual, 0)
			})
			Convey("IsErrorPortBusy should return false", func() {
				So(IsErrorPortBusy(err), ShouldBeFalse)
			})
		})
		Convey("When having a port busy error", func() {
			err := fmt.Errorf("listen tcp 0.0.0.0:4222: bind: address already in use")
			Convey("IsErrorPortPermissionDenied should return false", func() {
				isErr, port := IsErrorPortPermissionDenied(err)
				So(isErr, ShouldBeFalse)
				So(port, ShouldEqual, 0)
			})
			Convey("IsErrorPortBusy should return true", func() {
				So(IsErrorPortBusy(err), ShouldBeTrue)
			})
		})
	})
}
