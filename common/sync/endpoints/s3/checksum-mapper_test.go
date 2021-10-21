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

package s3

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestNewMemChecksumMapper(t *testing.T) {
	Convey("Test ChecksumMapper in memory", t, func() {
		m := NewMemChecksumMapper()
		m.Set("eTag-1", "checksum")
		v, o := m.Get("eTag-1")
		So(v, ShouldEqual, "checksum")
		So(o, ShouldBeTrue)

		v2, o2 := m.Get("eTag-2")
		So(v2, ShouldBeEmpty)
		So(o2, ShouldBeFalse)

		c := m.Purge([]string{"eTag-1"})
		So(c, ShouldEqual, 0)

		c = m.Purge([]string{"eTag-other"})
		So(c, ShouldEqual, 1)
	})
}
