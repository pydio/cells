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

package rest

import (
	"context"
	"io"
	"net/http/httptest"
	"testing"

	restful "github.com/emicklei/go-restful/v3"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common"
	claimpkg "github.com/pydio/cells/v5/common/auth/claim"
	grpcclient "github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/idm"
	serviceproto "github.com/pydio/cells/v5/common/proto/service"

	. "github.com/smartystreets/goconvey/convey"
)

func TestRoleGetRequiresReadAccess(t *testing.T) {
	h := NewRoleHandler()
	ctx := context.Background()
	role := &idm.Role{
		Uuid:  "role-readable",
		Label: "Role Readable",
		Policies: []*serviceproto.ResourcePolicy{
			{Resource: "role-readable", Action: serviceproto.ResourcePolicyAction_READ, Subject: "user:allowed", Effect: serviceproto.ResourcePolicy_allow},
		},
	}
	grpcclient.RegisterMock(common.ServiceRoleGRPC, &roleSearchMockConn{role: role})

	Convey("denies unauthorized reads", t, func() {
		httpReq := httptest.NewRequest("GET", "/role/role-readable", nil)
		httpReq.Header.Set("Accept", restful.MIME_JSON)
		req := restful.NewRequest(httpReq)
		req.Request = req.Request.WithContext(withClaims(ctx, "blocked"))
		req.PathParameters()["Uuid"] = "role-readable"
		rsp := restful.NewResponse(httptest.NewRecorder())

		err := h.GetRole(req, rsp)

		So(err, ShouldNotBeNil)
		So(errors.Is(err, errors.StatusForbidden), ShouldBeTrue)
	})

	Convey("allows authorized reads", t, func() {
		httpReq := httptest.NewRequest("GET", "/role/role-readable", nil)
		httpReq.Header.Set("Accept", restful.MIME_JSON)
		req := restful.NewRequest(httpReq)
		req.Request = req.Request.WithContext(withClaims(ctx, "allowed"))
		req.PathParameters()["Uuid"] = "role-readable"
		recorder := httptest.NewRecorder()
		rsp := restful.NewResponse(recorder)

		err := h.GetRole(req, rsp)

		So(err, ShouldBeNil)
		So(recorder.Code, ShouldNotEqual, 500)
	})
}

func withClaims(ctx context.Context, user string) context.Context {
	return claimpkg.ToContext(ctx, claimpkg.Claims{Name: user, Subject: user, Profile: common.PydioProfileStandard})
}

type roleSearchMockConn struct {
	role *idm.Role
}

func (m *roleSearchMockConn) Invoke(context.Context, string, interface{}, interface{}, ...grpc.CallOption) error {
	return nil
}

func (m *roleSearchMockConn) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	return &roleSearchClientStream{ctx: ctx, role: m.role}, nil
}

type roleSearchClientStream struct {
	grpc.ClientStream
	ctx      context.Context
	role     *idm.Role
	request  *idm.SearchRoleRequest
	results  []*idm.SearchRoleResponse
	position int
}

func (s *roleSearchClientStream) Header() (metadata.MD, error) { return metadata.MD{}, nil }
func (s *roleSearchClientStream) Trailer() metadata.MD         { return metadata.MD{} }
func (s *roleSearchClientStream) CloseSend() error             { return nil }
func (s *roleSearchClientStream) Context() context.Context     { return s.ctx }
func (s *roleSearchClientStream) SendMsg(m interface{}) error {
	req, ok := m.(*idm.SearchRoleRequest)
	if !ok {
		return nil
	}
	s.request = proto.Clone(req).(*idm.SearchRoleRequest)
	return nil
}

func (s *roleSearchClientStream) RecvMsg(m interface{}) error {
	if s.results == nil {
		if s.request == nil {
			return io.EOF
		}
		for _, query := range s.request.GetQuery().GetSubQueries() {
			single := new(idm.RoleSingleQuery)
			if err := query.UnmarshalTo(single); err != nil {
				return err
			}
			for _, uuid := range single.GetUuid() {
				if s.role != nil && uuid == s.role.GetUuid() {
					s.results = append(s.results, &idm.SearchRoleResponse{Role: proto.Clone(s.role).(*idm.Role)})
				}
			}
		}
	}
	if s.position >= len(s.results) {
		return io.EOF
	}
	resp, ok := m.(*idm.SearchRoleResponse)
	if !ok {
		return io.EOF
	}
	*resp = *proto.Clone(s.results[s.position]).(*idm.SearchRoleResponse)
	s.position++
	return nil
}
