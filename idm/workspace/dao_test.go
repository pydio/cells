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
	"context"
	"github.com/pydio/cells/v4/common/conn"
	"sync"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/sqlite"
	"github.com/pydio/cells/v4/common/proto/idm"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	mockDAO DAO

	wg sync.WaitGroup
)

func TestMain(m *testing.M) {

	var options = configx.New()
	ctx := context.Background()
	c, _ := conn.InitConn(ctx, sqlite.Driver, sqlite.SharedMemDSN)
	if d, e := dao.InitDAO(ctx, sqlite.Driver, sqlite.SharedMemDSN, "workspaces", NewDAO, c, options); e != nil {
		panic(e)
	} else {
		mockDAO = d.(DAO)
	}

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

		q, _ := anypb.New(&idm.WorkspaceSingleQuery{
			Uuid: "id2",
		})
		workspaces := new([]interface{})
		mockDAO.Search(&service.Query{
			SubQueries: []*anypb.Any{q},
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

func TestSearch(t *testing.T) {

	Convey("Query Builder", t, func() {

		workspaces := []*idm.Workspace{
			&idm.Workspace{
				UUID:        "ws1",
				Slug:        "admin-files",
				Label:       "Admin Files",
				Attributes:  "{}",
				Description: "Reserved for admin",
				Scope:       idm.WorkspaceScope_ADMIN,
			},

			&idm.Workspace{
				UUID:        "ws2",
				Slug:        "common",
				Label:       "Common",
				Attributes:  "{}",
				Description: "Shared files",
				Scope:       idm.WorkspaceScope_ROOM,
			},

			&idm.Workspace{
				UUID:        "ws3",
				Slug:        "admins-share",
				Label:       "Admin shared files",
				Attributes:  "{}",
				Description: "Shared files for admin ",
				Scope:       idm.WorkspaceScope_ADMIN,
			},

			&idm.Workspace{
				UUID:        "ws4",
				Slug:        "public",
				Label:       "Public",
				Attributes:  "{}",
				Description: "Public access files",
				Scope:       idm.WorkspaceScope_ANY,
			},
		}

		for _, ws := range workspaces {
			_, err := mockDAO.Add(ws)
			So(err, ShouldBeNil)
		}

		// Asked for worspace - with ROOM Scope
		singleq := new(idm.WorkspaceSingleQuery)
		singleq.Scope = idm.WorkspaceScope_ROOM
		a, err := anypb.New(singleq)
		So(err, ShouldBeNil)

		composedQuery := &service.Query{
			SubQueries: []*anypb.Any{a},
			Offset:     0,
			Limit:      10,
			Operation:  service.OperationType_AND,
		}

		var result []interface{}
		wdao := mockDAO.(*sqlimpl)
		err = wdao.Search(composedQuery, &result)
		So(err, ShouldBeNil)
		So(len(result), ShouldBeGreaterThan, 0)

		for _, wsi := range result {
			if ws, ok := wsi.(*idm.Workspace); ok {
				So(ws.Slug, ShouldBeIn, []string{"common"})
			}
		}

		result = []interface{}{}
		mockDAO.Search(composedQuery, &result)
		So(err, ShouldBeNil)
		So(len(result), ShouldBeGreaterThan, 0)
		for _, wsi := range result {
			if ws, ok := wsi.(*idm.Workspace); ok {
				So(ws.Slug, ShouldBeIn, []string{"common"})
			}
		}

		// Get any workspaces that relates to admins
		singleq.Scope = idm.WorkspaceScope_ADMIN
		singleq.Label = "*admin*"

		a, err = anypb.New(singleq)
		So(err, ShouldBeNil)
		composedQuery.SubQueries = []*anypb.Any{a}

		result = []interface{}{}
		err = wdao.Search(composedQuery, &result)
		So(err, ShouldBeNil)
		So(len(result), ShouldBeGreaterThan, 0)
		for _, wsi := range result {
			if ws, ok := wsi.(*idm.Workspace); ok {
				So(ws.Slug, ShouldBeIn, []string{"admin-files", "admins-share"})
			}
		}

		result = []interface{}{}
		mockDAO.Search(composedQuery, &result)
		So(err, ShouldBeNil)
		So(len(result), ShouldBeGreaterThan, 0)
		for _, wsi := range result {
			if ws, ok := wsi.(*idm.Workspace); ok {
				So(ws.Slug, ShouldBeIn, []string{"admin-files", "admins-share"})
			}
		}
	})
}
