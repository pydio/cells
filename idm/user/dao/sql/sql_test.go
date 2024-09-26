//go:build storage

/*
 * Copyright (c) 2021. Abstrium SAS <team (at) pydio.com>
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
	"log"
	"testing"

	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage/test"
	"github.com/pydio/cells/v4/idm/user"
	user_model "github.com/pydio/cells/v4/idm/user/dao/sql/model"

	_ "github.com/pydio/cells/v4/common/utils/cache/gocache"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = test.TemplateSQL(NewDAO)
)

func TestQueryBuilder(t *testing.T) {

	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[user.DAO](ctx)
		if err != nil {
			panic(err)
		}

		sqliteDao := mockDAO.(*sqlimpl)
		converter := &queryConverter{
			treeDao: sqliteDao.indexDAO,
		}

		Convey("Query Builder", t, func() {

			singleQ1, singleQ2 := new(idm.UserSingleQuery), new(idm.UserSingleQuery)

			singleQ1.Login = "user1"
			singleQ1.Password = "passwordUser1"

			singleQ2.Login = "user2"
			singleQ2.Password = "passwordUser2"

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

			tx := mockDAO.(*sqlimpl).DB
			tx = tx.Session(&gorm.Session{})

			s, er := service.NewQueryBuilder[*gorm.DB](simpleQuery, converter).Build(ctx, tx)
			So(er, ShouldBeNil)
			So(s, ShouldNotBeNil)

		})

		Convey("Query Builder with join fields", t, func() {

			_, _, e := mockDAO.Add(context.TODO(), &idm.User{
				Login:     "username",
				Password:  "xxxxxxx",
				GroupPath: "/path/to/group",
			})
			So(e, ShouldBeNil)

			singleQ1, singleQ2 := new(idm.UserSingleQuery), new(idm.UserSingleQuery)
			singleQ1.GroupPath = "/path/to/group"
			singleQ1.HasRole = "a_role_name"

			singleQ2.AttributeName = idm.UserAttrHidden
			singleQ2.AttributeAnyValue = true
			//		singleQ2.Not = true

			singleQ1Any, err := anypb.New(singleQ1)
			So(err, ShouldBeNil)

			singleQ2Any, err := anypb.New(singleQ2)
			So(err, ShouldBeNil)

			var singleQueries []*anypb.Any
			singleQueries = append(singleQueries, singleQ1Any)
			singleQueries = append(singleQueries, singleQ2Any)

			simpleQuery := &service.Query{
				SubQueries: singleQueries,
				Operation:  service.OperationType_AND,
				Offset:     0,
				Limit:      10,
			}

			tx := mockDAO.(*sqlimpl).DB
			tx = tx.Session(&gorm.Session{})

			s, er := service.NewQueryBuilder[*gorm.DB](simpleQuery, converter).Build(ctx, tx)
			So(er, ShouldBeNil)
			So(s, ShouldNotBeNil)

		})

		Convey("Test DAO", t, func() {

			_, _, fail := mockDAO.Add(context.TODO(), map[string]string{})
			So(fail, ShouldNotBeNil)

			_, _, err := mockDAO.Add(context.TODO(), &idm.User{
				Login:     "username",
				Password:  "xxxxxxx",
				GroupPath: "/path/to/group",
				Attributes: map[string]string{
					idm.UserAttrDisplayName: "John Doe",
					idm.UserAttrHidden:      "false",
					"active":                "true",
				},
				Roles: []*idm.Role{
					{Uuid: "1", Label: "Role1"},
					{Uuid: "2", Label: "Role2"},
				},
			})

			So(err, ShouldBeNil)

			{
				users := new([]interface{})
				e := mockDAO.Search(context.TODO(), &service.Query{Limit: -1}, users)
				So(e, ShouldBeNil)
				So(users, ShouldHaveLength, 5)
			}

			{
				res, e := mockDAO.Count(context.TODO(), &service.Query{Limit: -1})
				So(e, ShouldBeNil)
				So(res, ShouldEqual, 5)
			}

			{
				users := new([]interface{})
				e := mockDAO.Search(context.TODO(), &service.Query{Offset: 1, Limit: 2}, users)
				So(e, ShouldBeNil)
				So(users, ShouldHaveLength, 2)
			}

			{
				users := new([]interface{})
				e := mockDAO.Search(context.TODO(), &service.Query{Offset: 4, Limit: 10}, users)
				So(e, ShouldBeNil)
				So(users, ShouldHaveLength, 1)
			}

			{
				u, e := mockDAO.Bind(context.TODO(), "username", "xxxxxxx")
				So(e, ShouldBeNil)
				So(u, ShouldNotBeNil)
			}

			{
				u, e := mockDAO.Bind(context.TODO(), "usernameXX", "xxxxxxx")
				So(u, ShouldBeNil)
				So(e, ShouldNotBeNil)
				So(errors.Is(e, errors.StatusNotFound), ShouldBeTrue)
			}

			{
				u, e := mockDAO.Bind(context.TODO(), "username", "xxxxxxxYY")
				So(u, ShouldBeNil)
				So(e, ShouldNotBeNil)
				So(errors.Is(e, errors.StatusForbidden), ShouldBeTrue)
			}

			{
				users := new([]interface{})
				userQuery := &idm.UserSingleQuery{
					Login: "user1",
				}
				userQueryAny, _ := anypb.New(userQuery)

				e := mockDAO.Search(context.TODO(), &service.Query{SubQueries: []*anypb.Any{userQueryAny}}, users)
				So(e, ShouldBeNil)
				So(users, ShouldHaveLength, 0)
			}

			{
				users := new([]interface{})
				userQuery := &idm.UserSingleQuery{
					Login: "username",
				}
				userQueryAny, _ := anypb.New(userQuery)

				e := mockDAO.Search(context.TODO(), &service.Query{SubQueries: []*anypb.Any{userQueryAny}}, users)
				So(e, ShouldBeNil)
				So(users, ShouldHaveLength, 1)
			}

			{
				users := new([]interface{})
				userQuery := &idm.UserSingleQuery{
					Login:    "username",
					NodeType: idm.NodeType_USER,
				}
				userQueryAny, _ := anypb.New(userQuery)

				e := mockDAO.Search(context.TODO(), &service.Query{SubQueries: []*anypb.Any{userQueryAny}}, users)
				So(e, ShouldBeNil)
				So(users, ShouldHaveLength, 1)
			}

			{
				users := new([]interface{})
				userQuery := &idm.UserSingleQuery{
					Login:    "username",
					NodeType: idm.NodeType_GROUP,
				}
				userQueryAny, _ := anypb.New(userQuery)

				e := mockDAO.Search(context.TODO(), &service.Query{SubQueries: []*anypb.Any{userQueryAny}}, users)
				So(e, ShouldBeNil)
				So(users, ShouldHaveLength, 0)
			}

			{
				users := new([]interface{})
				userQuery := &idm.UserSingleQuery{
					GroupPath: "/path/to/group",
				}
				userQueryAny, _ := anypb.New(userQuery)

				e := mockDAO.Search(context.TODO(), &service.Query{SubQueries: []*anypb.Any{userQueryAny}}, users)
				So(e, ShouldBeNil)
				So(users, ShouldHaveLength, 1)
			}

			_, _, err2 := mockDAO.Add(context.TODO(), &idm.User{
				IsGroup:   true,
				GroupPath: "/path/to/anotherGroup",
				Attributes: map[string]string{
					"displayName": "Group Display Name",
				},
			})

			So(err2, ShouldBeNil)

			{
				users := new([]interface{})
				userQuery := &idm.UserSingleQuery{
					FullPath: "/path/to/group",
				}
				userQueryAny, _ := anypb.New(userQuery)

				e := mockDAO.Search(context.TODO(), &service.Query{SubQueries: []*anypb.Any{userQueryAny}}, users)
				So(e, ShouldBeNil)
				So(users, ShouldHaveLength, 1)
				object := (*users)[0]
				group, ok := object.(*idm.User)
				So(ok, ShouldBeTrue)
				So(group.GroupLabel, ShouldEqual, "group")
				So(group.GroupPath, ShouldEqual, "/path/to")
				So(group.IsGroup, ShouldBeTrue)

			}

			{
				users := new([]interface{})
				userQuery := &idm.UserSingleQuery{
					FullPath: "/path/to/anotherGroup",
				}
				userQueryAny, _ := anypb.New(userQuery)

				e := mockDAO.Search(context.TODO(), &service.Query{SubQueries: []*anypb.Any{userQueryAny}}, users)
				So(e, ShouldBeNil)
				So(users, ShouldHaveLength, 1)
				object := (*users)[0]
				group, ok := object.(*idm.User)
				So(ok, ShouldBeTrue)
				So(group.GroupLabel, ShouldEqual, "anotherGroup")
				So(group.GroupPath, ShouldEqual, "/path/to")
				So(group.IsGroup, ShouldBeTrue)
				So(group.Attributes, ShouldResemble, map[string]string{"displayName": "Group Display Name", "pydio:labelLike": "group display name"})

			}

			{
				users := new([]interface{})
				userQuery := &idm.UserSingleQuery{
					AttributeName:  "displayName",
					AttributeValue: "John*",
				}
				userQueryAny, _ := anypb.New(userQuery)
				userQuery2 := &idm.UserSingleQuery{
					AttributeName:  "active",
					AttributeValue: "true",
				}
				userQueryAny2, _ := anypb.New(userQuery2)
				userQuery3 := &idm.UserSingleQuery{
					AttributeName:  idm.UserAttrHidden,
					AttributeValue: "false",
				}
				userQueryAny3, _ := anypb.New(userQuery3)

				total, e1 := mockDAO.Count(context.TODO(), &service.Query{
					SubQueries: []*anypb.Any{
						userQueryAny,
						userQueryAny2,
						userQueryAny3,
					},
					Operation: service.OperationType_AND,
				})
				So(e1, ShouldBeNil)
				So(total, ShouldEqual, 1)

				e := mockDAO.Search(context.TODO(), &service.Query{
					SubQueries: []*anypb.Any{
						userQueryAny,
						userQueryAny2,
						userQueryAny3,
					},
					Operation: service.OperationType_AND,
				}, users)
				So(e, ShouldBeNil)
				So(users, ShouldHaveLength, 1)
			}

			_, _, err3 := mockDAO.Add(context.TODO(), &idm.User{
				Login:     "admin",
				Password:  "xxxxxxx",
				GroupPath: "/path/to/group",
				Attributes: map[string]string{
					idm.UserAttrDisplayName: "Administrator",
					idm.UserAttrHidden:      "false",
					"active":                "true",
				},
				Roles: []*idm.Role{
					{Uuid: "1", Label: "Role1"},
					{Uuid: "4", Label: "Role4"},
				},
			})

			So(err3, ShouldBeNil)

			{
				users := new([]interface{})
				userQuery := &idm.UserSingleQuery{
					HasRole: "1",
				}
				userQueryAny, _ := anypb.New(userQuery)

				e := mockDAO.Search(context.TODO(), &service.Query{SubQueries: []*anypb.Any{userQueryAny}}, users)
				So(e, ShouldBeNil)
				So(users, ShouldHaveLength, 2)

				total, e2 := mockDAO.Count(context.TODO(), &service.Query{SubQueries: []*anypb.Any{userQueryAny}})
				So(e2, ShouldBeNil)
				So(total, ShouldEqual, 2)

			}

			{
				users := new([]interface{})
				userQuery := &idm.UserSingleQuery{
					HasRole: "1",
				}
				userQueryAny, _ := anypb.New(userQuery)

				userQuery2 := &idm.UserSingleQuery{
					HasRole: "2",
					Not:     true,
				}
				userQueryAny2, _ := anypb.New(userQuery2)

				e := mockDAO.Search(context.TODO(), &service.Query{
					SubQueries: []*anypb.Any{
						userQueryAny,
						userQueryAny2,
					},
					Operation: service.OperationType_AND,
				}, users)
				So(e, ShouldBeNil)
				So(users, ShouldHaveLength, 1)
				for _, user := range *users {
					So((user.(*idm.User)).Login, ShouldEqual, "admin")
					break
				}

			}

			{
				users := new([]interface{})
				userQueryAny, _ := anypb.New(&idm.UserSingleQuery{
					GroupPath: "/",
					Recursive: true,
				})
				e := mockDAO.Search(context.TODO(), &service.Query{
					SubQueries: []*anypb.Any{userQueryAny},
				}, users)
				So(e, ShouldBeNil)
				So(users, ShouldHaveLength, 6)
				log.Print(users)
				allGroups := []*idm.User{}
				allUsers := []*idm.User{}
				for _, u := range *users {
					obj := u.(*idm.User)
					if obj.IsGroup {
						allGroups = append(allGroups, obj)
					} else {
						allUsers = append(allUsers, obj)
					}
				}
				So(allGroups, ShouldHaveLength, 4)
				So(allUsers, ShouldHaveLength, 2)
			}

			{
				users := new([]interface{})
				userQuery := &idm.UserSingleQuery{
					Login: "username",
				}
				userQueryAny, _ := anypb.New(userQuery)
				mockDAO.Search(context.TODO(), &service.Query{SubQueries: []*anypb.Any{userQueryAny}}, users)
				u := (*users)[0].(*idm.User)
				So(u, ShouldNotBeNil)
				// Change groupPath
				So(u.GroupPath, ShouldEqual, "/path/to/group")
				// Move User
				u.GroupPath = "/path/to/anotherGroup"
				addedUser, _, e := mockDAO.Add(context.TODO(), u)
				So(e, ShouldBeNil)
				So(addedUser.(*idm.User).GroupPath, ShouldEqual, "/path/to/anotherGroup")
				So(addedUser.(*idm.User).Login, ShouldEqual, "username")

				users2 := new([]interface{})
				userQueryAny2, _ := anypb.New(&idm.UserSingleQuery{
					GroupPath: "/path/to/anotherGroup",
				})
				e2 := mockDAO.Search(context.TODO(), &service.Query{
					SubQueries: []*anypb.Any{userQueryAny2},
				}, users2)
				So(e2, ShouldBeNil)
				So(users2, ShouldHaveLength, 1)

				users3 := new([]interface{})
				userQueryAny3, _ := anypb.New(&idm.UserSingleQuery{
					GroupPath: "/path/to/group",
				})
				e3 := mockDAO.Search(context.TODO(), &service.Query{
					SubQueries: []*anypb.Any{userQueryAny3},
				}, users3)
				So(e3, ShouldBeNil)
				So(users3, ShouldHaveLength, 1)
			}

			{
				users := new([]interface{})
				userQuery := &idm.UserSingleQuery{
					FullPath: "/path/to/anotherGroup",
				}
				userQueryAny, _ := anypb.New(userQuery)
				e1 := mockDAO.Search(context.TODO(), &service.Query{SubQueries: []*anypb.Any{userQueryAny}}, users)
				So(e1, ShouldBeNil)
				u := (*users)[0].(*idm.User)
				So(u, ShouldNotBeNil)
				// Change groupPath
				So(u.IsGroup, ShouldBeTrue)
				// Move Group
				u.GroupPath = "/anotherGroup"
				addedGroup, _, e := mockDAO.Add(context.TODO(), u)
				So(e, ShouldBeNil)
				So(addedGroup.(*idm.User).GroupPath, ShouldEqual, "/anotherGroup")

				users2 := new([]interface{})
				userQueryAny2, _ := anypb.New(&idm.UserSingleQuery{
					GroupPath: "/path/to/anotherGroup",
				})
				e2 := mockDAO.Search(context.TODO(), &service.Query{
					SubQueries: []*anypb.Any{userQueryAny2},
				}, users2)
				So(e2, ShouldBeNil)
				So(users2, ShouldHaveLength, 0)

				users3 := new([]interface{})
				userQueryAny3, _ := anypb.New(&idm.UserSingleQuery{
					GroupPath: "/anotherGroup",
				})
				e3 := mockDAO.Search(context.TODO(), &service.Query{
					SubQueries: []*anypb.Any{userQueryAny3},
				}, users3)
				So(e3, ShouldBeNil)
				So(users3, ShouldHaveLength, 1)

			}

			{
				users := new([]interface{})
				userQuery := &idm.UserSingleQuery{
					GroupPath: "/",
					Recursive: false,
				}
				userQueryAny, _ := anypb.New(userQuery)

				e := mockDAO.Search(context.TODO(), &service.Query{SubQueries: []*anypb.Any{userQueryAny}}, users)
				So(e, ShouldBeNil)
				for _, u := range *users {
					log.Print(u)
				}
				So(users, ShouldHaveLength, 2)
			}

			{
				// Delete a group
				userQueryAny3, _ := anypb.New(&idm.UserSingleQuery{
					GroupPath: "/anotherGroup",
				})
				num, e3 := mockDAO.Del(context.TODO(), &service.Query{SubQueries: []*anypb.Any{userQueryAny3}}, make(chan *idm.User, 100))
				So(e3, ShouldBeNil)
				So(num, ShouldEqual, 2)
			}

			{
				// Delete all should be prevented
				_, e3 := mockDAO.Del(context.TODO(), &service.Query{}, make(chan *idm.User, 100))
				So(e3, ShouldNotBeNil)
			}

			{
				// Delete a user
				userQueryAny3, _ := anypb.New(&idm.UserSingleQuery{
					GroupPath: "/path/to/group/",
					Login:     "admin",
				})
				num, e3 := mockDAO.Del(context.TODO(), &service.Query{SubQueries: []*anypb.Any{userQueryAny3}}, make(chan *idm.User, 100))
				So(e3, ShouldBeNil)
				So(num, ShouldEqual, 1)
			}

		})

		Convey("Query Builder W/ subquery", t, func() {

			singleQ1, singleQ2, singleQ3 := new(idm.UserSingleQuery), new(idm.UserSingleQuery), new(idm.UserSingleQuery)

			singleQ1.Login = "user1"
			singleQ2.Login = "user2"
			singleQ3.Login = "user3"

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
			test := subQuery1Any.MessageIs(new(service.Query))
			So(test, ShouldBeTrue)

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

			tx := mockDAO.(*sqlimpl).DB
			tx = tx.Session(&gorm.Session{})

			s, er := service.NewQueryBuilder[*gorm.DB](composedQuery, converter).Build(ctx, tx)
			So(er, ShouldBeNil)
			So(s, ShouldNotBeNil)
			//So(s, ShouldEqual, "((t.uuid = n.uuid and (n.name='user1' and n.leaf = 1)) OR (t.uuid = n.uuid and (n.name='user2' and n.leaf = 1))) AND (t.uuid = n.uuid and (n.name='user3' and n.leaf = 1))")
		})
	})
}

func TestUserPolicies(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[user.DAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("User not readable policy", t, func() {

			us := &idm.User{
				Login:     "username",
				Password:  "xxxxxxx",
				GroupPath: "/path/to/group",
				Attributes: map[string]string{
					idm.UserAttrDisplayName: "John Doe",
					idm.UserAttrHidden:      "false",
					"active":                "true",
				},
				Roles: []*idm.Role{
					{Uuid: "1", Label: "Role1"},
					{Uuid: "2", Label: "Role2"},
				},
				Policies: []*service.ResourcePolicy{
					{
						Action:  service.ResourcePolicyAction_READ,
						Subject: "user:owner",
						Effect:  service.ResourcePolicy_allow,
					},
					{
						Action:  service.ResourcePolicyAction_WRITE,
						Subject: "user:owner",
						Effect:  service.ResourcePolicy_allow,
					},
				},
			}
			u, _, err := mockDAO.Add(ctx, us)
			So(err, ShouldBeNil)
			So(u, ShouldNotBeNil)
			err = mockDAO.AddPolicies(ctx, false, u.(*idm.User).Uuid, us.Policies)
			So(err, ShouldBeNil)

			// List without ResourcePolicyQuery
			sq, _ := anypb.New(&idm.UserSingleQuery{Login: "user*"})
			query := &service.Query{SubQueries: []*anypb.Any{sq}}
			var res []interface{}
			So(mockDAO.Search(ctx, query, &res), ShouldBeNil)
			So(res, ShouldHaveLength, 1)

			query = &service.Query{
				SubQueries: []*anypb.Any{sq},
				ResourcePolicyQuery: &service.ResourcePolicyQuery{
					Subjects: []string{"user:owner"},
				},
			}
			query = service.PrepareResourcePolicyQuery(query, service.ResourcePolicyAction_READ)
			res = []interface{}{}
			i, e := mockDAO.Count(ctx, query)
			So(e, ShouldBeNil)
			So(i, ShouldEqual, 1)
			So(mockDAO.Search(ctx, query, &res), ShouldBeNil)
			So(res, ShouldHaveLength, 1)

			query = &service.Query{
				SubQueries: []*anypb.Any{sq},
				ResourcePolicyQuery: &service.ResourcePolicyQuery{
					Subjects: []string{"user:other", "profile:something"},
				},
			}
			query = service.PrepareResourcePolicyQuery(query, service.ResourcePolicyAction_READ)
			res = []interface{}{}
			So(mockDAO.Search(ctx, query, &res), ShouldBeNil)
			So(res, ShouldHaveLength, 0)
		})

	})
}

func TestDestructiveCreateUser(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		mockDAO, err := manager.Resolve[user.DAO](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Test bug with create user", t, func() {

			_, _, err := mockDAO.Add(context.TODO(), &idm.User{
				Login:     "username",
				Password:  "xxxxxxx",
				GroupPath: "/path/to/group",
				Attributes: map[string]string{
					idm.UserAttrDisplayName: "John Doe",
					idm.UserAttrHidden:      "false",
					"active":                "true",
				},
				Roles: []*idm.Role{
					{Uuid: "1", Label: "Role1"},
					{Uuid: "2", Label: "Role2"},
				},
			})

			So(err, ShouldBeNil)

			_, _, err = mockDAO.Add(context.TODO(), &idm.User{
				Uuid:     "fixed-uuid",
				Login:    "",
				Password: "hashed",
			})

			So(err, ShouldNotBeNil)

			var target []interface{}
			ch := mockDAO.GetNodeTree(context.Background(), tree.NewMPath(1))
			for n := range ch {
				tn := n.(*user_model.User)
				t.Logf("Got node %s (%s)", tn.MPath.ToString(), tn.GetName())
				target = append(target, n)
			}
			So(target, ShouldNotBeEmpty)

			_, _, err = mockDAO.Add(context.TODO(), &idm.User{
				Uuid:     "fixed-uuid",
				Login:    "",
				Password: "hashed",
			})

			//So(err, ShouldNotBeNil)

			var target2 []interface{}
			ch2 := mockDAO.GetNodeTree(context.Background(), tree.NewMPath(1))
			for n := range ch2 {
				tn := n.(*user_model.User)
				t.Logf("Got node %s (%s)", tn.MPath.ToString(), tn.GetName())
				target2 = append(target2, n)
			}
			So(target2, ShouldNotBeEmpty)

		})
	})
}
