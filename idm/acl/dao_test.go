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
	"testing"

	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/dao/sqlite"
	"github.com/pydio/cells/v4/common/proto/idm"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/test"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = []test.StorageTestCase{
		{[]string{sqlite.Driver + "://" + sqlite.SharedMemDSN}, true, NewDAO},
	}
)

//func TestMain(m *testing.M) {
//	var options = configx.New()
//
//	dialector := gsqlite.Open(sqlite.SharedMemDSN)
//	mockDB, _ = gorm.Open(dialector, &gorm.Config{
//		//DisableForeignKeyConstraintWhenMigrating: true,
//		FullSaveAssociations: true,
//		Logger:               logger.Default.LogMode(logger.Info),
//	})
//
//	if d, e := dao.InitDAO(context.TODO(), sqlite.Driver, sqlite.SharedMemDSN, "role", NewDAO, options); e != nil {
//		panic(e)
//	} else {
//		mockDAO = d.(DAO)
//	}
//
//	m.Run()
//	wg.Wait()
//}

func TestQueryBuilder(t *testing.T) {
	test.RunStorageTests(testcases, func(ctx context.Context) {

		dao, err := manager.Resolve[DAO](ctx)
		if err != nil {
			panic(err)
		}

		mockDB := dao.(*sqlimpl).DB

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

			s := sql.NewGormQueryBuilder(simpleQuery, new(queryConverter)).Build(ctx, mockDB)
			So(s, ShouldNotBeNil)

			sql := s.(*gorm.DB).ToSQL(func(tx *gorm.DB) *gorm.DB {
				return tx.Find(&[]ACL{})
			})

			So(sql, ShouldResemble, `SELECT * FROM idm_acls WHERE role_id IN (SELECT * FROM idm_acl_roles WHERE uuid IN ("role1")) OR role_id IN (SELECT * FROM idm_acl_roles WHERE uuid IN ("role2"))`)
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

			s := sql.NewGormQueryBuilder(composedQuery, new(queryConverter)).Build(ctx, mockDB)
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

			s := sql.NewGormQueryBuilder(composedQuery, new(queryConverter)).Build(ctx, mockDB)
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

			s := sql.NewGormQueryBuilder(composedQuery, new(queryConverter)).Build(ctx, mockDB)
			So(s, ShouldNotBeNil)
			//So(s, ShouldEqual, `((action_name='read' OR action_name='write')) AND (role_id in (select id from idm_acl_roles where uuid in ("role1","role2"))) AND (node_id in (select id from idm_acl_nodes where uuid in ("node1")))`)
		})
	})
}
