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

package grpc

import (
	"context"
	"fmt"
	"sync"
	"testing"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	_ "github.com/mattn/go-sqlite3"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/dao"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/service/proto"
	commonsql "github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/idm/role"
)

var (
	ctx     context.Context
	wg      sync.WaitGroup
	roleDAO role.DAO
)

func TestMain(m *testing.M) {

	// var err error

	// db, err := sql.Open("sqlite3", "file::memory:?mode=memory&cache=shared")
	// if err != nil {
	// 	log.Fatal("Could not start test ", err)
	// 	return
	// }
	// mockDB := &commonsql.SQLConn{DB: db}

	// options := config.NewMap()
	// options.Set("database", mockDB)
	// options.Set("exclusive", true)
	// options.Set("prepare", true)

	// roleDAO = role.NewSQLite()
	// if err := roleDAO.Init(options); err != nil {
	// 	log.Fatal("Could not start test ", err)
	// 	return
	// }

	// Instantiate and initialise the role DAO Mock
	sqlDao := commonsql.NewDAO("sqlite3", "file::memory:?mode=memory&cache=shared", "")
	roleDAO = role.NewDAO(sqlDao).(role.DAO)
	options := config.NewMap()
	options.Set("database", roleDAO)
	options.Set("exclusive", true)
	options.Set("prepare", true)
	err := (roleDAO.(dao.DAO)).Init(*options)
	if err != nil {
		fmt.Print("could not start test ", err)
		return
	}

	ctx = servicecontext.WithDAO(context.Background(), roleDAO.(dao.DAO))

	m.Run()
	wg.Wait()
}

func TestRole(t *testing.T) {

	s := new(Handler)

	Convey("Create Roles", t, func() {
		resp := new(idm.CreateRoleResponse)
		err := s.CreateRole(ctx, &idm.CreateRoleRequest{Role: &idm.Role{Uuid: "role1", Label: "Role 1"}}, resp)

		So(err, ShouldBeNil)
		So(resp.GetRole().GetUuid(), ShouldEqual, "role1")

	})

	Convey("Create Roles", t, func() {
		resp := new(idm.CreateRoleResponse)
		err := s.CreateRole(ctx, &idm.CreateRoleRequest{Role: &idm.Role{Uuid: "role2", Label: "Role 2"}}, resp)

		So(err, ShouldBeNil)
		So(resp.GetRole().GetUuid(), ShouldEqual, "role2")
	})

	Convey("Create Role with Comma", t, func() {
		resp := new(idm.CreateRoleResponse)
		err := s.CreateRole(ctx, &idm.CreateRoleRequest{Role: &idm.Role{Uuid: "dn=toto,dn=zz", Label: "Role Fail"}}, resp)
		So(err, ShouldNotBeNil)
	})

	Convey("Get Role", t, func() {
		mock := &roleStreamMock{}
		err := s.StreamRole(ctx, mock)

		So(err, ShouldBeNil)
		So(len(mock.InternalBuffer), ShouldEqual, 0)
	})

	Convey("Search Role", t, func() {
		mock := &roleStreamMock{}
		err := s.SearchRole(ctx, &idm.SearchRoleRequest{}, mock)

		So(err, ShouldBeNil)
		So(len(mock.InternalBuffer), ShouldEqual, 2)
	})

	Convey("Delete Role", t, func() {
		err := s.DeleteRole(ctx, &idm.DeleteRoleRequest{}, &idm.DeleteRoleResponse{})
		So(err, ShouldNotBeNil)
	})

	Convey("Delete Role", t, func() {
		singleQ1 := new(idm.RoleSingleQuery)
		singleQ1.Uuid = []string{"role1"}
		singleQ1Any, err := ptypes.MarshalAny(singleQ1)
		So(err, ShouldBeNil)

		query := &service.Query{
			SubQueries: []*any.Any{singleQ1Any},
		}

		err = s.DeleteRole(ctx, &idm.DeleteRoleRequest{Query: query}, &idm.DeleteRoleResponse{})
		So(err, ShouldBeNil)
	})

	Convey("Search Role", t, func() {
		mock := &roleStreamMock{}
		err := s.SearchRole(ctx, &idm.SearchRoleRequest{}, mock)

		So(err, ShouldBeNil)
		So(len(mock.InternalBuffer), ShouldEqual, 1)
	})
}

func TestRoleWithRules(t *testing.T) {

	s := new(Handler)
	Convey("Create Roles with Resource Rule", t, func() {

		resp := new(idm.CreateRoleResponse)
		err := s.CreateRole(ctx, &idm.CreateRoleRequest{Role: &idm.Role{Uuid: "role-res", Label: "Role 1"}}, resp)

		So(err, ShouldBeNil)
		So(resp.GetRole().GetUuid(), ShouldEqual, "role-res")

		err = roleDAO.AddPolicy("role-res", &service.ResourcePolicy{
			Action:  service.ResourcePolicyAction_READ,
			Subject: "user:subject-name",
		})
		So(err, ShouldBeNil)

	})

	Convey("Find Roles with Resource", t, func() {

		singleQ, _ := ptypes.MarshalAny(&idm.RoleSingleQuery{Uuid: []string{"role-res"}})

		// Search with wrong context
		simpleQuery := &service.Query{
			SubQueries: []*any.Any{singleQ},
			Offset:     0,
			Limit:      10,
			ResourcePolicyQuery: &service.ResourcePolicyQuery{
				Subjects: []string{"profile:anon"},
			},
		}

		mock := &roleStreamMock{}
		err := s.SearchRole(ctx, &idm.SearchRoleRequest{
			Query: simpleQuery,
		}, mock)

		So(err, ShouldBeNil)
		So(len(mock.InternalBuffer), ShouldEqual, 0)

		// Search with "ANY"
		simpleQuery.ResourcePolicyQuery.Subjects = []string{}
		mock = &roleStreamMock{}
		err = s.SearchRole(ctx, &idm.SearchRoleRequest{
			Query: simpleQuery,
		}, mock)

		So(err, ShouldBeNil)
		So(len(mock.InternalBuffer), ShouldEqual, 1)

		// Search with correct context
		// Build context with fake claims
		simpleQuery.ResourcePolicyQuery.Subjects = []string{
			"user:subject-name",
			"profile:standard",
			"role:role1",
			"role:role2",
		}

		mock = &roleStreamMock{}
		err = s.SearchRole(ctx, &idm.SearchRoleRequest{
			Query: simpleQuery,
		}, mock)

		So(err, ShouldBeNil)
		So(len(mock.InternalBuffer), ShouldEqual, 1)

	})

}

// =================================================
// * Mock *
// =================================================

type roleStreamMock struct {
	InternalBuffer []*idm.Role
}

func (x *roleStreamMock) Close() error {
	return nil
}

func (x *roleStreamMock) SendMsg(m interface{}) error {
	return nil
}

func (x *roleStreamMock) RecvMsg(m interface{}) error {
	return nil
}

func (x *roleStreamMock) Recv() (*idm.SearchRoleRequest, error) {
	return nil, nil
}

func (x *roleStreamMock) Send(m *idm.SearchRoleResponse) error {
	x.InternalBuffer = append(x.InternalBuffer, m.Role)
	return nil
}
