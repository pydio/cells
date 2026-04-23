/*
 * Copyright (c) 2026. Abstrium SAS <team (at) pydio.com>
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

func TestGetCellRequiresReadAccess(t *testing.T) {
	h := NewSharesHandler()
	ctx := context.Background()

	ws := &idm.Workspace{
		UUID:  "cell-uuid-123",
		Label: "Secret Cell",
		Scope: idm.WorkspaceScope_ROOM,
		Policies: []*serviceproto.ResourcePolicy{
			{Resource: "cell-uuid-123", Action: serviceproto.ResourcePolicyAction_READ, Subject: "user:allowed-user", Effect: serviceproto.ResourcePolicy_allow},
			{Resource: "cell-uuid-123", Action: serviceproto.ResourcePolicyAction_WRITE, Subject: "user:allowed-user", Effect: serviceproto.ResourcePolicy_allow},
			{Resource: "cell-uuid-123", Action: serviceproto.ResourcePolicyAction_OWNER, Subject: "user:allowed-user", Effect: serviceproto.ResourcePolicy_allow},
		},
	}
	grpcclient.RegisterMock(common.ServiceWorkspaceGRPC, &wsSearchMockConn{ws: ws})

	Convey("denies read to unauthorized user", t, func() {
		httpReq := httptest.NewRequest("GET", "/a/share/cell/cell-uuid-123", nil)
		httpReq.Header.Set("Accept", restful.MIME_JSON)
		req := restful.NewRequest(httpReq)
		req.Request = req.Request.WithContext(withClaims(ctx, "blocked-user"))
		req.PathParameters()["Uuid"] = "cell-uuid-123"
		rsp := restful.NewResponse(httptest.NewRecorder())

		err := h.GetCell(req, rsp)

		So(err, ShouldNotBeNil)
		So(errors.Is(err, errors.CellNotFound), ShouldBeTrue)
	})

	Convey("allows read to authorized user", t, func() {
		httpReq := httptest.NewRequest("GET", "/a/share/cell/cell-uuid-123", nil)
		httpReq.Header.Set("Accept", restful.MIME_JSON)
		req := restful.NewRequest(httpReq)
		req.Request = req.Request.WithContext(withClaims(ctx, "allowed-user"))
		req.PathParameters()["Uuid"] = "cell-uuid-123"
		recorder := httptest.NewRecorder()
		rsp := restful.NewResponse(recorder)

		err := h.GetCell(req, rsp)

		// May fail on WorkspaceToCellObject (no ACL mock), but must NOT fail with CellNotFound
		if err != nil {
			So(errors.Is(err, errors.CellNotFound), ShouldBeFalse)
		}
	})
}

func withClaims(ctx context.Context, user string) context.Context {
	return claimpkg.ToContext(ctx, claimpkg.Claims{Name: user, Subject: user, Profile: common.PydioProfileStandard})
}

// --- gRPC mock for WorkspaceService SearchWorkspace ---

type wsSearchMockConn struct {
	ws *idm.Workspace
}

func (m *wsSearchMockConn) Invoke(context.Context, string, interface{}, interface{}, ...grpc.CallOption) error {
	return nil
}

func (m *wsSearchMockConn) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	return &wsSearchClientStream{ctx: ctx, ws: m.ws}, nil
}

type wsSearchClientStream struct {
	grpc.ClientStream
	ctx      context.Context
	ws       *idm.Workspace
	request  *idm.SearchWorkspaceRequest
	results  []*idm.SearchWorkspaceResponse
	position int
}

func (s *wsSearchClientStream) Header() (metadata.MD, error) { return metadata.MD{}, nil }
func (s *wsSearchClientStream) Trailer() metadata.MD         { return metadata.MD{} }
func (s *wsSearchClientStream) CloseSend() error             { return nil }
func (s *wsSearchClientStream) Context() context.Context     { return s.ctx }

func (s *wsSearchClientStream) SendMsg(m interface{}) error {
	req, ok := m.(*idm.SearchWorkspaceRequest)
	if !ok {
		return nil
	}
	s.request = proto.Clone(req).(*idm.SearchWorkspaceRequest)
	return nil
}

func (s *wsSearchClientStream) RecvMsg(m interface{}) error {
	if s.results == nil {
		s.results = s.buildResults()
	}
	if s.position >= len(s.results) {
		return io.EOF
	}
	resp, ok := m.(*idm.SearchWorkspaceResponse)
	if !ok {
		return io.EOF
	}
	cloned := proto.Clone(s.results[s.position]).(*idm.SearchWorkspaceResponse)
	resp.Workspace = cloned.Workspace
	s.position++
	return nil
}

func (s *wsSearchClientStream) buildResults() []*idm.SearchWorkspaceResponse {
	if s.request == nil || s.ws == nil {
		return nil
	}
	for _, q := range s.request.GetQuery().GetSubQueries() {
		single := new(idm.WorkspaceSingleQuery)
		if err := q.UnmarshalTo(single); err != nil {
			continue
		}
		if single.GetUuid() == s.ws.GetUUID() {
			return []*idm.SearchWorkspaceResponse{{Workspace: proto.Clone(s.ws).(*idm.Workspace)}}
		}
	}
	return nil
}
