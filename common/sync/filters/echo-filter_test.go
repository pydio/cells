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

package filters

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/sync/endpoints/memory"
	"github.com/pydio/cells/v4/common/sync/model"
)

func TestEchoFilter_CreateFilter(t *testing.T) {

	Convey("Test filter creation", t, func() {

		f := NewEchoFilter()
		So(f, ShouldNotBeNil)

	})

	Convey("Test CreateFilter output", t, func() {

		f := NewEchoFilter()
		out := f.Pipe(make(chan model.EventInfo))
		So(out, ShouldNotBeNil)

	})

	Convey("Test event filtering", t, func() {

		f := NewEchoFilter()
		source := memory.NewMemDB()
		f.lockFileTo(source, "/file-path", "UniqueOperationId")

		event := model.EventInfo{
			Path:   "/file-path",
			Source: source,
		}
		event2 := model.EventInfo{
			Path:   "/another-file-path",
			Source: source,
		}

		Convey("Test event is filtered out after lock", func() {
			filtered := f.filterEvent(event)
			So(filtered.OperationId, ShouldEqual, "UniqueOperationId")
		})

		Convey("Test another event is not filtered out after lock", func() {
			filtered2 := f.filterEvent(event2)
			So(filtered2.OperationId, ShouldEqual, "")
		})

		Convey("Test original event is not filtered out after unlock", func() {
			f.unlockFile(source, "/file-path")
			filteredA := f.filterEvent(event)
			So(filteredA.OperationId, ShouldEqual, "")
		})

	})

}
