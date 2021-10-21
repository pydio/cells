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

package docstore

import (
	"os"
	"path/filepath"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func newPath(tmpName string) string {
	return filepath.Join(os.TempDir(), tmpName)
}

func TestNewBleveEngine(t *testing.T) {

	Convey("Test Bleve Creation", t, func() {

		p := newPath("docstore-tmp.bleve")
		s, e := NewBleveEngine(p, true)
		So(e, ShouldBeNil)
		So(s, ShouldNotBeNil)
		e = s.Close()
		So(e, ShouldBeNil)
		stat, _ := os.Stat(p)
		So(stat, ShouldBeNil)

	})

	Convey("Test Bleve Clear", t, func() {

		p := newPath("docstore-tmp.bleve")
		s, e := NewBleveEngine(p, true)
		So(e, ShouldBeNil)
		So(s, ShouldNotBeNil)
		//		defer s.Close()

		e = s.Reset()
		So(e, ShouldBeNil)

	})

}
