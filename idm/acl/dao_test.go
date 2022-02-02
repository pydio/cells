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
	"fmt"
	"sync"
	"testing"

	"google.golang.org/protobuf/types/known/anypb"
	// Run tests against SQLite
	_ "github.com/mattn/go-sqlite3"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/proto/idm"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	mockDAO DAO

	options = configx.New()

	wg sync.WaitGroup
)

func TestMain(m *testing.M) {

	dao := sql.NewDAO("sqlite3", "file::memory:?mode=memory&cache=shared", "test_")
	if dao == nil {
		fmt.Print("Could not start test")
		return
	}

	mockDAO = NewDAO(dao).(DAO)
	if err := mockDAO.Init(options); err != nil {
		fmt.Print("Could not start test ", err)
		return
	}

	m.Run()
	wg.Wait()
}

func TestQueryBuilder(t *testing.T) {

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

		s := sql.NewQueryBuilder(simpleQuery, new(queryConverter)).Expression("sqlite")
		So(s, ShouldNotBeNil)
		//So(s, ShouldEqual, `(role_id in (select id from idm_acl_roles where uuid in ("role1"))) OR (role_id in (select id from idm_acl_roles where uuid in ("role2")))`)
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

		s := sql.NewQueryBuilder(composedQuery, new(queryConverter)).Expression("sqlite")
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

		s := sql.NewQueryBuilder(composedQuery, new(queryConverter)).Expression("sqlite")
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

		s := sql.NewQueryBuilder(composedQuery, new(queryConverter)).Expression("sqlite")
		So(s, ShouldNotBeNil)
		//So(s, ShouldEqual, `((action_name='read' OR action_name='write')) AND (role_id in (select id from idm_acl_roles where uuid in ("role1","role2"))) AND (node_id in (select id from idm_acl_nodes where uuid in ("node1")))`)
	})
}
