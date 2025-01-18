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

package sql

import (
	"context"
	"fmt"
	"sync"
	"testing"

	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/gorm"

	"github.com/pydio/cells/v5/common/proto/idm"
	service "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/idm/acl"

	. "github.com/smartystreets/goconvey/convey"
)

// Basic query builder tests
// More tests are covered by the grpc handler_test

var (
	testcases = test.TemplateSQL(NewDAO)
)

func TestSimpleCrud(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {

		dao, err := manager.Resolve[acl.DAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Simple CRUD", t, func() {
			So(simpleCrud(t, ctx, dao, "node", "role", "workspace", "actionName", "actionValue"), ShouldBeNil)
		})

	})
}

func TestParallelAdds(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {

		dao, err := manager.Resolve[acl.DAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Parallel Adds", t, func() {
			wg := sync.WaitGroup{}
			var errs []error
			for i := 0; i < 10; i++ {
				wg.Add(1)
				a := &idm.ACL{
					NodeID: "node-id",
					//RoleID:      "role-id",
					WorkspaceID: "ws-id",
					Action:      &idm.ACLAction{Name: fmt.Sprintf("action-%d", i), Value: "1"},
				}
				go func() {
					defer wg.Done()
					if e := dao.Add(ctx, a); e != nil {
						t.Log(e.Error())
						errs = append(errs, e)
					}
				}()
			}
			wg.Wait()
			So(len(errs), ShouldEqual, 0)
		})

	})
}

