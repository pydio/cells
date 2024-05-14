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

package acl

import (
	"context"
	"fmt"
	"testing"

	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/proto/idm"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/test"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = test.TemplateSQL(NewDAO)
)

func TestQueryBuilder(t *testing.T) {
	test.RunStorageTests(testcases, func(ctx context.Context) {

		dao, err := manager.Resolve[DAO](ctx)
		if err != nil {
			panic(err)
		}

		mockDB := dao.(*sqlimpl).DB

		Convey("Simple CRUD", t, func() {
			So(simpleCrud(t, ctx, dao, "node", "role", "workspace", "actionName", "actionValue"), ShouldBeNil)
		})

		Convey("Query Builder", t, func() {

			singleQ1, singleQ2 := new(idm.ACLSingleQuery), new(idm.ACLSingleQuery)

			singleQ1.RoleIDs = []string{"role1"}
			singleQ2.RoleIDs = []string{"role2"}

			singleQ1Any, err := anypb.New(singleQ1)
			So(err, ShouldBeNil)

			singleQ2Any, err := anypb.New(singleQ2)
			So(err, ShouldBeNil)

			var singleQueries []*anypb.Any
			singleQueries = append(singleQueries, singleQ1Any)
			singleQueries = append(singleQueries, singleQ2Any)

			simpleQuery := &service.Query{
				SubQueries: singleQueries,
				Operation:  service.OperationType_OR,
				Offset:     0,
				Limit:      10,
			}

			s, er := sql.NewQueryBuilder[*gorm.DB](simpleQuery, new(queryConverter)).Build(ctx, mockDB)
			So(er, ShouldBeNil)
			So(s, ShouldNotBeNil)

			sqlStr := s.ToSQL(func(tx *gorm.DB) *gorm.DB {
				return tx.Find(&[]ACL{})
			})

			So(sqlStr, ShouldResemble, "SELECT * FROM `acls` WHERE role_id IN (SELECT `id` FROM `roles` WHERE uuid IN (\"role1\")) OR role_id IN (SELECT `id` FROM `roles` WHERE uuid IN (\"role2\")) LIMIT 10")
		})

		Convey("Single Query Builder", t, func() {

			singleQ1 := new(idm.ACLSingleQuery)

			singleQ1.RoleIDs = []string{"role1"}

			singleQ1Any, err := anypb.New(singleQ1)
			So(err, ShouldBeNil)

			var singleQueries []*anypb.Any
			singleQueries = append(singleQueries, singleQ1Any)

			simpleQuery := &service.Query{
				SubQueries: singleQueries,
				Operation:  service.OperationType_OR,
				Offset:     0,
				Limit:      10,
			}

			s, er := sql.NewQueryBuilder[*gorm.DB](simpleQuery, new(queryConverter)).Build(ctx, mockDB)
			So(er, ShouldBeNil)
			So(s, ShouldNotBeNil)

			sqlStr := s.ToSQL(func(tx *gorm.DB) *gorm.DB {
				return tx.Find(&[]ACL{})
			})

			So(sqlStr, ShouldResemble, "SELECT * FROM `acls` WHERE role_id IN (SELECT `id` FROM `roles` WHERE uuid IN (\"role1\")) LIMIT 10")
		})

		Convey("Query Builder W/ subquery", t, func() {

			singleQ1, singleQ2, singleQ3 := new(idm.ACLSingleQuery), new(idm.ACLSingleQuery), new(idm.ACLSingleQuery)

			singleQ1.RoleIDs = []string{"role1"}
			singleQ2.RoleIDs = []string{"role2"}
			singleQ3.RoleIDs = []string{"role3_1", "role3_2", "role3_3"}

			singleQ1Any, err := anypb.New(singleQ1)
			So(err, ShouldBeNil)

			singleQ2Any, err := anypb.New(singleQ2)
			So(err, ShouldBeNil)

			singleQ3Any, err := anypb.New(singleQ3)
			So(err, ShouldBeNil)

			subQuery1 := &service.Query{
				SubQueries: []*anypb.Any{singleQ1Any, singleQ2Any},
				Operation:  service.OperationType_OR,
			}

			subQuery2 := &service.Query{
				SubQueries: []*anypb.Any{singleQ3Any},
			}

			subQuery1Any, err := anypb.New(subQuery1)
			So(err, ShouldBeNil)

			subQuery2Any, err := anypb.New(subQuery2)
			So(err, ShouldBeNil)

			composedQuery := &service.Query{
				SubQueries: []*anypb.Any{
					subQuery1Any,
					subQuery2Any,
				},
				Offset:    0,
				Limit:     10,
				Operation: service.OperationType_AND,
			}

			s, er := sql.NewQueryBuilder[*gorm.DB](composedQuery, new(queryConverter)).Build(ctx, mockDB)
			So(er, ShouldBeNil)
			So(s, ShouldNotBeNil)
			//So(s, ShouldEqual, `((role_id in (select id from idm_acl_roles where uuid in ("role1"))) OR (role_id in (select id from idm_acl_roles where uuid in ("role2")))) AND (role_id in (select id from idm_acl_roles where uuid in ("role3_1","role3_2","role3_3")))`)
		})

		Convey("Query Builder W/ subquery", t, func() {

			singleQ1 := new(idm.ACLSingleQuery)

			singleQ1.Actions = []*idm.ACLAction{&idm.ACLAction{Name: "read", Value: "read_val"}, &idm.ACLAction{Name: "write", Value: "write_val"}}

			singleQ1Any, err := anypb.New(singleQ1)
			So(err, ShouldBeNil)

			composedQuery := &service.Query{
				SubQueries: []*anypb.Any{
					singleQ1Any,
				},
				Offset:    0,
				Limit:     10,
				Operation: service.OperationType_AND,
			}

			s, er := sql.NewQueryBuilder[*gorm.DB](composedQuery, new(queryConverter)).Build(ctx, mockDB)
			So(er, ShouldBeNil)
			So(s, ShouldNotBeNil)
			//So(s, ShouldEqual, `((action_name='read' AND action_value='read_val') OR (action_name='write' AND action_value='write_val'))`)
		})

		Convey("Query Builder W/ subquery", t, func() {

			singleQ1, singleQ2, singleQ3 := new(idm.ACLSingleQuery), new(idm.ACLSingleQuery), new(idm.ACLSingleQuery)

			singleQ1.Actions = []*idm.ACLAction{&idm.ACLAction{Name: "read"}, &idm.ACLAction{Name: "write"}}
			singleQ2.RoleIDs = []string{"role1", "role2"}
			singleQ3.NodeIDs = []string{"node1"}

			singleQ1Any, err := anypb.New(singleQ1)
			So(err, ShouldBeNil)

			singleQ2Any, err := anypb.New(singleQ2)
			So(err, ShouldBeNil)

			singleQ3Any, err := anypb.New(singleQ3)
			So(err, ShouldBeNil)

			composedQuery := &service.Query{
				SubQueries: []*anypb.Any{
					singleQ1Any, singleQ2Any, singleQ3Any,
				},
				Offset:    0,
				Limit:     10,
				Operation: service.OperationType_AND,
			}

			s, er := sql.NewQueryBuilder[*gorm.DB](composedQuery, new(queryConverter)).Build(ctx, mockDB)
			So(er, ShouldBeNil)
			So(s, ShouldNotBeNil)
			sqlStr := s.ToSQL(func(tx *gorm.DB) *gorm.DB {
				return tx.Find(&[]ACL{})
			})
			So(sqlStr, ShouldNotBeEmpty)
			//So(s, ShouldEqual, `((action_name='read' OR action_name='write')) AND (role_id in (select id from idm_acl_roles where uuid in ("role1","role2"))) AND (node_id in (select id from idm_acl_nodes where uuid in ("node1")))`)
		})
	})
}

