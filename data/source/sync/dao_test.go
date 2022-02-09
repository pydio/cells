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

package sync

import (
	"fmt"
	"testing"

	_ "github.com/mattn/go-sqlite3"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	mockDAO DAO
)

func TestMain(m *testing.M) {
	options := configx.New()

	sqlDAO, _ := sql.NewDAO("sqlite3", "file::memory:?mode=memory&cache=shared", "test")
	if sqlDAO == nil {
		fmt.Print("Could not start test")
		return
	}

	d := NewDAO(sqlDAO)
	if err := d.Init(options); err != nil {
		fmt.Print("Could not start test ", err)
		return
	}

	mockDAO = d.(DAO)

	m.Run()
}

func TestNewMemChecksumMapper(t *testing.T) {
	Convey("Test ChecksumMapper in memory", t, func() {
		mockDAO.Set("eTag-1", "checksum")
		v, o := mockDAO.Get("eTag-1")
		So(v, ShouldEqual, "checksum")
		So(o, ShouldBeTrue)

		v2, o2 := mockDAO.Get("eTag-2")
		So(v2, ShouldBeEmpty)
		So(o2, ShouldBeFalse)

		c := mockDAO.Purge([]string{"eTag-1"})
		So(c, ShouldEqual, 0)

		c = mockDAO.Purge([]string{"eTag-other"})
		So(c, ShouldEqual, 1)
	})
}
