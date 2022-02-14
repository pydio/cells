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
	"github.com/pydio/cells/v4/common/dao/test"
	"sync"
	"testing"

	_ "github.com/mattn/go-sqlite3"
	. "github.com/smartystreets/goconvey/convey"
	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common/proto/idm"
	service "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/idm/acl"
)

var (
	ctx     context.Context
	mockDAO acl.DAO
	options = configx.New()

	wg sync.WaitGroup
)

func TestMain(m *testing.M) {

	d, _, e := test.OnFileTestDAO("sqlite3", "file::memory:?mode=memory&cache=shared", "test_", "", false, acl.NewDAO)
	if e != nil {
		panic(e)
	}
	mockDAO = d.(acl.DAO)
	ctx = context.Background()

	m.Run()
	wg.Wait()
}

func TestACL(t *testing.T) {

	s := NewHandler(ctx, mockDAO)

	Convey("Create ACLs", t, func() {
		resp, err := s.CreateACL(ctx, &idm.CreateACLRequest{ACL: &idm.ACL{
			NodeID:      "fake-node-id",
			WorkspaceID: "fake-ws-id",
			Action:      &idm.ACLAction{Name: "read", Value: "1"},
			RoleID:      "role1"},
		})

		So(err, ShouldBeNil)
		So(resp.GetACL().GetID(), ShouldEqual, "1")

	})

	Convey("Create ACLs", t, func() {
		resp, err := s.CreateACL(ctx, &idm.CreateACLRequest{ACL: &idm.ACL{
			NodeID:      "fake-node-id",
			WorkspaceID: "fake-ws-id",
			Action:      &idm.ACLAction{Name: "read", Value: "1"},
			RoleID:      "role2"},
		})

		So(err, ShouldBeNil)
		So(resp.GetACL().GetID(), ShouldEqual, "2")
	})

	Convey("Get ACL", t, func() {
		mock := &aclStreamMock{ctx: ctx}
		err := s.StreamACL(mock)

		So(err, ShouldBeNil)
		So(len(mock.InternalBuffer), ShouldEqual, 0)
	})

	Convey("Search ACL", t, func() {
		mock := &aclStreamMock{ctx: ctx}
		readQ, _ := anypb.New(&idm.ACLSingleQuery{
			Actions: []*idm.ACLAction{{Name: "read"}},
		})
		err := s.SearchACL(&idm.SearchACLRequest{Query: &service.Query{SubQueries: []*anypb.Any{readQ}}}, mock)

		So(err, ShouldBeNil)
		So(len(mock.InternalBuffer), ShouldEqual, 2)
	})

	Convey("Del ACL", t, func() {
		_, err := s.DeleteACL(ctx, &idm.DeleteACLRequest{})

		So(err, ShouldNotBeNil)
	})

	Convey("Del ACL", t, func() {
		_, err := s.DeleteACL(ctx, &idm.DeleteACLRequest{})

		So(err, ShouldNotBeNil)
	})

	Convey("Del ACL", t, func() {
		singleQ1 := new(idm.ACLSingleQuery)
		singleQ1.RoleIDs = []string{"role1"}
		singleQ1Any, err := anypb.New(singleQ1)
		So(err, ShouldBeNil)

		query := &service.Query{
			SubQueries: []*anypb.Any{singleQ1Any},
		}

		_, err = s.DeleteACL(ctx, &idm.DeleteACLRequest{Query: query})
		So(err, ShouldBeNil)
	})

	Convey("Search ACL", t, func() {
		mock := &aclStreamMock{ctx: ctx}
		err := s.SearchACL(&idm.SearchACLRequest{}, mock)

		So(err, ShouldBeNil)
		So(len(mock.InternalBuffer), ShouldEqual, 1)
	})
}

// =================================================
// * Mock *
// =================================================

type aclStreamMock struct {
	ctx            context.Context
	InternalBuffer []*idm.ACL
}

func (x *aclStreamMock) SetHeader(md metadata.MD) error {
	panic("implement me")
}

func (x *aclStreamMock) SendHeader(md metadata.MD) error {
	panic("implement me")
}

func (x *aclStreamMock) SetTrailer(md metadata.MD) {
	panic("implement me")
}

func (x *aclStreamMock) Context() context.Context {
	return x.ctx
}

func (x *aclStreamMock) Close() error {
	return nil
}

func (x *aclStreamMock) SendMsg(m interface{}) error {
	return nil
}

func (x *aclStreamMock) RecvMsg(m interface{}) error {
	return nil
}

func (x *aclStreamMock) Recv() (*idm.SearchACLRequest, error) {
	return nil, nil
}

func (x *aclStreamMock) Send(m *idm.SearchACLResponse) error {
	x.InternalBuffer = append(x.InternalBuffer, m.ACL)
	return nil
}
