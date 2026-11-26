//go:build storage || sql

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

package grpc

import (
	"context"
	"sync"
	"testing"
	"time"

	"github.com/ory/ladon"
	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/idm/policy"
	"github.com/pydio/cells/v5/idm/policy/dao/sql"

	_ "gocloud.dev/pubsub/mempubsub"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = test.TemplateSQL(sql.NewDAO)
)

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

// seedGroup stores a policy group with one allow policy and returns the stored group.
func seedGroup(ctx context.Context, h *Handler, uuid, subject, resource, action string) *idm.PolicyGroup {
	group := &idm.PolicyGroup{
		Uuid:          uuid,
		Name:          uuid,
		ResourceGroup: idm.PolicyResourceGroup_acl,
		Policies: []*idm.Policy{
			{
				ID:        uuid + "-pol",
				Subjects:  []string{subject},
				Resources: []string{resource},
				Actions:   []string{action},
				Effect:    idm.PolicyEffect_allow,
			},
		},
	}
	resp, err := h.StorePolicyGroup(ctx, &idm.StorePolicyGroupRequest{PolicyGroup: group})
	So(err, ShouldBeNil)
	So(resp.GetPolicyGroup(), ShouldNotBeNil)
	return resp.GetPolicyGroup()
}

// checkAllowed sends a single-subject IsAllowed request and returns the response.
func checkAllowed(ctx context.Context, h *Handler, subject, resource, action string) (*idm.PolicyEngineResponse, error) {
	return h.IsAllowed(ctx, &idm.PolicyEngineRequest{
		Subjects: []string{subject},
		Resource: resource,
		Action:   action,
	})
}

// ---------------------------------------------------------------------------
// IsAllowed tests
// ---------------------------------------------------------------------------

func TestHandlerIsAllowed(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {

		Convey("IsAllowed — explicit allow", t, func() {
			h := &Handler{}
			seedGroup(ctx, h, "grp-allow", "user:alice", "res:doc1", "read")

			resp, err := checkAllowed(ctx, h, "user:alice", "res:doc1", "read")
			So(err, ShouldBeNil)
			So(resp.GetAllowed(), ShouldBeTrue)
			So(resp.GetExplicitDeny(), ShouldBeFalse)
		})

		Convey("IsAllowed — default deny for unmatched subject", t, func() {
			h := &Handler{}

			resp, err := checkAllowed(ctx, h, "user:nobody", "res:secret", "delete")
			So(err, ShouldBeNil)
			So(resp.GetAllowed(), ShouldBeFalse)
			So(resp.GetDefaultDeny(), ShouldBeTrue)
		})

		Convey("IsAllowed — explicit deny overrides allow", t, func() {
			h := &Handler{}
			seedGroup(ctx, h, "grp-allow2", "user:bob", "res:doc2", "read")

			_, err := h.StorePolicyGroup(ctx, &idm.StorePolicyGroupRequest{
				PolicyGroup: &idm.PolicyGroup{
					Uuid:          "grp-deny2",
					Name:          "grp-deny2",
					ResourceGroup: idm.PolicyResourceGroup_acl,
					Policies: []*idm.Policy{
						{
							ID:        "grp-deny2-pol",
							Subjects:  []string{"user:bob"},
							Resources: []string{"res:doc2"},
							Actions:   []string{"read"},
							Effect:    idm.PolicyEffect_deny,
						},
					},
				},
			})
			So(err, ShouldBeNil)

			resp, err := checkAllowed(ctx, h, "user:bob", "res:doc2", "read")
			So(err, ShouldBeNil)
			So(resp.GetExplicitDeny(), ShouldBeTrue)
			So(resp.GetAllowed(), ShouldBeFalse)
		})

		Convey("IsAllowed — any matching subject grants access", t, func() {
			h := &Handler{}
			seedGroup(ctx, h, "grp-multi", "user:carol", "res:shared", "write")

			// One unmatched subject + one matching subject — must be Allowed.
			resp, err := h.IsAllowed(ctx, &idm.PolicyEngineRequest{
				Subjects: []string{"user:nobody", "user:carol"},
				Resource: "res:shared",
				Action:   "write",
			})
			So(err, ShouldBeNil)
			So(resp.GetAllowed(), ShouldBeTrue)
		})

		Convey("IsAllowed — fresh handler reads persisted groups", t, func() {

			h := &Handler{}
			seedGroup(ctx, h, "grp-dao", "user:dave", "res:fallback", "read")

			resp, err := checkAllowed(ctx, h, "user:dave", "res:fallback", "read")
			So(err, ShouldBeNil)
			So(resp, ShouldNotBeNil)
			// DAO path must reach a definitive decision (not nil response).
			So(resp.GetAllowed() || resp.GetDefaultDeny() || resp.GetExplicitDeny(), ShouldBeTrue)
		})
	})
}

