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
	"time"

	"google.golang.org/grpc"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common/proto/idm"
	service "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/idm/acl/dao/sql"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = test.TemplateSQL(sql.NewDAO)
)

func TestACL(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {

		s := NewHandler(ctx)

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

		Convey("Create Batch ACLs", t, func() {
			resp, err := s.CreateACL(ctx, &idm.CreateACLRequest{
				Batch: []*idm.ACL{
					{
						NodeID:      "batch-node-id",
						WorkspaceID: "batch-ws-id",
						Action:      &idm.ACLAction{Name: "read", Value: "1"},
						RoleID:      "role-batch",
					},
					{
						NodeID:      "batch-node-id-1",
						WorkspaceID: "batch-ws-id",
						Action:      &idm.ACLAction{Name: "read", Value: "1"},
						RoleID:      "role-batch",
					},
					{
						NodeID:      "batch-node-id-2",
						WorkspaceID: "batch-ws-id",
						Action:      &idm.ACLAction{Name: "read", Value: "1"},
						RoleID:      "role-batch",
					},
				}},
			)
			So(err, ShouldBeNil)
			So(resp.GetBatch(), ShouldHaveLength, 3)

			// Re-add without ignoring dup error
			_, err = s.CreateACL(ctx, &idm.CreateACLRequest{ACL: &idm.ACL{
				NodeID:      "batch-node-id-1",
				WorkspaceID: "batch-ws-id",
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "role-batch"},
			})
			So(err, ShouldNotBeNil)

			// Re-add ignoring dup error
			_, err = s.CreateACL(ctx, &idm.CreateACLRequest{ACL: &idm.ACL{
				NodeID:      "batch-node-id-1",
				WorkspaceID: "batch-ws-id",
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "role-batch"},
				IgnoreDuplicates: true,
			})
			So(err, ShouldBeNil)

			q, _ := anypb.New(&idm.ACLSingleQuery{WorkspaceIDs: []string{"batch-ws-id"}})
			d, e := s.DeleteACL(ctx, &idm.DeleteACLRequest{Query: &service.Query{SubQueries: []*anypb.Any{q}}})
			So(e, ShouldBeNil)
			So(d.RowsDeleted, ShouldEqual, 3)
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
			singleQ1 := new(idm.ACLSingleQuery)
			singleQ1.RoleIDs = []string{"role1"}
			singleQ1Any, err := anypb.New(singleQ1)
			So(err, ShouldBeNil)

			query := &service.Query{
				SubQueries: []*anypb.Any{singleQ1Any},
			}

			resp, err := s.DeleteACL(ctx, &idm.DeleteACLRequest{Query: query})
			So(err, ShouldBeNil)
			So(resp.RowsDeleted, ShouldEqual, 1)
		})

		Convey("Search ACL", t, func() {
			mock := &aclStreamMock{ctx: ctx}
			err := s.SearchACL(&idm.SearchACLRequest{}, mock)

			So(err, ShouldBeNil)
			So(len(mock.InternalBuffer), ShouldEqual, 1)
		})

		Convey("Expire ACL", t, func() {
			singleQ1 := new(idm.ACLSingleQuery)
			singleQ1.RoleIDs = []string{"role2"}
			singleQ1Any, err := anypb.New(singleQ1)
			So(err, ShouldBeNil)

			query := &service.Query{
				SubQueries: []*anypb.Any{singleQ1Any},
			}
			expTime := time.Now().Add(-1 * time.Hour)

			resp, err := s.ExpireACL(ctx, &idm.ExpireACLRequest{Query: query, Timestamp: expTime.Unix()})
			So(err, ShouldBeNil)
			So(resp.Rows, ShouldEqual, 1)

			// Search again: expired should not appear
			mock := &aclStreamMock{ctx: ctx}
			err = s.SearchACL(&idm.SearchACLRequest{}, mock)
			So(err, ShouldBeNil)
			So(len(mock.InternalBuffer), ShouldEqual, 0)

			_, err = s.CreateACL(ctx, &idm.CreateACLRequest{ACL: &idm.ACL{
				NodeID:      "expire-node-id",
				WorkspaceID: "fake-ws-id",
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "role3"},
			})
			So(err, ShouldBeNil)
			singleQ1 = new(idm.ACLSingleQuery)
			singleQ1.RoleIDs = []string{"role3"}
			singleQ1Any, _ = anypb.New(singleQ1)
			query = &service.Query{
				SubQueries: []*anypb.Any{singleQ1Any},
			}
			resp, err = s.ExpireACL(ctx, &idm.ExpireACLRequest{Query: query, Timestamp: expTime.Unix()})
			So(err, ShouldBeNil)
			So(resp.Rows, ShouldEqual, 1)

			// try expiration zero result
			dr, er := s.DeleteACL(ctx, &idm.DeleteACLRequest{ExpiredBefore: expTime.Add(-30 * time.Minute).Unix()})
			So(er, ShouldBeNil)
			So(dr.GetRowsDeleted(), ShouldEqual, 0)

			// try expiration with result
			dr, er = s.DeleteACL(ctx, &idm.DeleteACLRequest{ExpiredBefore: expTime.Add(30 * time.Minute).Unix()})
			So(er, ShouldBeNil)
			So(dr.GetRowsDeleted(), ShouldEqual, 2)

			// New insert, expire then restore an ACL
			expTime = time.Now().Add(-1 * time.Hour)
			_, err = s.CreateACL(ctx, &idm.CreateACLRequest{ACL: &idm.ACL{
				NodeID:      "expire-node-new",
				WorkspaceID: "fake-ws-new",
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "role4"},
			})
			So(err, ShouldBeNil)
			singleQ1 = new(idm.ACLSingleQuery)
			singleQ1.RoleIDs = []string{"role4"}
			singleQ1Any, _ = anypb.New(singleQ1)
			query = &service.Query{
				SubQueries: []*anypb.Any{singleQ1Any},
			}

			mock = &aclStreamMock{ctx: ctx}
			_ = s.SearchACL(&idm.SearchACLRequest{Query: query}, mock)
			So(mock.InternalBuffer, ShouldHaveLength, 1) // New role4 appears in search

			resp, err = s.ExpireACL(ctx, &idm.ExpireACLRequest{Query: query, Timestamp: expTime.Unix()})
			So(err, ShouldBeNil)
			So(resp.Rows, ShouldEqual, 1)

			mock = &aclStreamMock{ctx: ctx}
			_ = s.SearchACL(&idm.SearchACLRequest{Query: query}, mock)
			So(mock.InternalBuffer, ShouldHaveLength, 0) // Expired does not appear anymore

			restore, err := s.RestoreACL(ctx, &idm.RestoreACLRequest{
				Query:         query,
				ExpiredAfter:  expTime.Add(-2 * time.Minute).Unix(),
				ExpiredBefore: expTime.Add(2 * time.Minute).Unix(),
			})
			So(err, ShouldBeNil)
			So(restore.Rows, ShouldEqual, 1)

			mock = &aclStreamMock{ctx: ctx}
			_ = s.SearchACL(&idm.SearchACLRequest{Query: query}, mock)
			So(mock.InternalBuffer, ShouldHaveLength, 1) // Restored now re-appears

			dr, err = s.DeleteACL(ctx, &idm.DeleteACLRequest{Query: query})
			So(err, ShouldBeNil)
			So(dr.GetRowsDeleted(), ShouldEqual, 1)

		})

		Convey("Expire and restore by re-adding ACL", t, func() {
			sameACL := &idm.ACL{
				NodeID:      "expire-node-new",
				WorkspaceID: "fake-ws-new",
				Action:      &idm.ACLAction{Name: "read", Value: "1"},
				RoleID:      "role5",
			}
			// New insert, expire then restore an ACL
			_, err := s.CreateACL(ctx, &idm.CreateACLRequest{ACL: sameACL})
			So(err, ShouldBeNil)
			singleQ1 := new(idm.ACLSingleQuery)
			singleQ1.RoleIDs = []string{"role5"}
			singleQ1Any, _ := anypb.New(singleQ1)
			query := &service.Query{
				SubQueries: []*anypb.Any{singleQ1Any},
			}

			// Expire ACL
			expTime := time.Now().Add(-1 * time.Hour)
			resp, err := s.ExpireACL(ctx, &idm.ExpireACLRequest{Query: query, Timestamp: expTime.Unix()})
			So(err, ShouldBeNil)
			So(resp.Rows, ShouldEqual, 1)

			mock := &aclStreamMock{ctx: ctx}
			_ = s.SearchACL(&idm.SearchACLRequest{Query: query}, mock)
			So(mock.InternalBuffer, ShouldHaveLength, 0) // Expired does not appear anymore

			// Re-add ACL - should implicitly restore it
			_, err = s.CreateACL(ctx, &idm.CreateACLRequest{ACL: sameACL})
			So(err, ShouldBeNil)

			mock = &aclStreamMock{ctx: ctx}
			_ = s.SearchACL(&idm.SearchACLRequest{Query: query}, mock)
			So(mock.InternalBuffer, ShouldHaveLength, 1) // Restored now re-appears

		})
	})
}

// =================================================
// * Mock *
// =================================================

type aclStreamMock struct {
	grpc.ServerStream
	ctx            context.Context
	InternalBuffer []*idm.ACL
}

func (x *aclStreamMock) Context() context.Context {
	return x.ctx
}

func (x *aclStreamMock) Recv() (*idm.SearchACLRequest, error) {
	return nil, nil
}

func (x *aclStreamMock) Send(m *idm.SearchACLResponse) error {
	x.InternalBuffer = append(x.InternalBuffer, m.ACL)
	return nil
}
