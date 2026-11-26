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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells. If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package sql

import (
	"context"
	"sort"
	"testing"

	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/idm/policy"

	. "github.com/smartystreets/goconvey/convey"
)

func TestListPolicyGroupsTemplateFilters(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		Convey("Policy group filters match any requested template", t, func() {
			dao, err := manager.Resolve[policy.DAO](ctx)
			So(err, ShouldBeNil)
			for _, group := range []*idm.PolicyGroup{
				{Uuid: "group-a", ResourceGroup: idm.PolicyResourceGroup_acl, Policies: []*idm.Policy{{
					ID: "policy-a", Subjects: []string{"policy:a", "policy:shared"},
					Actions: []string{"read", "shared"}, Resources: []string{"res:a", "res:shared"},
				}}},
				{Uuid: "group-b", ResourceGroup: idm.PolicyResourceGroup_acl, Policies: []*idm.Policy{{
					ID: "policy-b", Subjects: []string{"policy:b", "policy:shared"},
					Actions: []string{"write", "shared"}, Resources: []string{"res:b", "res:shared"},
				}}},
			} {
				_, err := dao.StorePolicyGroup(ctx, group)
				So(err, ShouldBeNil)
			}

			Convey("Multiple subjects can match a single group", func() {
				assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{
					PolicySubject: []string{"policy:a", "policy:missing"},
				}, []string{"group-a"})
			})

			Convey("One subject can match several groups", func() {
				assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{
					PolicySubject: []string{"policy:shared"},
				}, []string{"group-a", "group-b"})
			})

			Convey("Multiple actions can match a single group", func() {
				assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{
					PolicyAction: []string{"read", "missing"},
				}, []string{"group-a"})
			})

			Convey("One action can match several groups", func() {
				assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{
					PolicyAction: []string{"shared"},
				}, []string{"group-a", "group-b"})
			})

			Convey("Multiple resources can match a single group", func() {
				assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{
					PolicyResource: []string{"res:a", "res:missing"},
				}, []string{"group-a"})
			})

			Convey("One resource can match several groups", func() {
				assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{
					PolicyResource: []string{"res:shared"},
				}, []string{"group-a", "group-b"})
			})

			Convey("Several matching templates return each group once", func() {
				assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{
					PolicySubject: []string{"policy:a", "policy:b", "policy:shared", "policy:a"},
				}, []string{"group-a", "group-b"})
			})

			Convey("Pipe-separated subjects remain literal template values", func() {
				_, err := dao.StorePolicyGroup(ctx, &idm.PolicyGroup{
					Uuid: "group-pipe", Policies: []*idm.Policy{{
						ID: "policy-pipe", Subjects: []string{"policy:a|policy:b"},
					}},
				})
				So(err, ShouldBeNil)
				assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{
					PolicySubject: []string{"policy:a", "policy:b"},
				}, []string{"group-a", "group-b"})
				assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{
					PolicySubject: []string{"policy:a|policy:b"},
				}, []string{"group-pipe"})
				So(dao.DeletePolicyGroup(ctx, &idm.PolicyGroup{Uuid: "group-pipe"}), ShouldBeNil)
			})

			Convey("Resource-group scope is retained with several subjects", func() {
				_, err := dao.StorePolicyGroup(ctx, &idm.PolicyGroup{
					Uuid: "group-rest", ResourceGroup: idm.PolicyResourceGroup_rest,
					Policies: []*idm.Policy{{ID: "policy-rest", Subjects: []string{"policy:a"}}},
				})
				So(err, ShouldBeNil)
				assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{
					ResourceGroup: "acl", PolicySubject: []string{"policy:a", "policy:b"},
				}, []string{"group-a", "group-b"})
				So(dao.DeletePolicyGroup(ctx, &idm.PolicyGroup{Uuid: "group-rest"}), ShouldBeNil)
			})

			Convey("Unmatched subject filters return no groups", func() {
				assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{
					PolicySubject: []string{"missing"},
				}, []string{})
			})

			Convey("Unmatched action filters return no groups", func() {
				assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{
					PolicyAction: []string{"missing"},
				}, []string{})
			})

			Convey("Unmatched resource filters return no groups", func() {
				assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{
					PolicyResource: []string{"missing"},
				}, []string{})
			})

			Convey("Negated subjects exclude the matching groups", func() {
				assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{
					Not: true, PolicySubject: []string{"policy:a"},
				}, []string{"group-b"})
			})

			Convey("Negated actions exclude the matching groups", func() {
				assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{
					Not: true, PolicyAction: []string{"read"},
				}, []string{"group-b"})
			})

			Convey("Negated resources exclude the matching groups", func() {
				assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{
					Not: true, PolicyResource: []string{"res:a"},
				}, []string{"group-b"})
			})

			Convey("Negating an unmatched subject filter returns all groups", func() {
				assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{
					Not: true, PolicySubject: []string{"missing"},
				}, []string{"group-a", "group-b"})
			})

			Convey("Different template fields still constrain the same group", func() {
				assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{
					PolicyAction: []string{"read"}, PolicySubject: []string{"policy:b"},
				}, []string{})
			})
		})
	})
}

func assertPolicyGroupQuery(t *testing.T, ctx context.Context, dao policy.DAO, query *idm.PolicyGroupSingleQuery, expected []string) {
	t.Helper()
	q, err := anypb.New(query)
	So(err, ShouldBeNil)
	groups, err := dao.ListPolicyGroups(ctx, &service.Query{SubQueries: []*anypb.Any{q}})
	So(err, ShouldBeNil)
	ids := make([]string, 0, len(groups))
	for _, group := range groups {
		ids = append(ids, group.GetUuid())
	}
	sort.Strings(ids)
	So(ids, ShouldResemble, expected)
}
