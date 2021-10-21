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

package net

import (
	"testing"
	//	"time"

	. "github.com/smartystreets/goconvey/convey"
)

func TestGetTimeFromNtp(t *testing.T) {

	Convey("Test GetTimeFromNtp", t, func() {

		//serverTimeStart := time.Now()
		_, err := GetTimeFromNtp()
		//serverTimeStop := time.Now()
		So(err, ShouldBeNil)
		//So(ntpTime.Unix(), ShouldBeBetweenOrEqual, serverTimeStart.Unix()-5, serverTimeStop.Unix()+5)

	})

}