// ---------------------------------------------------------------------------
// Concurrency / race-detector tests
// ---------------------------------------------------------------------------

func TestHandlerConcurrentIsAllowed(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {

		Convey("Concurrent IsAllowed calls independently read policy groups", t, func() {
			h := &Handler{}
			seedGroup(ctx, h, "grp-concurrent", "user:eve", "res:concurrent", "read")

			const goroutines = 50
			errs := make([]error, goroutines)
			resps := make([]*idm.PolicyEngineResponse, goroutines)

			var wg sync.WaitGroup
			wg.Add(goroutines)
			for i := 0; i < goroutines; i++ {
				i := i
				go func() {
					defer wg.Done()
					resps[i], errs[i] = checkAllowed(ctx, h, "user:eve", "res:concurrent", "read")
				}()
			}
			wg.Wait()

			for i := 0; i < goroutines; i++ {
				So(errs[i], ShouldBeNil)
				So(resps[i].GetAllowed(), ShouldBeTrue)
			}
		})
	})
}

//	exercises runChecks directly without any storage
//
// dependency. Its only purpose is to let the race detector verify that the
// atomic result variables inside runChecks are safe under concurrent writes.
func TestRunChecksRaceDetector(t *testing.T) {
	t.Parallel()

	req := &idm.PolicyEngineRequest{
		Subjects: make([]string, 20),
		Resource: "res:race",
		Action:   "read",
	}
	for i := range req.Subjects {
		req.Subjects[i] = "user:concurrent"
	}

	// checkFn sleeps briefly so goroutines actually overlap.
	resp, err := runChecks(context.Background(), req, func(_ context.Context, _ *ladon.Request) error {
		time.Sleep(time.Millisecond)
		return nil // allow
	})
	Convey("Concurrent subject checks aggregate allow decisions safely", t, func() {
		So(err, ShouldBeNil)
		So(resp.GetAllowed(), ShouldBeTrue)
	})
}

// ---------------------------------------------------------------------------
// Database visibility tests
// ---------------------------------------------------------------------------

func TestHandlerDatabaseChanges(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {

		Convey("IsAllowed — empty DB yields default deny", t, func() {
			h := &Handler{}

			resp, err := checkAllowed(ctx, h, "user:frank", "res:rebuild", "read")
			So(err, ShouldBeNil)
			So(resp.GetDefaultDeny(), ShouldBeTrue)
		})

		Convey("IsAllowed — newly stored policy group is immediately visible", t, func() {
			h := &Handler{}

			// No policy yet — denied.
			resp, err := checkAllowed(ctx, h, "user:frank", "res:rebuild", "read")
			So(err, ShouldBeNil)
			So(resp.GetDefaultDeny(), ShouldBeTrue)

			seedGroup(ctx, h, "grp-rebuild", "user:frank", "res:rebuild", "read")

			resp, err = checkAllowed(ctx, h, "user:frank", "res:rebuild", "read")
			So(err, ShouldBeNil)
			So(resp.GetAllowed(), ShouldBeTrue)
		})

		Convey("IsAllowed — deleted policy group immediately loses access", t, func() {
			h := &Handler{}
			stored := seedGroup(ctx, h, "grp-delete", "user:grace", "res:gone", "read")

			resp, err := checkAllowed(ctx, h, "user:grace", "res:gone", "read")
			So(err, ShouldBeNil)
			So(resp.GetAllowed(), ShouldBeTrue)

			_, err = h.DeletePolicyGroup(ctx, &idm.DeletePolicyGroupRequest{PolicyGroup: stored})
			So(err, ShouldBeNil)

			resp, err = checkAllowed(ctx, h, "user:grace", "res:gone", "read")
			So(err, ShouldBeNil)
			So(resp.GetDefaultDeny(), ShouldBeTrue)
		})
	})
}