func TestQueryBuilder(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {

		dao, err := manager.Resolve[acl.DAO](ctx)
		if err != nil {
			panic(err)
		}

		mockDB := dao.(*sqlimpl).DB

		Convey("Simple CRUD", t, func() {
			So(simpleCrud(t, ctx, dao, "node", "role", "workspace", "actionName", "actionValue"), ShouldBeNil)
		})

		Convey("Query Builder", t, func() {

			singleQ1, singleQ2 := new(idm.ACLSingleQuery), new(idm.ACLSingleQuery)
			aa := []*idm.ACL{
				{NodeID: "n1.1", RoleID: "role1", Action: &idm.ACLAction{Name: "a1.1", Value: "v1.1"}},
				{NodeID: "n1.2", RoleID: "role2", Action: &idm.ACLAction{Name: "a1.2", Value: "v1.2"}},
			}
			So(add(t, ctx, dao, aa), ShouldBeNil)

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
			var res []interface{}
			So(dao.Search(ctx, simpleQuery, &res, nil), ShouldBeNil)
			So(len(res), ShouldEqual, 2)
			So(del(t, ctx, dao, aa), ShouldBeNil)
		})

		Convey("Single Query Builder", t, func() {

			aa := []*idm.ACL{
				{NodeID: "n2.1", RoleID: "role1", Action: &idm.ACLAction{Name: "a2.1", Value: "v2.1"}},
				{NodeID: "n2.2", RoleID: "role2", Action: &idm.ACLAction{Name: "a2.2", Value: "v2.2"}},
			}
			So(add(t, ctx, dao, aa), ShouldBeNil)

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

			s, er := service.NewQueryBuilder[*gorm.DB](simpleQuery, new(queryConverter)).Build(ctx, mockDB)
			So(er, ShouldBeNil)
			So(s, ShouldNotBeNil)

			var res []interface{}
			So(dao.Search(ctx, simpleQuery, &res, nil), ShouldBeNil)
			So(len(res), ShouldEqual, 1)
			So(res[0].(*idm.ACL).NodeID, ShouldEqual, "n2.1")
			So(del(t, ctx, dao, aa), ShouldBeNil)

		})

		Convey("Single Query Builder", t, func() {

			aa := []*idm.ACL{
				{NodeID: "nU.1", RoleID: "role1", Action: &idm.ACLAction{Name: "a2.1", Value: "v2.1"}},
				{NodeID: "nU.2", RoleID: "role2", Action: &idm.ACLAction{Name: "a2.2", Value: "v2.2"}},
			}
			So(add(t, ctx, dao, aa), ShouldBeNil)

			singleQ1 := new(idm.ACLSingleQuery)

			singleQ1.NodeIDs = []string{"nU.1"}
			singleQ1.Actions = []*idm.ACLAction{
				{Name: "a2.1", Value: "v2.1"},
				{Name: "a2.2", Value: "v2.2"},
			}

			singleQ1Any, err := anypb.New(singleQ1)
			So(err, ShouldBeNil)

			simpleQuery := &service.Query{
				SubQueries: []*anypb.Any{singleQ1Any},
				Operation:  service.OperationType_OR,
				Offset:     0,
				Limit:      10,
			}

			s, er := service.NewQueryBuilder[*gorm.DB](simpleQuery, new(queryConverter)).Build(ctx, mockDB)
			So(er, ShouldBeNil)
			So(s, ShouldNotBeNil)

			var res []interface{}
			So(dao.Search(ctx, simpleQuery, &res, nil), ShouldBeNil)
			So(len(res), ShouldEqual, 1)
			So(res[0].(*idm.ACL).NodeID, ShouldEqual, "nU.1")
			So(del(t, ctx, dao, aa), ShouldBeNil)

		})

		Convey("Query Builder W/ subquery", t, func() {

			aa := []*idm.ACL{
				{NodeID: "n3.1", RoleID: "role1", WorkspaceID: "ws1", Action: &idm.ACLAction{Name: "a3.1", Value: "v3.1"}},
				{NodeID: "n3.2", RoleID: "role2", WorkspaceID: "ws-excluded", Action: &idm.ACLAction{Name: "a3.2", Value: "v3.2"}},
				{NodeID: "n3.3", RoleID: "role3", WorkspaceID: "ws2", Action: &idm.ACLAction{Name: "a3.3", Value: "v3.3"}},
			}
			So(add(t, ctx, dao, aa), ShouldBeNil)

			singleQ1, singleQ2, singleQ3 := new(idm.ACLSingleQuery), new(idm.ACLSingleQuery), new(idm.ACLSingleQuery)

			singleQ1.RoleIDs = []string{"role1"}
			singleQ2.RoleIDs = []string{"role2"}
			singleQ3.WorkspaceIDs = []string{"ws1", "ws2"}

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

			// (Role1 or Role2) AND (Ws1 or Ws2)
			composedQuery := &service.Query{
				SubQueries: []*anypb.Any{
					subQuery1Any,
					subQuery2Any,
				},
				Offset:    0,
				Limit:     10,
				Operation: service.OperationType_AND,
			}

			s, er := service.NewQueryBuilder[*gorm.DB](composedQuery, new(queryConverter)).Build(ctx, mockDB)
			So(er, ShouldBeNil)
			So(s, ShouldNotBeNil)

			var res []interface{}
			So(dao.Search(ctx, composedQuery, &res, nil), ShouldBeNil)
			So(len(res), ShouldEqual, 1)
			So(res[0].(*idm.ACL).NodeID, ShouldEqual, "n3.1")
			So(del(t, ctx, dao, aa), ShouldBeNil)

		})

		Convey("Query Builder W/ multiple actions queries", t, func() {

			aa := []*idm.ACL{
				{NodeID: "n4.0", RoleID: "role1", Action: &idm.ACLAction{Name: "read", Value: "read_val1"}},
				{NodeID: "n4.1", RoleID: "role2", Action: &idm.ACLAction{Name: "read", Value: "read_val2"}},
				{NodeID: "n4.2", RoleID: "role2", Action: &idm.ACLAction{Name: "read", Value: "read_val-NOT"}},
				{NodeID: "n4.3", RoleID: "role3", Action: &idm.ACLAction{Name: "write", Value: "write_val"}},
				{NodeID: "n4.4", RoleID: "role3", Action: &idm.ACLAction{Name: "write", Value: "write_val-NOT"}},
				{NodeID: "n4.5", RoleID: "role4", Action: &idm.ACLAction{Name: "action_only", Value: "v4.4"}},
				{NodeID: "n4.6", RoleID: "role5", Action: &idm.ACLAction{Name: "action_only", Value: "v4.5"}},
			}
			So(add(t, ctx, dao, aa), ShouldBeNil)

			singleQ1 := new(idm.ACLSingleQuery)

			singleQ1.Actions = []*idm.ACLAction{
				{Name: "read", Value: "read_val1"},
				{Name: "read", Value: "read_val2"},
				{Name: "write", Value: "write_val"},
				{Name: "action_only"},
			}

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

			//"(action_name=\"read\" AND action_value IN (\"read_val1\",\"read_val2\"))",
			//"(action_name=\"write\" AND action_value=\"write_val\")",
			//"action_name=\"action_only\"",
			s, er := service.NewQueryBuilder[*gorm.DB](composedQuery, new(queryConverter)).Build(ctx, mockDB)
			So(er, ShouldBeNil)
			So(s, ShouldNotBeNil)

			var res []interface{}
			So(dao.Search(ctx, composedQuery, &res, nil), ShouldBeNil)
			So(len(res), ShouldEqual, 5)
			So(del(t, ctx, dao, aa), ShouldBeNil)

		})

		Convey("Query Builder W/ subquery", t, func() {

			aa := []*idm.ACL{
				{NodeID: "n5.0", RoleID: "role1", Action: &idm.ACLAction{Name: "read", Value: "read_val1"}},
				{NodeID: "n5.1", RoleID: "role2", Action: &idm.ACLAction{Name: "read", Value: "read_val2"}},
				{NodeID: "n5.2", RoleID: "role2", Action: &idm.ACLAction{Name: "write", Value: "read_val3"}},
				{NodeID: "n5.3", RoleID: "role3", Action: &idm.ACLAction{Name: "write", Value: "write_val"}},
				{NodeID: "n5.4", RoleID: "role3", Action: &idm.ACLAction{Name: "write", Value: "write_val-NOT"}},
				{NodeID: "n5.5", RoleID: "role4", Action: &idm.ACLAction{Name: "action_only", Value: "v4.4"}},
				{NodeID: "n5.6", RoleID: "role5", Action: &idm.ACLAction{Name: "action_only", Value: "v4.5"}},
			}
			So(add(t, ctx, dao, aa), ShouldBeNil)

			singleQ1, singleQ2, singleQ3 := new(idm.ACLSingleQuery), new(idm.ACLSingleQuery), new(idm.ACLSingleQuery)

			singleQ1.Actions = []*idm.ACLAction{{Name: "read"}, {Name: "write"}}
			singleQ2.RoleIDs = []string{"role1", "role2"}
			singleQ3.NodeIDs = []string{"n5.0"}

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

			s, er := service.NewQueryBuilder[*gorm.DB](composedQuery, new(queryConverter)).Build(ctx, mockDB)
			So(er, ShouldBeNil)
			So(s, ShouldNotBeNil)

			//So(s, ShouldEqual, `((action_name='read' OR action_name='write')) AND (role_id in (select id from idm_acl_roles where uuid in ("role1","role2"))) AND (node_id in (select id from idm_acl_nodes where uuid in ("node1")))`)
			var res []interface{}
			So(dao.Search(ctx, composedQuery, &res, nil), ShouldBeNil)
			So(len(res), ShouldEqual, 1)
			So(del(t, ctx, dao, aa), ShouldBeNil)

		})

		Convey("Wildcard Action Name Query", t, func() {

			aa := []*idm.ACL{
				{NodeID: "nU.1", RoleID: "role1", Action: &idm.ACLAction{Name: "a2.1", Value: "v2.1"}},
				{NodeID: "nU.2", RoleID: "role2", Action: &idm.ACLAction{Name: "a2.2", Value: "v2.2"}},
			}
			So(add(t, ctx, dao, aa), ShouldBeNil)

			singleQ1 := new(idm.ACLSingleQuery)

			singleQ1.RoleIDs = []string{"role1", "role2"}
			singleQ1.Actions = []*idm.ACLAction{{Name: "a2*"}}

			singleQ1Any, err := anypb.New(singleQ1)
			So(err, ShouldBeNil)

			simpleQuery := &service.Query{
				SubQueries: []*anypb.Any{singleQ1Any},
				Operation:  service.OperationType_AND,
				Offset:     0,
				Limit:      10,
			}

			s, er := service.NewQueryBuilder[*gorm.DB](simpleQuery, new(queryConverter)).Build(ctx, mockDB)
			So(er, ShouldBeNil)
			So(s, ShouldNotBeNil)

			var res []interface{}
			So(dao.Search(ctx, simpleQuery, &res, nil), ShouldBeNil)
			So(len(res), ShouldEqual, 2)
			So(res[0].(*idm.ACL).NodeID, ShouldEqual, "nU.1")
			So(del(t, ctx, dao, aa), ShouldBeNil)

		})

	})
}

