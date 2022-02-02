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

package idmtest

import (
	"io/ioutil"
	"path"
	"runtime"
	"sync"

	_ "github.com/doug-martin/goqu/v9/dialect/sqlite3"
	_ "github.com/mattn/go-sqlite3"
	"google.golang.org/protobuf/encoding/protojson"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/rest"
)

type TestData struct {
	Users      []*idm.User
	Workspaces []*idm.Workspace
	Roles      []*idm.Role
	ACLs       []*idm.ACL
}

func (t *TestData) WsSlugToUuid(slug string) string {
	for _, ws := range t.Workspaces {
		if ws.Slug == slug {
			return ws.UUID
		}
	}
	return ""
}

var (
	startData *TestData
	parse     sync.Once
)

func GetStartData() (*TestData, error) {
	var parseErr error
	_, filename, _, _ := runtime.Caller(0)
	parse.Do(func() {
		var bb []byte
		startData = &TestData{}
		sd := &rest.UsersCollection{}
		ws := &rest.WorkspaceCollection{}
		roles := &rest.RolesCollection{}
		acls := &rest.ACLCollection{}

		if bb, parseErr = ioutil.ReadFile(path.Join(path.Dir(filename), "testdata", "start-users.json")); parseErr != nil {
			return
		}
		if parseErr = protojson.Unmarshal(bb, sd); parseErr != nil {
			return
		}
		startData.Users = sd.Users

		if bb, parseErr = ioutil.ReadFile(path.Join(path.Dir(filename), "testdata", "start-ws.json")); parseErr != nil {
			return
		}
		if parseErr = protojson.Unmarshal(bb, ws); parseErr != nil {
			return
		}
		startData.Workspaces = ws.Workspaces

		if bb, parseErr = ioutil.ReadFile(path.Join(path.Dir(filename), "testdata", "start-roles.json")); parseErr != nil {
			return
		}
		if parseErr = protojson.Unmarshal(bb, roles); parseErr != nil {
			return
		}
		startData.Roles = roles.GetRoles()

		if bb, parseErr = ioutil.ReadFile(path.Join(path.Dir(filename), "testdata", "start-acls.json")); parseErr != nil {
			return
		}
		if parseErr = protojson.Unmarshal(bb, acls); parseErr != nil {
			return
		}
		startData.ACLs = acls.GetACLs()

	})
	return startData, parseErr
}

func RegisterIdmMocksWithData(testData *TestData) error {
	us, er := NewUsersService(testData.Users...)
	if er != nil {
		return er
	}
	grpc.RegisterMock(common.ServiceUser, us)

	rs, er := NewRolesService(testData.Roles...)
	if er != nil {
		return nil
	}
	grpc.RegisterMock(common.ServiceRole, rs)

	as, er := NewACLService(testData.ACLs...)
	if er != nil {
		return er
	}
	grpc.RegisterMock(common.ServiceAcl, as)

	ws, er := NewWorkspacesService(testData.Workspaces...)
	if er != nil {
		return er
	}
	grpc.RegisterMock(common.ServiceWorkspace, ws)

	return nil
}