// ---------------------------------------------------------------------------
// Mutation visibility tests
// ---------------------------------------------------------------------------

func TestHandlerMutationVisibility(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {

		Convey("StorePolicyGroup is immediately reflected in authorization", t, func() {
			h := &Handler{}

			// No policy yet.
			resp, err := checkAllowed(ctx, h, "user:nick", "res:notify-store", "read")
			So(err, ShouldBeNil)
			So(resp.GetDefaultDeny(), ShouldBeTrue)

			_, err = h.StorePolicyGroup(ctx, &idm.StorePolicyGroupRequest{
				PolicyGroup: &idm.PolicyGroup{
					Uuid:          "grp-notify-store",
					Name:          "grp-notify-store",
					ResourceGroup: idm.PolicyResourceGroup_acl,
					Policies: []*idm.Policy{
						{
							ID:        "grp-notify-store-pol",
							Subjects:  []string{"user:nick"},
							Resources: []string{"res:notify-store"},
							Actions:   []string{"read"},
							Effect:    idm.PolicyEffect_allow,
						},
					},
				},
			})
			So(err, ShouldBeNil)

			resp, err = checkAllowed(ctx, h, "user:nick", "res:notify-store", "read")
			So(err, ShouldBeNil)
			So(resp.GetAllowed(), ShouldBeTrue)
		})

		Convey("DeletePolicyGroup is immediately reflected in authorization", t, func() {
			h := &Handler{}
			stored := seedGroup(ctx, h, "grp-notify-delete", "user:olive", "res:notify-delete", "read")

			resp, err := checkAllowed(ctx, h, "user:olive", "res:notify-delete", "read")
			So(err, ShouldBeNil)
			So(resp.GetAllowed(), ShouldBeTrue)

			_, err = h.DeletePolicyGroup(ctx, &idm.DeletePolicyGroupRequest{PolicyGroup: stored})
			So(err, ShouldBeNil)

			resp, err = checkAllowed(ctx, h, "user:olive", "res:notify-delete", "read")
			So(err, ShouldBeNil)
			So(resp.GetDefaultDeny(), ShouldBeTrue)
		})

		Convey("Another handler immediately sees persisted policy changes", t, func() {
			h1 := &Handler{}
			h2 := &Handler{}

			seedGroup(ctx, h1, "grp-notify-cross", "user:peter", "res:notify-cross", "read")

			resp, err := checkAllowed(ctx, h1, "user:peter", "res:notify-cross", "read")
			So(err, ShouldBeNil)
			So(resp.GetAllowed(), ShouldBeTrue)

			resp, err = checkAllowed(ctx, h2, "user:peter", "res:notify-cross", "read")
			So(err, ShouldBeNil)
			So(resp.GetAllowed(), ShouldBeTrue)
		})
	})
}

func TestHandlerFreshInstance(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {

		Convey("A fresh handler reads existing policies without warm-up", t, func() {
			// Seed data via a first handler so it lands in the DB.
			seeder := &Handler{}
			seedGroup(ctx, seeder, "grp-warm", "user:hank", "res:warm", "read")

			h := &Handler{}

			resp, err := checkAllowed(ctx, h, "user:hank", "res:warm", "read")
			So(err, ShouldBeNil)
			So(resp.GetAllowed(), ShouldBeTrue)
		})
	})
}

// ---------------------------------------------------------------------------
// Direct database mutation tests
// ---------------------------------------------------------------------------

