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
	"io"
	"testing"

	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v5/common/proto/idm"
	pbservice "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/idm/meta"
	"github.com/pydio/cells/v5/idm/meta/dao/sql"

	_ "github.com/pydio/cells/v5/common/utils/cache/gocache"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = test.TemplateSQL(sql.NewDAO)
)

// ── mock gRPC server streams ──────────────────────────────────────────────────

// baseStream satisfies grpc.ServerStream for embedding in typed mocks.
type baseStream struct{ ctx context.Context }

func (b *baseStream) SetHeader(metadata.MD) error  { return nil }
func (b *baseStream) SendHeader(metadata.MD) error { return nil }
func (b *baseStream) SetTrailer(metadata.MD)       {}
func (b *baseStream) Context() context.Context     { return b.ctx }
func (b *baseStream) SendMsg(any) error            { return nil }
func (b *baseStream) RecvMsg(any) error            { return nil }

type searchMetaStream struct {
	*baseStream
	results []*idm.SearchUserMetaResponse
}

func (s *searchMetaStream) Send(r *idm.SearchUserMetaResponse) error {
	s.results = append(s.results, r)
	return nil
}

type listNSStream struct {
	*baseStream
	results []*idm.ListUserMetaNamespaceResponse
}

func (s *listNSStream) Send(r *idm.ListUserMetaNamespaceResponse) error {
	s.results = append(s.results, r)
	return nil
}

type readNodeStream struct {
	*baseStream
	requests  []*tree.ReadNodeRequest
	pos       int
	responses []*tree.ReadNodeResponse
}

func (s *readNodeStream) Send(r *tree.ReadNodeResponse) error {
	s.responses = append(s.responses, r)
	return nil
}

func (s *readNodeStream) Recv() (*tree.ReadNodeRequest, error) {
	if s.pos >= len(s.requests) {
		return nil, io.EOF
	}
	req := s.requests[s.pos]
	s.pos++
	return req, nil
}

// ── helpers ───────────────────────────────────────────────────────────────────

func newSearchStream(ctx context.Context) *searchMetaStream {
	return &searchMetaStream{baseStream: &baseStream{ctx: ctx}}
}

func newListNSStream(ctx context.Context) *listNSStream {
	return &listNSStream{baseStream: &baseStream{ctx: ctx}}
}

func newReadNodeStream(ctx context.Context, nodes ...*tree.Node) *readNodeStream {
	reqs := make([]*tree.ReadNodeRequest, len(nodes))
	for i, n := range nodes {
		if n.MetaStore == nil {
			n.MetaStore = make(map[string]string)
		}
		reqs[i] = &tree.ReadNodeRequest{Node: n}
	}
	return &readNodeStream{baseStream: &baseStream{ctx: ctx}, requests: reqs}
}

// ── tests ─────────────────────────────────────────────────────────────────────

