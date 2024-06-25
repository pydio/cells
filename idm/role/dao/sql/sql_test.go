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
	"testing"
	"time"

	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/test"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/idm/role"

	_ "github.com/pydio/cells/v4/common/utils/cache/gocache"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = test.TemplateSQL(NewDAO)
)

func TestCrud(t *testing.T) {

	test.RunStorageTests(testcases, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[role.DAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Create Role", t, func() {
			{
				_, _, err := mockDAO.Add(ctx, &idm.Role{
					Label: "",
				})
				So(err, ShouldNotBeNil)
				//So(errors.Is(err, errors.StatusNotFound), ShouldBeTrue)
			}
			{
				r, _, err := mockDAO.Add(ctx, &idm.Role{
					Label:       "Create Role",
					LastUpdated: int32(time.Now().Unix()),
				})

				So(err, ShouldBeNil)
				So(r.Uuid, ShouldNotBeEmpty)
			}
		})

		Convey("Get Role", t, func() {

			roleUuid := uuid.New()
			gRoleUuid := uuid.New()
			roleTime := int32(time.Now().Unix())
			_, _, err := mockDAO.Add(ctx, &idm.Role{
				Uuid:        roleUuid,
				Label:       "New Role",
				LastUpdated: roleTime,
				GroupRole:   false,
			})

			So(err, ShouldBeNil)
			_, _, err2 := mockDAO.Add(ctx, &idm.Role{
				Uuid:        gRoleUuid,
				Label:       "Group Role",
				LastUpdated: roleTime,
				GroupRole:   true,
			})
			So(err2, ShouldBeNil)
			_, _, err3 := mockDAO.Add(ctx, &idm.Role{
				Uuid:        uuid.New(),
				Label:       "User Role",
				LastUpdated: roleTime,
				UserRole:    true,
			})
			So(err3, ShouldBeNil)
			ownedUUID := uuid.New()
			_, _, err4 := mockDAO.Add(ctx, &idm.Role{
				Uuid:          ownedUUID,
				Label:         "Owned Role",
				LastUpdated:   roleTime,
				ForceOverride: true,
			})
			So(err4, ShouldBeNil)
			err5 := mockDAO.AddPolicy(ctx, roleUuid, &service.ResourcePolicy{
				Action:  service.ResourcePolicyAction_ANY,
				Subject: "policytest",
				Effect:  service.ResourcePolicy_allow,
			})
			So(err5, ShouldBeNil)

			singleQ := &idm.RoleSingleQuery{
				Uuid: []string{roleUuid},
			}
			resourceQ := &service.ResourcePolicyQuery{
				Subjects: []string{"policytest", "policytest2"},
			}
			singleQA, _ := anypb.New(singleQ)
			resourceQA, _ := anypb.New(resourceQ)
			query := &service.Query{
				SubQueries: []*anypb.Any{
					singleQA,
					resourceQA,
				},
			}
			var roles []*idm.Role

			e := mockDAO.Search(ctx, query, &roles)
			So(e, ShouldBeNil)
			So(roles, ShouldHaveLength, 1)
			for _, role := range roles {
				So(role.Uuid, ShouldEqual, roleUuid)
				So(role.Label, ShouldEqual, "New Role")
				So(role.LastUpdated, ShouldEqual, roleTime)
				So(role.GroupRole, ShouldBeFalse)
				So(role.UserRole, ShouldBeFalse)
				break
			}

			{
				c, e := mockDAO.Count(ctx, &service.Query{})
				So(e, ShouldBeNil)
				So(c, ShouldEqual, 5)
			}

			{
				count, e2 := mockDAO.Count(ctx, query)
				So(e2, ShouldBeNil)
				So(count, ShouldEqual, 1)
			}

			{
				count, e2 := mockDAO.Delete(ctx, query)
				So(e2, ShouldBeNil)
				So(count, ShouldEqual, 1)
			}

			{
				count, e2 := mockDAO.Count(ctx, query)
				So(e2, ShouldBeNil)
				So(count, ShouldEqual, 0)
			}

			{
				c, e := mockDAO.Count(ctx, &service.Query{})
				So(e, ShouldBeNil)
				So(c, ShouldEqual, 4)
			}

			{
				singleQA, _ := anypb.New(&idm.RoleSingleQuery{
					IsGroupRole: true,
				})
				query := &service.Query{
					SubQueries: []*anypb.Any{singleQA},
				}
				c, e := mockDAO.Count(ctx, query)
				So(e, ShouldBeNil)
				So(c, ShouldEqual, 1)
			}

			{
				singleQA, _ := anypb.New(&idm.RoleSingleQuery{
					IsGroupRole: true,
					Not:         true,
				})
				query := &service.Query{
					SubQueries: []*anypb.Any{singleQA},
				}
				c, e := mockDAO.Count(ctx, query)
				So(e, ShouldBeNil)
				So(c, ShouldEqual, 3)
			}

			{
				singleQA, _ := anypb.New(&idm.RoleSingleQuery{
					IsUserRole: true,
				})
				query := &service.Query{
					SubQueries: []*anypb.Any{singleQA},
				}
				c, e := mockDAO.Count(ctx, query)
				So(e, ShouldBeNil)
				So(c, ShouldEqual, 1)
			}

			{
				singleQA, _ := anypb.New(&idm.RoleSingleQuery{
					IsUserRole: true,
					Not:        true,
				})
				query := &service.Query{
					SubQueries: []*anypb.Any{singleQA},
				}
				c, e := mockDAO.Count(ctx, query)
				So(e, ShouldBeNil)
				So(c, ShouldEqual, 3)
			}

			{
				singleQA, _ := anypb.New(&idm.RoleSingleQuery{
					Uuid: []string{ownedUUID},
				})
				query := &service.Query{
					SubQueries: []*anypb.Any{singleQA},
				}
				roles = []*idm.Role{}
				e := mockDAO.Search(ctx, query, &roles)
				So(e, ShouldBeNil)
				So(roles, ShouldHaveLength, 1)
				So(roles[0].ForceOverride, ShouldBeTrue)
			}
			{
				singleQA, _ := anypb.New(&idm.RoleSingleQuery{
					Label: "Create*",
				})
				query := &service.Query{
					SubQueries: []*anypb.Any{singleQA},
				}
				c, e := mockDAO.Count(ctx, query)
				So(e, ShouldBeNil)
				So(c, ShouldEqual, 1)
			}

			{
				_, _, err2 := mockDAO.Add(ctx, &idm.Role{
					Uuid:        gRoleUuid,
					Label:       "Rename Role",
					LastUpdated: 0,
					GroupRole:   true,
				})
				So(err2, ShouldBeNil)
			}

		})
	})

}