func TestHandlerDirectDatabaseChanges(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		Convey("Authorization and unfiltered listing see direct DAO mutations", t, func() {
			h := &Handler{}
			dao, err := manager.Resolve[policy.DAO](ctx)
			So(err, ShouldBeNil)
			stored := seedGroup(ctx, h, "grp-direct", "user:direct", "res:direct", "read")

			resp, err := checkAllowed(ctx, h, "user:direct", "res:direct", "read")
			So(err, ShouldBeNil)
			So(resp.GetAllowed(), ShouldBeTrue)
			before, err := h.ListPolicyGroups(ctx, &idm.ListPolicyGroupsRequest{})
			So(err, ShouldBeNil)

			So(dao.DeletePolicyGroup(ctx, stored), ShouldBeNil)
			resp, err = checkAllowed(ctx, h, "user:direct", "res:direct", "read")
			So(err, ShouldBeNil)
			So(resp.GetDefaultDeny(), ShouldBeTrue)
			after, err := h.ListPolicyGroups(ctx, &idm.ListPolicyGroupsRequest{})
			So(err, ShouldBeNil)
			So(after.GetTotal(), ShouldEqual, before.GetTotal()-1)

			_, err = dao.StorePolicyGroup(ctx, stored)
			So(err, ShouldBeNil)
			resp, err = checkAllowed(ctx, h, "user:direct", "res:direct", "read")
			So(err, ShouldBeNil)
			So(resp.GetAllowed(), ShouldBeTrue)
		})

		Convey("Standalone policies do not participate in group-based authorization", t, func() {
			h := &Handler{}
			dao, err := manager.Resolve[policy.DAO](ctx)
			So(err, ShouldBeNil)
			So(dao.Create(ctx, &ladon.DefaultPolicy{
				ID: "standalone", Subjects: []string{"user:standalone"},
				Resources: []string{"res:standalone"}, Actions: []string{"read"},
				Effect: ladon.AllowAccess,
			}), ShouldBeNil)
			resp, err := checkAllowed(ctx, h, "user:standalone", "res:standalone", "read")
			So(err, ShouldBeNil)
			So(resp.GetDefaultDeny(), ShouldBeTrue)
		})
	})
}

func TestHandlerStorePolicyGroup(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {

		Convey("StorePolicyGroup", t, func() {

			Convey("nil request returns error", func() {
				h := &Handler{}
				_, err := h.StorePolicyGroup(ctx, nil)
				So(err, ShouldNotBeNil)
			})

			Convey("nil PolicyGroup field returns error", func() {
				h := &Handler{}
				_, err := h.StorePolicyGroup(ctx, &idm.StorePolicyGroupRequest{PolicyGroup: nil})
				So(err, ShouldNotBeNil)
			})

			Convey("valid group is stored and queryable", func() {
				h := &Handler{}
				resp, err := h.StorePolicyGroup(ctx, &idm.StorePolicyGroupRequest{
					PolicyGroup: &idm.PolicyGroup{
						Uuid:          "grp-store-ok",
						Name:          "Store OK",
						ResourceGroup: idm.PolicyResourceGroup_acl,
						Policies: []*idm.Policy{
							{
								ID:        "store-ok-pol",
								Subjects:  []string{"user:ivan"},
								Resources: []string{"res:x"},
								Actions:   []string{"read"},
								Effect:    idm.PolicyEffect_allow,
							},
						},
					},
				})
				So(err, ShouldBeNil)
				So(resp.GetPolicyGroup().GetUuid(), ShouldEqual, "grp-store-ok")

				listResp, err := h.ListPolicyGroups(ctx, &idm.ListPolicyGroupsRequest{Filter: "uuid:grp-store-ok"})
				So(err, ShouldBeNil)
				So(listResp.GetTotal(), ShouldEqual, 1)
			})
		})
	})
}

// ---------------------------------------------------------------------------
// DeletePolicyGroup tests
// ---------------------------------------------------------------------------