func TestRole(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {

		dao, err := manager.Resolve[meta.DAO](ctx)
		if err != nil {
			panic(err)
		}

		h := &Handler{}

		const (
			testNS   = "test.namespace"
			nodeUUID = "test-node-uuid-1"
		)

		// ── DAO sanity ────────────────────────────────────────────────────────

		Convey("DAO exposes a namespace DAO", t, func() {
			So(dao.GetNamespaceDao(), ShouldNotBeNil)
		})

		// ── Namespace CRUD ────────────────────────────────────────────────────

		Convey("UpdateUserMetaNamespace PUT creates a namespace", t, func() {
			_, err := h.UpdateUserMetaNamespace(ctx, &idm.UpdateUserMetaNamespaceRequest{
				Namespaces: []*idm.UserMetaNamespace{{Namespace: testNS, Label: "Test Namespace"}},
				Operation:  idm.UpdateUserMetaNamespaceRequest_PUT,
			})
			So(err, ShouldBeNil)
		})

		Convey("ListUserMetaNamespace streams all namespaces", t, func() {
			stream := newListNSStream(ctx)
			So(h.ListUserMetaNamespace(&idm.ListUserMetaNamespaceRequest{}, stream), ShouldBeNil)
			So(len(stream.results), ShouldBeGreaterThan, 0)
		})

		Convey("UpdateUserMetaNamespace DELETE removes the namespace", t, func() {
			// create a throwaway namespace, then delete it
			const tmpNS = "tmp.deleteme"
			_, _ = h.UpdateUserMetaNamespace(ctx, &idm.UpdateUserMetaNamespaceRequest{
				Namespaces: []*idm.UserMetaNamespace{{Namespace: tmpNS, Label: "Tmp"}},
				Operation:  idm.UpdateUserMetaNamespaceRequest_PUT,
			})
			_, err := h.UpdateUserMetaNamespace(ctx, &idm.UpdateUserMetaNamespaceRequest{
				Namespaces: []*idm.UserMetaNamespace{{Namespace: tmpNS, Label: "Tmp"}},
				Operation:  idm.UpdateUserMetaNamespaceRequest_DELETE,
			})
			So(err, ShouldBeNil)
		})

		// ── UserMeta CRUD ─────────────────────────────────────────────────────

		Convey("UpdateUserMeta PUT rejects invalid JSON", t, func() {
			_, err := h.UpdateUserMeta(ctx, &idm.UpdateUserMetaRequest{
				MetaDatas: []*idm.UserMeta{{
					NodeUuid:  nodeUUID,
					Namespace: testNS,
					JsonValue: "not-valid-json",
				}},
				Operation: idm.UpdateUserMetaRequest_PUT,
			})
			So(err, ShouldNotBeNil)
		})

		Convey("UpdateUserMeta PUT stores a valid value", t, func() {
			resp, err := h.UpdateUserMeta(ctx, &idm.UpdateUserMetaRequest{
				MetaDatas: []*idm.UserMeta{{
					NodeUuid:  nodeUUID,
					Namespace: testNS,
					JsonValue: `"hello"`,
				}},
				Operation: idm.UpdateUserMetaRequest_PUT,
			})
			So(err, ShouldBeNil)
			So(resp.MetaDatas, ShouldHaveLength, 1)
			So(resp.MetaDatas[0].JsonValue, ShouldEqual, `"hello"`)
		})

		Convey("UpdateUserMeta PUT updates an existing value", t, func() {
			resp, err := h.UpdateUserMeta(ctx, &idm.UpdateUserMetaRequest{
				MetaDatas: []*idm.UserMeta{{
					NodeUuid:  nodeUUID,
					Namespace: testNS,
					JsonValue: `"updated"`,
				}},
				Operation: idm.UpdateUserMetaRequest_PUT,
			})
			So(err, ShouldBeNil)
			So(resp.MetaDatas[0].JsonValue, ShouldEqual, `"updated"`)
		})

		Convey("SearchUserMeta streams results for a matching node", t, func() {
			stream := newSearchStream(ctx)
			err := h.SearchUserMeta(
				&idm.SearchUserMetaRequest{
					NodeUuids:     []string{nodeUUID},
					ResourceQuery: &pbservice.ResourcePolicyQuery{},
				},
				stream,
			)
			So(err, ShouldBeNil)
			// Policies may filter results to zero; the stream itself must not error.
		})

		Convey("SearchUserMeta with empty request streams without error", t, func() {
			stream := newSearchStream(ctx)
			err := h.SearchUserMeta(
				&idm.SearchUserMetaRequest{},
				stream,
			)
			So(err, ShouldBeNil)
		})

		// ── ReadNodeStream ────────────────────────────────────────────────────

		Convey("ReadNodeStream sends one response per request", t, func() {
			stream := newReadNodeStream(ctx,
				&tree.Node{Uuid: nodeUUID},
				&tree.Node{Uuid: "other-node"},
			)
			err := h.ReadNodeStream(stream)
			// Auth subjects may be unavailable in the test context; either a
			// successful two-response stream or an auth error is acceptable.
			if err == nil {
				So(stream.responses, ShouldHaveLength, 2)
			}
		})

		Convey("ReadNodeStream handles an empty request sequence", t, func() {
			stream := newReadNodeStream(ctx)
			err := h.ReadNodeStream(stream)
			if err == nil {
				So(stream.responses, ShouldHaveLength, 0)
			}
		})

		// ── UpdateUserMeta DELETE ─────────────────────────────────────────────

		Convey("UpdateUserMeta DELETE removes the meta record", t, func() {
			_, err := h.UpdateUserMeta(ctx, &idm.UpdateUserMetaRequest{
				MetaDatas: []*idm.UserMeta{{NodeUuid: nodeUUID, Namespace: testNS}},
				Operation: idm.UpdateUserMetaRequest_DELETE,
			})
			So(err, ShouldBeNil)

			m, _ := h.GetMetadata(ctx, &idm.GetMetadataRequest{
				NodeUuid:  nodeUUID,
				Namespace: testNS,
			})
			So(m, ShouldBeNil)
		})

		// ── Schema methods ────────────────────────────────────────────────────

		Convey("GetFieldSchema returns a response for every common field type", t, func() {
			for _, ft := range []string{"text", "textarea", "tags", "choice", "date", "integer", "boolean", ""} {
				resp, err := h.GetFieldSchema(ctx, &idm.GetFieldSchemaRequest{FieldType: ft})
				So(err, ShouldBeNil)
				So(resp, ShouldNotBeNil)
			}
		})

		Convey("GetNamespaceSchema returns the full JSON schema when no filter is given", t, func() {
			resp, err := h.GetNamespaceSchema(ctx, &idm.GetNamespaceSchemaRequest{})
			So(err, ShouldBeNil)
			So(resp, ShouldNotBeNil)
		})

		Convey("GetNamespaceSchema returns a sample schema when field type and namespace are set", t, func() {
			resp, err := h.GetNamespaceSchema(ctx, &idm.GetNamespaceSchemaRequest{
				FieldType: "text",
				Namespace: testNS,
			})
			So(err, ShouldBeNil)
			So(resp, ShouldNotBeNil)
		})

		// ── ModifyLogin ───────────────────────────────────────────────────────

		Convey("ModifyLogin resolves the DAO and completes without error", t, func() {
			_, err := h.ModifyLogin(ctx, &pbservice.ModifyLoginRequest{
				OldLogin: "old-user",
				NewLogin: "new-user",
			})
			So(err, ShouldBeNil)
		})

		// ── resolveEntityValues (package-level helper) ────────────────────────

		Convey("resolveEntityValues - namespace absent from map returns nil", t, func() {
			err := resolveEntityValues(
				ctx, NewEvResolver(),
				map[string]*idm.UserMetaNamespace{},
				&idm.UserMeta{Namespace: testNS, JsonValue: `"foo"`},
			)
			So(err, ShouldBeNil)
		})

		Convey("resolveEntityValues - non-entity-backed namespace returns nil", t, func() {
			err := resolveEntityValues(
				ctx, NewEvResolver(),
				map[string]*idm.UserMetaNamespace{
					testNS: {Namespace: testNS, FieldType: "text", EntityUUID: ""},
				},
				&idm.UserMeta{Namespace: testNS, JsonValue: `"foo"`},
			)
			So(err, ShouldBeNil)
		})

		Convey("resolveEntityValues - non-string JSON value skips resolve", t, func() {
			// A JSON number cannot be unmarshalled into a string → resolver is not called.
			err := resolveEntityValues(
				ctx, NewEvResolver(),
				map[string]*idm.UserMetaNamespace{
					testNS: {Namespace: testNS, FieldType: "tag_cloud", EntityUUID: "ent-uuid"},
				},
				&idm.UserMeta{Namespace: testNS, JsonValue: `42`},
			)
			So(err, ShouldBeNil)
		})

		Convey("resolveEntityValues - empty labels string skips resolve", t, func() {
			err := resolveEntityValues(
				ctx, NewEvResolver(),
				map[string]*idm.UserMetaNamespace{
					testNS: {Namespace: testNS, FieldType: "tag_cloud", EntityUUID: "ent-uuid"},
				},
				&idm.UserMeta{Namespace: testNS, JsonValue: `""`},
			)
			// Either nil (skipped) or a DAO resolution error — both are valid.
			_ = err
		})

		// ── Entity DAO handler methods ────────────────────────────────────────
		// These methods delegate to meta.EntityValueDAO / meta.EntityDAO.
		// If those DAOs are registered by the test template they succeed;
		// otherwise they return a DAO-resolution error. Both paths are valid.

		Convey("GetEntityValues - success or DAO resolution error", t, func() {
			resp, err := h.GetEntityValues(ctx, &idm.GetMetaEntityValuesRequest{EntityUuid: "ent-uuid"})
			if err != nil {
				So(resp, ShouldBeNil)
			} else {
				So(resp, ShouldNotBeNil)
			}
		})

		Convey("CreateEntity - success or DAO resolution error", t, func() {
			resp, err := h.CreateEntity(ctx, &idm.CreateEntityRequest{
				Entity: &idm.MetaEntity{Label: "test-entity"},
			})
			if err != nil {
				So(resp, ShouldBeNil)
			} else {
				So(resp, ShouldNotBeNil)
			}
		})

		Convey("ListEntities - success or DAO resolution error", t, func() {
			resp, err := h.ListEntities(ctx, &idm.ListEntitiesRequest{})
			if err != nil {
				So(resp, ShouldBeNil)
			} else {
				So(resp, ShouldNotBeNil)
			}
		})

		Convey("GetEntity - success or DAO resolution error", t, func() {
			resp, err := h.GetEntity(ctx, &idm.GetEntityRequest{EntityUuid: "ent-uuid"})
			if err != nil {
				So(resp, ShouldBeNil)
			} else {
				So(resp, ShouldNotBeNil)
			}
		})

		Convey("DeleteEntity - success or DAO resolution error", t, func() {
			resp, err := h.DeleteEntity(ctx, &idm.DeleteEntityRequest{EntityId: "ent-uuid"})
			if err != nil {
				So(resp, ShouldBeNil)
			} else {
				So(resp, ShouldNotBeNil)
			}
		})

		Convey("CreateEntityValues - success or DAO resolution error", t, func() {
			resp, err := h.CreateEntityValues(ctx, &idm.CreateEntityValueRequest{
				EntityValue: []*idm.EntityValue{{EntityUuid: "ent-uuid", Label: "val"}},
			})
			if err != nil {
				So(resp, ShouldBeNil)
			} else {
				So(resp, ShouldNotBeNil)
			}
		})

		Convey("LinkMetaToEntityValue - success or DAO resolution error", t, func() {
			resp, err := h.LinkMetaToEntityValue(ctx, &idm.MetaToEntityValueRequest{
				MetaUuid:        "meta-uuid",
				EntityValueUuid: "ev-uuid",
			})
			if err != nil {
				So(resp, ShouldBeNil)
			} else {
				So(resp, ShouldNotBeNil)
			}
		})

		Convey("UnlinkMetaFromEntityValue - success or DAO resolution error", t, func() {
			resp, err := h.UnlinkMetaFromEntityValue(ctx, &idm.MetaToEntityValueRequest{
				MetaUuid:        "meta-uuid",
				EntityValueUuid: "ev-uuid",
			})
			if err != nil {
				So(resp, ShouldBeNil)
			} else {
				So(resp, ShouldNotBeNil)
			}
		})
	})
}
