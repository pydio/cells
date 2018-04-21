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

package workspace

import (
	"fmt"
	"sync"
	"testing"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/sql"

	. "github.com/smartystreets/goconvey/convey"
	// Use SQLite backend for the tests
	_ "github.com/mattn/go-sqlite3"
)

var (
	mockDAO DAO

	wg sync.WaitGroup
)

func TestMain(m *testing.M) {

	var options config.Map

	dao := sql.NewDAO("sqlite3", "file::memory:?mode=memory&cache=shared", "test")
	if dao == nil {
		fmt.Print("Could not start test")
		return
	}

	d := NewDAO(dao)
	if err := d.Init(options); err != nil {
		fmt.Print("Could not start test ", err)
		return
	}

	mockDAO = d.(DAO)

	m.Run()
	wg.Wait()
}

func TestUniqueSlug(t *testing.T) {

	Convey("Test Unique Slug", t, func() {

		ws := &idm.Workspace{
			UUID:        "id1",
			Slug:        "my-slug",
			Label:       "label",
			Description: "description",
			Attributes:  "",
			Scope:       0,
		}

		update, err := mockDAO.Add(ws)
		So(update, ShouldBeFalse)
		So(err, ShouldBeNil)

		ws2 := &idm.Workspace{
			UUID:        "id2",
			Slug:        "my-slug",
			Label:       "label",
			Description: "description 2",
			Attributes:  "",
			Scope:       0,
		}

		update, err = mockDAO.Add(ws2)
		So(update, ShouldBeFalse)
		So(err, ShouldBeNil)
		So(ws2.Slug, ShouldEqual, "my-slug-1")

		ws3 := &idm.Workspace{
			UUID:        "id3",
			Slug:        "my-slug",
			Label:       "label",
			Description: "description 3",
			Attributes:  "",
			Scope:       0,
		}

		update, err = mockDAO.Add(ws3)
		So(update, ShouldBeFalse)
		So(err, ShouldBeNil)
		So(ws3.Slug, ShouldEqual, "my-slug-2")

		q, _ := ptypes.MarshalAny(&idm.WorkspaceSingleQuery{
			Uuid: "id2",
		})
		workspaces := new([]interface{})
		mockDAO.Search(&service.Query{
			SubQueries: []*any.Any{q},
		}, workspaces)
		So(workspaces, ShouldHaveLength, 1)
		for _, w := range *workspaces {
			result := w.(*idm.Workspace)
			So(result.UUID, ShouldEqual, "id2")
			So(result.Label, ShouldEqual, "label")
			So(result.Slug, ShouldEqual, "my-slug-1")
		}

	})

}

func TestQueryBuilder(t *testing.T) {

	Convey("Query Builder", t, func() {

		singleQ1, singleQ2 := new(idm.WorkspaceSingleQuery), new(idm.WorkspaceSingleQuery)

		singleQ1.Label = "workspace1"
		singleQ2.Label = "workspace2"

		singleQ1Any, err := ptypes.MarshalAny(singleQ1)
		So(err, ShouldBeNil)

		singleQ2Any, err := ptypes.MarshalAny(singleQ2)
		So(err, ShouldBeNil)

		var singleQueries []*any.Any
		singleQueries = append(singleQueries, singleQ1Any)
		singleQueries = append(singleQueries, singleQ2Any)

		simpleQuery := &service.Query{
			SubQueries: singleQueries,
			Operation:  service.OperationType_OR,
			Offset:     0,
			Limit:      10,
		}

		s := sql.NewDAOQuery(simpleQuery, new(queryConverter)).String()
		So(s, ShouldEqual, "(label='workspace1') OR (label='workspace2')")

	})

	Convey("Query Builder W/ subquery", t, func() {

		singleQ1, singleQ2, singleQ3 := new(idm.WorkspaceSingleQuery), new(idm.WorkspaceSingleQuery), new(idm.WorkspaceSingleQuery)

		singleQ1.Label = "workspace1"
		singleQ2.Label = "workspace2"
		singleQ3.Label = "workspace3"

		singleQ1Any, err := ptypes.MarshalAny(singleQ1)
		So(err, ShouldBeNil)

		singleQ2Any, err := ptypes.MarshalAny(singleQ2)
		So(err, ShouldBeNil)

		singleQ3Any, err := ptypes.MarshalAny(singleQ3)
		So(err, ShouldBeNil)

		subQuery1 := &service.Query{
			SubQueries: []*any.Any{singleQ1Any, singleQ2Any},
			Operation:  service.OperationType_OR,
		}

		subQuery2 := &service.Query{
			SubQueries: []*any.Any{singleQ3Any},
		}

		subQuery1Any, err := ptypes.MarshalAny(subQuery1)
		So(err, ShouldBeNil)

		subQuery2Any, err := ptypes.MarshalAny(subQuery2)
		So(err, ShouldBeNil)

		composedQuery := &service.Query{
			SubQueries: []*any.Any{
				subQuery1Any,
				subQuery2Any,
			},
			Offset:    0,
			Limit:     10,
			Operation: service.OperationType_AND,
		}

		s := sql.NewDAOQuery(composedQuery, new(queryConverter)).String()
		So(s, ShouldEqual, "((label='workspace1') OR (label='workspace2')) AND (label='workspace3')")
	})
}
