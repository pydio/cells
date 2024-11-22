//go:build storage || sql

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
	"testing"

	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common/proto/idm"
	service "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/idm/role"
	"github.com/pydio/cells/v5/idm/role/dao/sql"

	_ "github.com/pydio/cells/v5/common/utils/cache/gocache"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = test.TemplateSQL(sql.NewDAO)
)

func TestRole(t *testing.T) {

	s := new(Handler)
	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		Convey("Create Roles", t, func() {
			resp, err := s.CreateRole(ctx, &idm.CreateRoleRequest{Role: &idm.Role{Uuid: "role1", Label: "Role 1"}})

			So(err, ShouldBeNil)
			So(resp.GetRole().GetUuid(), ShouldEqual, "role1")

		})

		Convey("Create Roles", t, func() {
			resp, err := s.CreateRole(ctx, &idm.CreateRoleRequest{Role: &idm.Role{Uuid: "role2", Label: "Role 2"}})

			So(err, ShouldBeNil)
			So(resp.GetRole().GetUuid(), ShouldEqual, "role2")
		})

		Convey("Create Role with Comma", t, func() {
			_, err := s.CreateRole(ctx, &idm.CreateRoleRequest{Role: &idm.Role{Uuid: "dn=toto,dn=zz", Label: "Role Fail"}})
			So(err, ShouldNotBeNil)
		})

		Convey("Get Role", t, func() {
			mock := &roleStreamMock{ctx: ctx}
			err := s.StreamRole(mock)

			So(err, ShouldBeNil)
			So(len(mock.InternalBuffer), ShouldEqual, 0)
		})

		Convey("Search Role", t, func() {
			mock := &roleStreamMock{ctx: ctx}
			err := s.SearchRole(&idm.SearchRoleRequest{}, mock)

			So(err, ShouldBeNil)
			So(len(mock.InternalBuffer), ShouldEqual, 2)
		})

		Convey("Delete Role", t, func() {
			_, err := s.DeleteRole(ctx, &idm.DeleteRoleRequest{})
			So(err, ShouldNotBeNil)
		})

		Convey("Delete Role", t, func() {
			singleQ1 := new(idm.RoleSingleQuery)
			singleQ1.Uuid = []string{"role1"}
			singleQ1Any, err := anypb.New(singleQ1)
			So(err, ShouldBeNil)

			query := &service.Query{
				SubQueries: []*anypb.Any{singleQ1Any},
			}

			_, err = s.DeleteRole(ctx, &idm.DeleteRoleRequest{Query: query})
			So(err, ShouldBeNil)
		})

		Convey("Search Role", t, func() {
			mock := &roleStreamMock{ctx: ctx}
			err := s.SearchRole(&idm.SearchRoleRequest{}, mock)

			So(err, ShouldBeNil)
			So(len(mock.InternalBuffer), ShouldEqual, 1)
		})

	})

}

func TestRoleWithRules(t *testing.T) {

	s := new(Handler)

	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		dao, err := manager.Resolve[role.DAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Create Roles with Resource Rule", t, func() {

			resp, err := s.CreateRole(ctx, &idm.CreateRoleRequest{Role: &idm.Role{Uuid: "role-res", Label: "Role 1"}})

			So(err, ShouldBeNil)
			So(resp.GetRole().GetUuid(), ShouldEqual, "role-res")

			err = dao.AddPolicy(ctx, "role-res", &service.ResourcePolicy{
				Action:  service.ResourcePolicyAction_READ,
				Subject: "user:subject-name",
			})
			So(err, ShouldBeNil)

		})

		Convey("Find Roles with Resource", t, func() {

			singleQ, _ := anypb.New(&idm.RoleSingleQuery{Uuid: []string{"role-res"}})

			// Search with wrong context
			simpleQuery := &service.Query{
				SubQueries: []*anypb.Any{singleQ},
				Offset:     0,
				Limit:      10,
				ResourcePolicyQuery: &service.ResourcePolicyQuery{
					Subjects: []string{"profile:anon"},
				},
			}

			mock := &roleStreamMock{ctx: ctx}
			err := s.SearchRole(&idm.SearchRoleRequest{
				Query: simpleQuery,
			}, mock)

			So(err, ShouldBeNil)
			So(len(mock.InternalBuffer), ShouldEqual, 0)

			// Search with "ANY"
			simpleQuery.ResourcePolicyQuery = &service.ResourcePolicyQuery{
				Subjects: []string{},
			}
			mock = &roleStreamMock{ctx: ctx}
			err = s.SearchRole(&idm.SearchRoleRequest{
				Query: simpleQuery,
			}, mock)

			So(err, ShouldBeNil)
			So(len(mock.InternalBuffer), ShouldEqual, 1)

			// Search with correct context
			// Build context with fake claims
			simpleQuery.ResourcePolicyQuery = &service.ResourcePolicyQuery{
				Subjects: []string{
					"user:subject-name",
					"profile:standard",
					"role:role1",
					"role:role2",
				},
			}
			mock = &roleStreamMock{ctx: ctx}
			err = s.SearchRole(&idm.SearchRoleRequest{
				Query: simpleQuery,
			}, mock)

			So(err, ShouldBeNil)
			So(len(mock.InternalBuffer), ShouldEqual, 1)

		})
	})
}

// =================================================
// * Mock *
// =================================================

type roleStreamMock struct {
	ctx            context.Context
	InternalBuffer []*idm.Role
}

func (x *roleStreamMock) SetHeader(md metadata.MD) error {
	panic("implement me")
}

func (x *roleStreamMock) SendHeader(md metadata.MD) error {
	panic("implement me")
}

func (x *roleStreamMock) SetTrailer(md metadata.MD) {
	panic("implement me")
}

func (x *roleStreamMock) Context() context.Context {
	return x.ctx
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
