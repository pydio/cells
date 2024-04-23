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
	"testing"

	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/dao/sqlite"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/utils/cache"
	"github.com/pydio/cells/v4/common/utils/test"
	"github.com/pydio/cells/v4/idm/user"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = []test.StorageTestCase{
		{sqlite.Driver + "://" + sqlite.SharedMemDSN, true, user.NewDAO},
	}
)

func init() {
	autoAppliesCachePool = cache.MustOpenPool("pm://?evictionTime=3600s&cleanWindow=7200s")
	c, err := autoAppliesCachePool.Get(context.TODO())
	if err != nil {
		panic(err)
	}
	_ = c.Set("autoApplies", map[string][]*idm.Role{
		"autoApplyProfile": {{Uuid: "auto-apply", AutoApplies: []string{"autoApplyProfile"}}},
	})
}

func TestLoginCIDAO(t *testing.T) {

	test.RunStorageTests(testcases, func(ctx context.Context, dao user.DAO) {
		/*
			cfg := configx.New()
			_ = cfg.Val("loginCI").Set(true)
			ciDAO, e := dao.InitDAO(ctx, sqlite.Driver, sqlite.SharedMemDSN, "idm_user", user.NewDAO, cfg)
			if e != nil {
				t.Fail()
				return
			}
					h2 := NewHandler(ctx)

		*/
		h := NewHandler(ctx)

		Convey("Test LoginCI support", t, func() {
			_, e := h.CreateUser(ctx, &idm.CreateUserRequest{User: &idm.User{Login: "MixedLogin", Password: "azerty"}})
			So(e, ShouldBeNil)
			_, e1 := h.BindUser(ctx, &idm.BindUserRequest{UserName: "MixedLogin", Password: "azerty"})
			So(e1, ShouldBeNil)
			_, e2 := h.BindUser(ctx, &idm.BindUserRequest{UserName: "mixedlogin", Password: "azerty"})
			So(e2, ShouldBeNil)
			_, e3 := h.BindUser(ctx, &idm.BindUserRequest{UserName: "MixedLogin", Password: "wrongpass"})
			So(e3, ShouldNotBeNil)
			_, e4 := h.BindUser(ctx, &idm.BindUserRequest{UserName: "MixedLoginz", Password: "azerty"})
			So(e4, ShouldNotBeNil)

		})

		/*
			Convey("Test LoginCI Not set", t, func() {
				_, e := h2.CreateUser(ctx, &idm.CreateUserRequest{User: &idm.User{Login: "mixedlogin", Password: "azerty"}})
				So(e, ShouldBeNil)
				_, e2 := h2.BindUser(ctx, &idm.BindUserRequest{UserName: "mixedlogin", Password: "azerty"})
				So(e2, ShouldBeNil)
				_, e1 := h2.BindUser(ctx, &idm.BindUserRequest{UserName: "MixedLogin", Password: "azerty"})
				So(e1, ShouldNotBeNil)

				delQ, _ := anypb.New(&idm.UserSingleQuery{Login: "mixedlogin"})
				h2.DeleteUser(ctx, &idm.DeleteUserRequest{Query: &service.Query{SubQueries: []*anypb.Any{delQ}}})
			})

		*/
	})
}