func simpleCrud(t *testing.T, ctx context.Context, dao acl.DAO, nodeId, roleId, wsId, actionName, actionValue string) error {
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
		NodeIDs:      []string{nodeId},
		RoleIDs:      []string{roleId},
		WorkspaceIDs: []string{wsId},
		Actions:      []*idm.ACLAction{{Name: actionName, Value: actionValue}},
	})
	enquirer := &service.Query{SubQueries: []*anypb.Any{readQ}}
	err := dao.Search(ctx, enquirer, &res, nil)
	if err != nil {
		return fmt.Errorf("Search %v", err)
	}
	if len(res) != 1 {
		return fmt.Errorf("No ACL found with nodeId %s", nodeId)
	}
	a1 := res[0].(*idm.ACL)
	if a1.NodeID != nodeId {
		return fmt.Errorf("Node id %s does not match node id %s", a1.NodeID, nodeId)
	}
	if a1.RoleID != roleId {
		return fmt.Errorf("Role id %s does not match role id %s", a1.RoleID, roleId)
	}
	if a1.WorkspaceID != wsId {
		return fmt.Errorf("Workspace id %s does not match workspace id %s", a1.WorkspaceID, wsId)
	}
	if a1.Action.Name != actionName {
		return fmt.Errorf("Action name %s does not match action name %s", a1.Action.Name, actionName)
	}
	if a1.Action.Value != actionValue {
		return fmt.Errorf("Action value %s does not match action value %s", a1.Action.Value, actionValue)
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

func add(t *testing.T, ctx context.Context, dao acl.DAO, acls []*idm.ACL) error {
	for _, a := range acls {
		if er := dao.Add(ctx, a); er != nil {
			return er
		}
	}
	return nil
}

func del(t *testing.T, ctx context.Context, dao acl.DAO, acls []*idm.ACL) error {
	total := int64(0)
	for _, a := range acls {
		unique, _ := anypb.New(&idm.ACLSingleQuery{
			NodeIDs:      []string{a.NodeID},
			RoleIDs:      []string{a.RoleID},
			WorkspaceIDs: []string{a.WorkspaceID},
			Actions:      []*idm.ACLAction{a.Action},
		})
		qu := &service.Query{SubQueries: []*anypb.Any{unique}}
		if num, er := dao.Del(ctx, qu, nil); er != nil {
			return er
		} else {
			total += num
		}
	}
	if total != int64(len(acls)) {
		return fmt.Errorf("did not delete the correct number of ACLs (expected %d, got %d", len(acls), total)
	}
	return nil
}
