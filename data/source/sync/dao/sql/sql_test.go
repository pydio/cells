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

package sql

import (
	"context"
	"testing"

	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage/test"
	"github.com/pydio/cells/v4/data/source/sync"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = test.TemplateSQL(NewSqlDAO)
)

func TestNewMemChecksumMapper(t *testing.T) {
	Convey("Test ChecksumMapper in memory", t, func() {
		test.RunStorageTests(testcases, t, func(ctx context.Context) {
			mockDAO, err := manager.Resolve[sync.DAO](ctx)
			So(err, ShouldBeNil)

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
	})
}
