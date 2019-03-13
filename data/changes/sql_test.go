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
	"log"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
	// SQLite Driver
	_ "github.com/mattn/go-sqlite3"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/tree"
	commonsql "github.com/pydio/cells/common/sql"
)

// Rather use this than TestMain to insure we have a new empty test DB for each high level test.
func initialiseMockDao() DAO {

	// Instantiate and initialise the mock DAO
	// sqlDao := commonsql.NewDAO("sqlite3", "file::memory:?mode=memory&cache=shared", "")
	sqlDao := commonsql.NewDAO("sqlite3", "file::memory:", "")
	mockDAO := NewDAO(sqlDao).(DAO)
	options := config.NewMap()
	options.Set("database", mockDAO)
	options.Set("exclusive", true)
	options.Set("prepare", true)
	err := mockDAO.Init(*options)
	if err != nil {
		log.Fatal("could not start test: ", err)
		return nil
	}

	return mockDAO
}

func TestSqlDaoBasics(t *testing.T) {

	Convey("Given a new empty DB", t, func() {

		mockDAO := initialiseMockDao()
		defer mockDAO.CloseConn()

		Convey("First and last seq id should be 0", func() {
			first, err := mockDAO.FirstSeq()
			So(err, ShouldBeNil)
			So(first, ShouldEqual, 0)

			last, err := mockDAO.LastSeq()
			So(err, ShouldBeNil)
			So(last, ShouldEqual, 0)
		})

		Convey("Insert a single change", func() {
			err := mockDAO.Put(&tree.SyncChange{
				NodeId: "test",
				Type:   tree.SyncChange_create,
				Source: "test1",
				Target: "test2",
			})
			So(err, ShouldBeNil)

			Convey("First and last seq id should be 1", func() {
				first, err := mockDAO.FirstSeq()
				So(err, ShouldBeNil)
				So(first, ShouldEqual, 1)

				last, err := mockDAO.LastSeq()
				So(err, ShouldBeNil)
				So(last, ShouldEqual, 1)
			})

			Convey("Insert another one", func() {
				err = mockDAO.Put(&tree.SyncChange{
					NodeId: "test2",
					Type:   tree.SyncChange_create,
					Source: "test12",
					Target: "test22",
				})
				So(err, ShouldBeNil)

				Convey("First remains untouched and last increments", func() {
					first, err := mockDAO.FirstSeq()
					So(err, ShouldBeNil)
					So(first, ShouldEqual, 1)

					last, err := mockDAO.LastSeq()
					So(err, ShouldBeNil)
					So(last, ShouldEqual, 2)
				})
			})
		})
	})

	Convey("Given a new empty DB", t, func() {
		mockDAO := initialiseMockDao()
		defer mockDAO.CloseConn()

		Convey("Create 2 changes", func() {
			err := mockDAO.Put(&tree.SyncChange{
				NodeId: "test",
				Type:   tree.SyncChange_create,
				Source: "test1",
				Target: "test2",
			})
			So(err, ShouldBeNil)

			err = mockDAO.Put(&tree.SyncChange{
				NodeId: "othertest",
				Type:   tree.SyncChange_create,
				Source: "othertest",
				Target: "othertest2",
			})
			So(err, ShouldBeNil)

			Convey("Search all results", func() {
				res, err := mockDAO.Get(0, "")
				So(err, ShouldBeNil)

				count := 0
				for range res {
					count++
				}
				So(count, ShouldEqual, 2)
			})

			Convey("Search with seq start", func() {
				res, err := mockDAO.Get(1, "")
				So(err, ShouldBeNil)

				count := 0
				for range res {
					count++
				}
				So(count, ShouldEqual, 1)
			})

			Convey("Search with path prefix", func() {
				res, err := mockDAO.Get(0, "test")
				So(err, ShouldBeNil)

				count := 0
				for range res {
					count++
				}
				So(count, ShouldEqual, 1)
			})
		})
	})
}