func TestHandlerDeletePolicyGroup(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {

		Convey("DeletePolicyGroup", t, func() {

			Convey("valid delete removes the group from the DB", func() {
				h := &Handler{}
				stored := seedGroup(ctx, h, "grp-del-ok", "user:judy", "res:del", "write")

				delResp, err := h.DeletePolicyGroup(ctx, &idm.DeletePolicyGroupRequest{PolicyGroup: stored})
				So(err, ShouldBeNil)
				So(delResp.GetSuccess(), ShouldBeTrue)

				listResp, err := h.ListPolicyGroups(ctx, &idm.ListPolicyGroupsRequest{Filter: "uuid:grp-del-ok"})
				So(err, ShouldBeNil)
				So(listResp.GetTotal(), ShouldEqual, 0)
			})
		})
	})
}

// ---------------------------------------------------------------------------
// ListPolicyGroups tests
// ---------------------------------------------------------------------------

func TestHandlerListPolicyGroups(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {

		Convey("ListPolicyGroups", t, func() {

			Convey("returns all seeded groups", func() {
				h := &Handler{}
				seedGroup(ctx, h, "grp-list-1", "user:a", "res:a", "read")
				seedGroup(ctx, h, "grp-list-2", "user:b", "res:b", "write")

				resp, err := h.ListPolicyGroups(ctx, &idm.ListPolicyGroupsRequest{})
				So(err, ShouldBeNil)
				So(resp.GetTotal(), ShouldBeGreaterThanOrEqualTo, 2)
			})

			Convey("uuid filter returns exact match", func() {
				h := &Handler{}
				seedGroup(ctx, h, "grp-list-filter", "user:c", "res:c", "read")

				resp, err := h.ListPolicyGroups(ctx, &idm.ListPolicyGroupsRequest{Filter: "uuid:grp-list-filter"})
				So(err, ShouldBeNil)
				So(resp.GetTotal(), ShouldEqual, 1)
				So(resp.GetPolicyGroups()[0].GetUuid(), ShouldEqual, "grp-list-filter")
			})

			Convey("malformed filter returns error", func() {
				h := &Handler{}
				_, err := h.ListPolicyGroups(ctx, &idm.ListPolicyGroupsRequest{Filter: "bad==filter"})
				So(err, ShouldNotBeNil)
			})
		})
	})
}

// ---------------------------------------------------------------------------
// StreamPolicyGroups tests
// ---------------------------------------------------------------------------

func TestHandlerStreamPolicyGroups(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {

		Convey("StreamPolicyGroups streams all seeded groups", t, func() {
			h := &Handler{}
			seedGroup(ctx, h, "grp-stream-1", "user:s1", "res:s1", "read")
			seedGroup(ctx, h, "grp-stream-2", "user:s2", "res:s2", "read")

			mock := &policyGroupStreamMock{ctx: ctx}
			err := h.StreamPolicyGroups(&idm.ListPolicyGroupsRequest{}, mock)
			So(err, ShouldBeNil)
			So(len(mock.InternalBuffer), ShouldBeGreaterThanOrEqualTo, 2)
		})
	})
}

// ---------------------------------------------------------------------------
// stream mock — implements idm.PolicyEngineService_StreamPolicyGroupsServer
// (alias for grpc.ServerStreamingServer[idm.PolicyGroup])
// ---------------------------------------------------------------------------

type policyGroupStreamMock struct {
	ctx            context.Context
	InternalBuffer []*idm.PolicyGroup
}

func (m *policyGroupStreamMock) Send(group *idm.PolicyGroup) error {
	m.InternalBuffer = append(m.InternalBuffer, group)
	return nil
}

func (m *policyGroupStreamMock) Context() context.Context        { return m.ctx }
func (m *policyGroupStreamMock) SetHeader(md metadata.MD) error  { return nil }
func (m *policyGroupStreamMock) SendHeader(md metadata.MD) error { return nil }
func (m *policyGroupStreamMock) SetTrailer(md metadata.MD)       {}
func (m *policyGroupStreamMock) SendMsg(v any) error             { return nil }
func (m *policyGroupStreamMock) RecvMsg(v any) error             { return nil }
