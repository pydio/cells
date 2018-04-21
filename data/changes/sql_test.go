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

package changes

import (
	"context"
	"fmt"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
	// SQLite Driver
	_ "github.com/mattn/go-sqlite3"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/context"
	commonsql "github.com/pydio/cells/common/sql"
)

var (
	ctx     context.Context
	mockDAO DAO
)

func TestMain(m *testing.M) {

	// Instantiate and initialise the mock DAO
	sqlDao := commonsql.NewDAO("sqlite3", "file::memory:?mode=memory&cache=shared", "")
	mockDAO = NewDAO(sqlDao).(DAO)
	options := config.NewMap()
	options.Set("database", mockDAO)
	options.Set("exclusive", true)
	options.Set("prepare", true)
	err := mockDAO.Init(*options)
	if err != nil {
		fmt.Print("could not start test ", err)
		return
	}

	ctx = servicecontext.WithDAO(context.Background(), mockDAO)

	m.Run()
}

func TestMysql(t *testing.T) {

	Convey("Test create a change", t, func() {
		err := mockDAO.Put(&tree.SyncChange{
			NodeId: "test",
			Type:   tree.SyncChange_create,
			Source: "test1",
			Target: "test2",
		})
		So(err, ShouldBeNil)
	})

	Convey("Test create a second change", t, func() {
		err := mockDAO.Put(&tree.SyncChange{
			NodeId: "othertest",
			Type:   tree.SyncChange_create,
			Source: "othertest",
			Target: "othertest2",
		})
		So(err, ShouldBeNil)
	})

	Convey("Search all results", t, func() {
		res, err := mockDAO.Get(0, "")
		So(err, ShouldBeNil)

		count := 0
		for range res {
			count++
		}
		So(count, ShouldEqual, 2)
	})

	Convey("Search with seq start", t, func() {
		res, err := mockDAO.Get(1, "")
		So(err, ShouldBeNil)

		count := 0
		for range res {
			count++
		}
		So(count, ShouldEqual, 1)
	})

	Convey("Search with path prefix", t, func() {
		res, err := mockDAO.Get(0, "test")
		So(err, ShouldBeNil)

		count := 0
		for range res {
			count++
		}
		So(count, ShouldEqual, 1)
	})
}
