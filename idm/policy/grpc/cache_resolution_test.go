//go:build sql || storage

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
	"sync/atomic"
	"testing"

	"github.com/ory/ladon"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/idm/policy"
	policycache "github.com/pydio/cells/v5/idm/policy/cache"
)

type countingDAO struct {
	policycache.Source
	lookups atomic.Int32
	loads   atomic.Int32
}

func (d *countingDAO) ListPolicyGroups(ctx context.Context, q service.Enquirer) ([]*idm.PolicyGroup, error) {
	d.loads.Add(1)
	return d.Source.ListPolicyGroups(ctx, q)
}

func (d *countingDAO) FindPolicyGroupIDs(ctx context.Context, r *ladon.Request) ([]string, error) {
	d.lookups.Add(1)
	return d.Source.FindPolicyGroupIDs(ctx, r)
}

func TestConversationWriteKeepsRESTLookupHot(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		Convey("conversation writes leave the real SQL-backed REST lookup hot", t, func() {
			dao, err := manager.Resolve[policy.DAO](ctx)
			So(err, ShouldBeNil)
			src, ok := dao.(policycache.Source)
			So(ok, ShouldBeTrue)
			counted := &countingDAO{Source: src}
			h := &Handler{}
			seedGroup(ctx, h, "hot-rest", "alice", "rest:<.*>", "POST")
			m := &cachedPolicyManager{Manager: dao, source: counted, scope: policyCacheScope(ctx, dao)}
			r := &ladon.Request{Subject: "alice", Resource: "rest:/v2/n/nodes", Action: "POST"}
			_, err = m.FindRequestCandidates(ctx, r)
			So(err, ShouldBeNil)
			So(counted.lookups.Load(), ShouldEqual, 1)
			So(counted.loads.Load(), ShouldEqual, 1)
			seedGroup(ctx, h, "unrelated-conversation", "policy:new", "acl", "read")
			_, err = m.FindRequestCandidates(ctx, r)
			So(err, ShouldBeNil)
			So(counted.lookups.Load(), ShouldEqual, 1)
			So(counted.loads.Load(), ShouldEqual, 1)
		})
	})
}

func TestListingSkipsCatalogueSnapshot(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		Convey("full listing reads SQL instead of a retained catalogue snapshot", t, func() {
			dao, err := manager.Resolve[policy.DAO](ctx)
			So(err, ShouldBeNil)
			// The returned handler must not retain a full-catalogue engine at all.
			h := &Handler{}
			seedGroup(ctx, h, "rest-group", "alice", "rest:<.*>", "POST")
			before, err := checkAllowed(ctx, h, "alice", "rest:/v2/n/nodes", "POST")
			So(err, ShouldBeNil)
			So(before.Allowed, ShouldBeTrue)
			seedGroup(ctx, h, "conversation", "policy:conversation", "acl", "read")
			// Direct DAO modification after a successful handler write exposes stale
			// retained engines; listing must not reuse the old catalogue blob either.
			groups, err := dao.ListPolicyGroups(ctx, nil)
			So(err, ShouldBeNil)
			for _, g := range groups {
				So(dao.DeletePolicyGroup(ctx, g), ShouldBeNil)
			}
			listing, err := h.ListPolicyGroups(ctx, &idm.ListPolicyGroupsRequest{})
			So(err, ShouldBeNil)
			So(listing.PolicyGroups, ShouldBeEmpty)
		})
	})
}

func TestCachedPolicyMutationVisibility(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		Convey("warm lookups observe replacement, new deny and UUID-only deletion", t, func() {
			h := &Handler{}
			group := seedGroup(ctx, h, "mutable", "alice", "doc", "read")
			before, err := checkAllowed(ctx, h, "alice", "doc", "read")
			So(err, ShouldBeNil)
			So(before.Allowed, ShouldBeTrue)
			group.Policies[0].Subjects = []string{"bob"}
			_, err = h.StorePolicyGroup(ctx, &idm.StorePolicyGroupRequest{PolicyGroup: group})
			So(err, ShouldBeNil)
			old, err := checkAllowed(ctx, h, "alice", "doc", "read")
			So(err, ShouldBeNil)
			So(old.DefaultDeny, ShouldBeTrue)
			current, err := checkAllowed(ctx, h, "bob", "doc", "read")
			So(err, ShouldBeNil)
			So(current.Allowed, ShouldBeTrue)
			deny := &idm.PolicyGroup{Uuid: "added-deny", Policies: []*idm.Policy{{ID: "deny-p", Subjects: []string{"bob"}, Resources: []string{"doc"}, Actions: []string{"read"}, Effect: idm.PolicyEffect_deny}}}
			_, err = h.StorePolicyGroup(ctx, &idm.StorePolicyGroupRequest{PolicyGroup: deny})
			So(err, ShouldBeNil)
			denied, err := checkAllowed(ctx, h, "bob", "doc", "read")
			So(err, ShouldBeNil)
			So(denied.ExplicitDeny, ShouldBeTrue)
			_, err = h.DeletePolicyGroup(ctx, &idm.DeletePolicyGroupRequest{PolicyGroup: &idm.PolicyGroup{Uuid: deny.Uuid}})
			So(err, ShouldBeNil)
			restored, err := checkAllowed(ctx, h, "bob", "doc", "read")
			So(err, ShouldBeNil)
			So(restored.Allowed, ShouldBeTrue)
		})
	})
}

func TestCachedPoliciesEvaluateFreshContext(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		Convey("cached candidates never cache request-dependent decisions", t, func() {
			h := &Handler{}
			group := &idm.PolicyGroup{Uuid: "conditional", Policies: []*idm.Policy{{ID: "conditional-p", Subjects: []string{"alice"}, Resources: []string{"doc"}, Actions: []string{"read"}, Effect: idm.PolicyEffect_allow, Conditions: map[string]*idm.PolicyCondition{"owner": {Type: "StringEqualCondition", JsonOptions: `{"equals":"alice"}`}}}}}
			_, err := h.StorePolicyGroup(ctx, &idm.StorePolicyGroupRequest{PolicyGroup: group})
			So(err, ShouldBeNil)
			request := &idm.PolicyEngineRequest{Subjects: []string{"alice"}, Resource: "doc", Action: "read", Context: map[string]string{"owner": "alice"}}
			allowed, err := h.IsAllowed(ctx, request)
			So(err, ShouldBeNil)
			So(allowed.Allowed, ShouldBeTrue)
			request.Context["owner"] = "bob"
			denied, err := h.IsAllowed(ctx, request)
			So(err, ShouldBeNil)
			So(denied.DefaultDeny, ShouldBeTrue)
		})
	})
}