func simpleCrud(t *testing.T, ctx context.Context, dao DAO, nodeId, roleId, wsId, actionName, actionValue string) error {
	a := &idm.ACL{
		NodeID:      nodeId,
		RoleID:      roleId,
		WorkspaceID: wsId,
		Action:      &idm.ACLAction{Name: actionName, Value: actionValue},
	}
	if e := dao.Add(ctx, a); e != nil {
		t.Errorf("Add %v", e)
	}
	var res []interface{}
	readQ, _ := anypb.New(&idm.ACLSingleQuery{
		NodeIDs: []string{nodeId},
		RoleIDs: []string{roleId},
		//WorkspaceIDs: []string{wsId},
		//Actions:      []*idm.ACLAction{{Name: actionName, Value: actionValue}},
	})
	enquirer := &service.Query{SubQueries: []*anypb.Any{readQ}}
	err := dao.Search(ctx, enquirer, &res, nil)
	if err != nil {
		return fmt.Errorf("Search %v", err)
	}
	if len(res) != 1 {
		return fmt.Errorf("No ACL found with nodeId %s", nodeId)
	}
	num, er := dao.Del(ctx, enquirer, nil)
	if er != nil {
		return fmt.Errorf("Del %v", er)
	}
	if num != 1 {
		return fmt.Errorf("Del Affected Rows should be 1, got %d", num)
	}
	return nil
}

func FuzzInsert(f *testing.F) {
	test.RunStorageTests(testcases, func(ctx context.Context) {
		dao, err := manager.Resolve[DAO](ctx)
		if err != nil {
			panic(err)
		}
		f.Add("node1", "role1", "ws1", "read", "1")
		f.Fuzz(func(t *testing.T, nodeId, roleId, wsId, actionName, actionValue string) {
			if er := simpleCrud(t, ctx, dao, nodeId, roleId, wsId, actionName, actionValue); er != nil {
				t.Errorf("%v", er)
			}
		})
	})
}