func TestQueryBuilder(t *testing.T) {

	test.RunStorageTests(testcases, func(ctx context.Context) {

		dao, err := manager.Resolve[role.DAO](ctx)
		if err != nil {
			panic(err)
		}

		mockDB := dao.(*sqlimpl).db

		Convey("Query Builder", t, func() {

			singleQ1, singleQ2 := new(idm.RoleSingleQuery), new(idm.RoleSingleQuery)

			singleQ1.Uuid = []string{"role1"}
			singleQ2.Uuid = []string{"role2"}

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

			s, er := sql.NewQueryBuilder[*gorm.DB](simpleQuery, new(queryBuilder)).Build(ctx, mockDB)
			So(er, ShouldBeNil)
			So(s, ShouldNotBeNil)

			sqlStr := s.ToSQL(func(tx *gorm.DB) *gorm.DB {
				return tx.Find(&[]idm.Role{})
			})
			So(sqlStr, ShouldEqual, "SELECT * FROM `roles` WHERE `uuid` = \"role1\" OR `uuid` = \"role2\" LIMIT 10")

		})

		Convey("Query Builder W/ subquery", t, func() {

			singleQ1, singleQ2, singleQ3 := new(idm.RoleSingleQuery), new(idm.RoleSingleQuery), new(idm.RoleSingleQuery)

			singleQ1.Uuid = []string{"role1"}
			singleQ2.Uuid = []string{"role2"}
			singleQ3.Uuid = []string{"role3_1", "role3_2", "role3_3"}

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

			s, er := sql.NewQueryBuilder[*gorm.DB](composedQuery, new(queryBuilder)).Build(ctx, mockDB)
			So(er, ShouldBeNil)
			So(s, ShouldNotBeNil)
			sqlStr := s.ToSQL(func(tx *gorm.DB) *gorm.DB {
				return tx.Find(&[]idm.Role{})
			})

			So(sqlStr, ShouldEqual, "SELECT * FROM `roles` WHERE (`uuid` = \"role1\" OR `uuid` = \"role2\") AND `uuid` IN (\"role3_1\",\"role3_2\",\"role3_3\") LIMIT 10")

		})
	})
}

func TestResourceRules(t *testing.T) {
	test.RunStorageTests(testcases, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[role.DAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Test Add Rule", t, func() {

			err := mockDAO.AddPolicy(ctx, "resource-id", &service.ResourcePolicy{Action: service.ResourcePolicyAction_READ, Subject: "subject1"})
			So(err, ShouldBeNil)

		})

		Convey("Select Rules", t, func() {

			rules, err := mockDAO.GetPoliciesForResource(ctx, "resource-id")
			So(rules, ShouldHaveLength, 1)
			So(err, ShouldBeNil)

		})

		Convey("Delete Rules", t, func() {

			err := mockDAO.DeletePoliciesForResource(ctx, "resource-id")
			So(err, ShouldBeNil)

			rules, err := mockDAO.GetPoliciesForResource(ctx, "resource-id")
			So(rules, ShouldHaveLength, 0)
			So(err, ShouldBeNil)

		})

		Convey("Delete Rules For Action", t, func() {

			e := mockDAO.AddPolicy(ctx, "resource-id", &service.ResourcePolicy{Action: service.ResourcePolicyAction_READ, Subject: "subject1"})
			So(e, ShouldBeNil)
			e = mockDAO.AddPolicy(ctx, "resource-id", &service.ResourcePolicy{Action: service.ResourcePolicyAction_WRITE, Subject: "subject1"})
			So(e, ShouldBeNil)

			rules, err := mockDAO.GetPoliciesForResource(ctx, "resource-id")
			So(rules, ShouldHaveLength, 2)

			err = mockDAO.DeletePoliciesForResourceAndAction(ctx, "resource-id", service.ResourcePolicyAction_READ)
			So(err, ShouldBeNil)

			rules, err = mockDAO.GetPoliciesForResource(ctx, "resource-id")
			So(rules, ShouldHaveLength, 1)
			So(err, ShouldBeNil)

		})
	})
}
