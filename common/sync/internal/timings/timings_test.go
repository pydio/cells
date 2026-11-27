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

package timings

import (
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"
)

func TestForTests(t *testing.T) {
	Convey("ForTests shortens timings and restores production values", t, func() {
		So(ProcessorRetryTimeout.Get(), ShouldEqual, 20*time.Second)
		So(ValidateRetryTimeout.Get(), ShouldEqual, 4*time.Minute)

		restore := ForTests()
		So(ProcessorRetryTimeout.Get(), ShouldBeLessThan, time.Second)
		So(ValidateRetryTimeout.Get(), ShouldBeLessThan, time.Second)
		So(StartConnectedDelay.Get(), ShouldBeLessThan, time.Second)

		restore()
		So(ProcessorRetryTimeout.Get(), ShouldEqual, 20*time.Second)
		So(ValidateRetryTimeout.Get(), ShouldEqual, 4*time.Minute)
		So(StartConnectedDelay.Get(), ShouldEqual, 2*time.Second)
	})
}
