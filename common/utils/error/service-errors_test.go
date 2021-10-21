/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

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
