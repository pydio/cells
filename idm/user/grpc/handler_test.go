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
	"log"
	"sync"
	"testing"
	"time"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	cache "github.com/patrickmn/go-cache"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/idm/user"

	. "github.com/smartystreets/goconvey/convey"
	// SQLite Driver
	_ "github.com/mattn/go-sqlite3"
)

var (
	ctx context.Context
	wg  sync.WaitGroup
)

func TestMain(m *testing.M) {

	// Use the cache mechanism to avoid trying to retrieve the role service
	autoAppliesCache = cache.New(3600*time.Second, 7200*time.Second)
	autoAppliesCache.Set("autoApplies", map[string][]*idm.Role{}, 0)

	sqlDao := sql.NewDAO("sqlite3", "file::memory:?mode=memory&cache=shared", "idm_user")
	if sqlDao == nil {
		log.Fatal("unable to open sqlite3 DB file, could not start test")
		return
	}

	mockDAO := user.NewDAO(sqlDao)
	var options config.Map
	if err := mockDAO.Init(options); err != nil {
		log.Fatal("could not start test: unable to initialise DAO, error: ", err)
		return
	}

	ctx = servicecontext.WithDAO(context.Background(), mockDAO)

	m.Run()
	wg.Wait()
}

func TestUser(t *testing.T) {

	h := new(Handler)

	Convey("Create one user", t, func() {
		resp := new(idm.CreateUserResponse)
		err := h.CreateUser(ctx, &idm.CreateUserRequest{User: &idm.User{Login: "user1"}}, resp)

		So(err, ShouldBeNil)
		So(resp.GetUser().GetLogin(), ShouldEqual, "user1")
	})

	Convey("Create a second user with name attribute", t, func() {
		resp := new(idm.CreateUserResponse)
		err := h.CreateUser(ctx, &idm.CreateUserRequest{User: &idm.User{Login: "user2", Attributes: map[string]string{"name": "User 2"}}}, resp)

		So(err, ShouldBeNil)
		So(resp.GetUser().GetLogin(), ShouldEqual, "user2")
	})

	Convey("Get User", t, func() {
		mock := &userStreamMock{}
		err := h.StreamUser(ctx, mock)

		So(err, ShouldBeNil)
		So(len(mock.InternalBuffer), ShouldEqual, 0)
	})

	Convey("Search User", t, func() {
		mock := &userStreamMock{}
		userQuery := &idm.UserSingleQuery{
			Login: "user1",
		}
		userQueryAny, _ := ptypes.MarshalAny(userQuery)
		err := h.SearchUser(ctx, &idm.SearchUserRequest{
			Query: &service.Query{
				SubQueries: []*any.Any{userQueryAny},
			},
		}, mock)

		So(err, ShouldBeNil)
		So(len(mock.InternalBuffer), ShouldEqual, 1)
	})

	Convey("Del User", t, func() {
		err := h.DeleteUser(ctx, &idm.DeleteUserRequest{}, &idm.DeleteUserResponse{})
		So(err, ShouldNotBeNil)
	})

	// Convey("Del User", t, func() {
	// 	err := s.DeleteUser(ctx, &idm.DeleteUserRequest{}, &idm.DeleteUserResponse{})
	// 	So(err, ShouldNotBeNil)
	// })

	Convey("Del User", t, func() {
		singleQ1 := new(idm.UserSingleQuery)
		singleQ1.Login = "user1"
		singleQ1Any, err := ptypes.MarshalAny(singleQ1)
		So(err, ShouldBeNil)

		query := &service.Query{
			SubQueries: []*any.Any{singleQ1Any},
		}

		err = h.DeleteUser(ctx, &idm.DeleteUserRequest{Query: query}, &idm.DeleteUserResponse{})
		So(err, ShouldBeNil)
	})

	Convey("Search User", t, func() {
		mock := &userStreamMock{}
		err := h.SearchUser(ctx, &idm.SearchUserRequest{}, mock)

		So(err, ShouldBeNil)
		So(len(mock.InternalBuffer), ShouldEqual, 2)
	})

	Convey("Create and bind user", t, func() {
		resp := new(idm.CreateUserResponse)
		err := h.CreateUser(ctx, &idm.CreateUserRequest{User: &idm.User{Login: "john", Password: "f00"}}, resp)

		So(err, ShouldBeNil)
		So(resp.GetUser().GetLogin(), ShouldEqual, "john")
	})
}

// =================================================
// * Mock *
// =================================================

type userStreamMock struct {
	InternalBuffer []*idm.User
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