func TestUser(t *testing.T) {

	test.RunStorageTests(testcases, func(ctx context.Context, dao user.DAO) {
		h := NewHandler(ctx)

		Convey("Create one user", t, func() {
			resp, err := h.CreateUser(ctx, &idm.CreateUserRequest{User: &idm.User{Login: "user1"}})

			So(err, ShouldBeNil)
			So(resp.GetUser().GetLogin(), ShouldEqual, "user1")
		})

		Convey("Create a second user with name attribute", t, func() {
			resp, err := h.CreateUser(ctx, &idm.CreateUserRequest{User: &idm.User{Login: "user2", Attributes: map[string]string{"name": "User 2"}}})

			So(err, ShouldBeNil)
			So(resp.GetUser().GetLogin(), ShouldEqual, "user2")
		})

		Convey("Get User", t, func() {
			mock := &userStreamMock{ctx: ctx}
			err := h.StreamUser(mock)

			So(err, ShouldBeNil)
			So(len(mock.InternalBuffer), ShouldEqual, 0)
		})

		Convey("Search User", t, func() {
			mock := &userStreamMock{ctx: ctx}
			userQuery := &idm.UserSingleQuery{
				Login: "user1",
			}
			userQueryAny, _ := anypb.New(userQuery)
			request := &idm.SearchUserRequest{
				Query: &service.Query{
					SubQueries: []*anypb.Any{userQueryAny},
				},
			}
			err := h.SearchUser(request, mock)

			So(err, ShouldBeNil)
			So(len(mock.InternalBuffer), ShouldEqual, 1)

			resp, err := h.CountUser(ctx, request)
			So(err, ShouldBeNil)
			So(resp.Count, ShouldEqual, 1)
		})

		Convey("Create a user with auto apply role", t, func() {
			resp, err := h.CreateUser(ctx, &idm.CreateUserRequest{User: &idm.User{Login: "user3", Attributes: map[string]string{"profile": "autoApplyProfile"}}})

			So(err, ShouldBeNil)
			So(resp.GetUser().GetLogin(), ShouldEqual, "user3")
			mock := &userStreamMock{ctx: ctx}
			userQuery := &idm.UserSingleQuery{
				Login: "user3",
			}
			userQueryAny, _ := anypb.New(userQuery)
			request := &idm.SearchUserRequest{
				Query: &service.Query{
					SubQueries: []*anypb.Any{userQueryAny},
				},
			}
			err = h.SearchUser(request, mock)
			So(err, ShouldBeNil)
			So(len(mock.InternalBuffer), ShouldEqual, 1)
			fmt.Println(mock.InternalBuffer[0].Roles)
			So(mock.InternalBuffer[0].Roles, ShouldHaveLength, 3)
			So(mock.InternalBuffer[0].Roles[0].Uuid, ShouldEqual, "ROOT_GROUP")
			So(mock.InternalBuffer[0].Roles[0].GroupRole, ShouldBeTrue)
			So(mock.InternalBuffer[0].Roles[0].UserRole, ShouldBeFalse)

			So(mock.InternalBuffer[0].Roles[1].Uuid, ShouldEqual, "auto-apply")

			So(mock.InternalBuffer[0].Roles[2].Uuid, ShouldEqual, mock.InternalBuffer[0].Uuid)
			So(mock.InternalBuffer[0].Roles[2].UserRole, ShouldBeTrue)
			So(mock.InternalBuffer[0].Roles[2].GroupRole, ShouldBeFalse)

		})

		Convey("Del User", t, func() {
			_, err := h.DeleteUser(ctx, &idm.DeleteUserRequest{})
			So(err, ShouldNotBeNil)
		})

		Convey("Del User", t, func() {
			singleQ1 := new(idm.UserSingleQuery)
			singleQ1.Login = "user1"
			singleQ1Any, err := anypb.New(singleQ1)
			So(err, ShouldBeNil)

			query := &service.Query{
				SubQueries: []*anypb.Any{singleQ1Any},
			}

			_, err = h.DeleteUser(ctx, &idm.DeleteUserRequest{Query: query})
			So(err, ShouldBeNil)
		})

		Convey("List all Users", t, func() {
			mock := &userStreamMock{ctx: ctx}
			err := h.SearchUser(&idm.SearchUserRequest{}, mock)

			So(err, ShouldBeNil)
			So(len(mock.InternalBuffer), ShouldEqual, 3)
		})

		Convey("Create and bind user", t, func() {
			resp := new(idm.CreateUserResponse)
			resp, err := h.CreateUser(ctx, &idm.CreateUserRequest{User: &idm.User{Login: "john", Password: "f00"}})

			So(err, ShouldBeNil)
			So(resp.GetUser().GetLogin(), ShouldEqual, "john")

			// Correct bind
			{
				bindResp, err := h.BindUser(ctx, &idm.BindUserRequest{UserName: "john", Password: "f00"})
				So(err, ShouldBeNil)
				So(bindResp.User, ShouldNotBeNil)
			}
			// Wrong user name
			{
				_, err := h.BindUser(ctx, &idm.BindUserRequest{UserName: "johnFAIL", Password: "f00"})
				So(err, ShouldNotBeNil)
			}
			// Wrong Password
			{
				_, err = h.BindUser(ctx, &idm.BindUserRequest{UserName: "john", Password: "f00FAIL"})
				So(err, ShouldNotBeNil)
			}

		})

		Convey("Create and bind user with a legacy password", t, func() {
			attributes := make(map[string]string, 1)
			attributes[idm.UserAttrPassHashed] = "true"
			resp, err := h.CreateUser(ctx, &idm.CreateUserRequest{User: &idm.User{
				Login:      "legacy",
				Password:   "sha256:1000:ojGf2O2ELslNab+PZ/CkbVddgHQnSwx/FcMZ0Pa4+EE=:d6mVgF+fS+wg7X+0lmSn1T1IOU7DLZhz",
				Attributes: attributes,
			}})

			So(err, ShouldBeNil)
			So(resp.GetUser().GetLogin(), ShouldEqual, "legacy")

			bindResp, err := h.BindUser(ctx, &idm.BindUserRequest{UserName: "legacy", Password: "P@ssw0rd"})
			So(err, ShouldBeNil)
			So(bindResp.User, ShouldNotBeNil)
		})

		Convey("Test password change lock", t, func() {

			resp, err := h.CreateUser(ctx, &idm.CreateUserRequest{
				User: &idm.User{Login: "emma",
					Password: "oldpassword",
					Attributes: map[string]string{
						"locks": `["pass_change","other"]`,
					}}})
			So(err, ShouldBeNil)

			updatedContext := context.WithValue(ctx, common.PydioContextUserKey, "emma")
			resp, err = h.CreateUser(updatedContext, &idm.CreateUserRequest{
				User: &idm.User{
					Login:       "emma",
					OldPassword: "oldpassword",
					Password:    "oldpassword",
					Attributes: map[string]string{
						"locks": `["pass_change","other"]`,
					}}})
			So(err, ShouldNotBeNil)

			resp, err = h.CreateUser(updatedContext, &idm.CreateUserRequest{
				User: &idm.User{Login: "emma",
					Password: "newpassword",
					Attributes: map[string]string{
						"locks": `["pass_change","other"]`,
					}}})
			So(err, ShouldBeNil)
			So(resp.User.Attributes, ShouldNotBeNil)
			So(resp.User.Attributes["locks"], ShouldEqual, `["other"]`)

		})
	})
}

// =================================================
// * Mock *
// =================================================

type userStreamMock struct {
	ctx            context.Context
	InternalBuffer []*idm.User
}

func (x *userStreamMock) SetHeader(md metadata.MD) error {
	panic("implement me")
}

func (x *userStreamMock) SendHeader(md metadata.MD) error {
	panic("implement me")
}

func (x *userStreamMock) SetTrailer(md metadata.MD) {
	panic("implement me")
}

func (x *userStreamMock) Context() context.Context {
	return x.ctx
}

func (x *userStreamMock) Close() error {
	return nil
}

func (x *userStreamMock) SendMsg(m interface{}) error {
	return nil
}

func (x *userStreamMock) RecvMsg(m interface{}) error {
	return nil
}

func (x *userStreamMock) Recv() (*idm.SearchUserRequest, error) {
	return nil, nil
}

func (x *userStreamMock) Send(m *idm.SearchUserResponse) error {
	x.InternalBuffer = append(x.InternalBuffer, m.User)
	return nil
}
