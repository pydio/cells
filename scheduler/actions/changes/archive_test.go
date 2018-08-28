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

package archive

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/jobs"
)

func TestArchiveAction(t *testing.T) {

	Convey("Given a new ArchiveAction", t, func() {
		action := &ArchiveAction{}

		Convey("Name is correctly set", func() {
			So(action.GetName(), ShouldEqual, archiveActionName)
		})

		Convey("Perform init without parameters", func() {

			job := &jobs.Job{}
			e := action.Init(job, nil, &jobs.Action{})
			So(e, ShouldBeNil)
		})

		Convey("Perform init with remainingRows count", func() {

			job := &jobs.Job{}
			e := action.Init(job, nil, &jobs.Action{
				Parameters: map[string]string{
					"remainingRows": "1000",
				},
			})
			So(e, ShouldBeNil)
			So(action.RemainingRows, ShouldEqual, 1000)
		})
	})

}
