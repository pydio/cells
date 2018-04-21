/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package lib

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestRestoreProgress(t *testing.T) {
	Convey("Testing restore progress", t, func() {
		var events []*InstallProgressEvent
		publisher := func(event *InstallProgressEvent) {
			events = append(events, event)
		}
		pg := make(chan float64)
		done := make(chan bool)
		go restoreProgress(pg, done, publisher)
		for i := 0; i < 8000; i++ {
			progress := float64(float64(i) / float64(8000))
			pg <- progress
		}
		done <- true

		So(events, ShouldHaveLength, 9)
		So(events[0].Message, ShouldEqual, "Deploying interface assets: 10% done...")
	})
}
