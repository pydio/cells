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

package schedule

import (
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"
)

func TestComputeNextWait(t *testing.T) {

	Convey("Compute Next Wait", t, func() {

		ticker, err := NewTickerScheduleFromISO("R/2012-06-04T19:25:16.828696-07:00/PT5M")
		So(err, ShouldBeNil)
		waiter := NewTicker(ticker, func() error {
			return nil
		})
		wait, stop := waiter.computeNextWait()
		So(stop, ShouldBeFalse)
		So(wait, ShouldBeGreaterThanOrEqualTo, 0)
		So(wait, ShouldBeLessThanOrEqualTo, 5*time.Minute)

	})

	Convey("Compute Next Wait With Repeat expired", t, func() {

		ticker, err := NewTickerScheduleFromISO("R1/2012-06-04T19:25:16.828696-07:00/PT5M")
		So(err, ShouldBeNil)
		waiter := NewTicker(ticker, func() error {
			return nil
		})
		_, stop := waiter.computeNextWait()
		So(stop, ShouldBeTrue)

	})

	Convey("Compute Next Wait Without interval", t, func() {

		now := time.Now().Add(2 * time.Second)
		ticker, err := NewTickerScheduleFromISO("R1/" + now.Format(time.RFC3339Nano) + "/")
		So(err, ShouldBeNil)
		waiter := NewTicker(ticker, func() error {
			return nil
		})
		checkNow := time.Now().Add(10 * time.Millisecond)
		wait, stop := waiter.computeNextWait()
		So(stop, ShouldBeFalse)
		So(wait, ShouldBeBetweenOrEqual, now.Sub(checkNow), 2000*time.Millisecond)

	})

}
