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

	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/proto/jobs"

	. "github.com/smartystreets/goconvey/convey"
)

func TestCompressAction_GetName(t *testing.T) {
	Convey("Test GetName", t, func() {
		metaAction := &CompressAction{}
		So(metaAction.GetName(), ShouldEqual, compressActionName)
	})
}

func TestCompressAction_Init(t *testing.T) {

	Convey("Test init", t, func() {

		action := &CompressAction{}
		job := &jobs.Job{}

		// Signals the environment that we are unit testing,
		// so that we do not try to initialise the client pool.
		nodes.IsUnitTestEnv = true

		// Test default parameters
		e := action.Init(job, &jobs.Action{})
		So(action.Format, ShouldEqual, "zip")

		// Valid Cmd
		e = action.Init(job, &jobs.Action{
			Parameters: map[string]string{
				"format": "tar.gz",
				"target": "path",
			},
		})
		So(e, ShouldBeNil)
		So(action.Format, ShouldEqual, "tar.gz")
		So(action.TargetName, ShouldEqual, "path")
	})
}
