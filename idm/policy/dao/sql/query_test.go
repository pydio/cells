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

func TestPolicyGroupMetadataFilters(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		Convey("Metadata filters constrain persisted groups", t, func() {
			dao, err := manager.Resolve[policy.DAO](ctx)
			So(err, ShouldBeNil)
			for _, group := range []*idm.PolicyGroup{
				{Uuid: "meta-a", Name: "Alpha", Description: "Shared description", ResourceGroup: idm.PolicyResourceGroup_rest},
				{Uuid: "meta-b", Name: "Beta", Description: "Private description", ResourceGroup: idm.PolicyResourceGroup_acl},
				{Uuid: "meta-c", Name: "Alpine", Description: "Shared description", ResourceGroup: idm.PolicyResourceGroup_oidc},
			} {
				_, err := dao.StorePolicyGroup(ctx, group)
				So(err, ShouldBeNil)
			}
			for _, tc := range []struct {
				name  string
				query *idm.PolicyGroupSingleQuery
				want  []string
			}{
				{"REST enum zero", &idm.PolicyGroupSingleQuery{ResourceGroup: "rest"}, []string{"meta-a"}},
				{"ACL enum one", &idm.PolicyGroupSingleQuery{ResourceGroup: "acl"}, []string{"meta-b"}},
				{"OIDC enum two", &idm.PolicyGroupSingleQuery{ResourceGroup: "oidc"}, []string{"meta-c"}},
				{"negated scope", &idm.PolicyGroupSingleQuery{ResourceGroup: "rest", Not: true}, []string{"meta-b", "meta-c"}},
				{"exact UUID", &idm.PolicyGroupSingleQuery{Uuid: "meta-b"}, []string{"meta-b"}},
				{"UUID pattern", &idm.PolicyGroupSingleQuery{Uuid: "meta-%", Like: true}, []string{"meta-a", "meta-b", "meta-c"}},
				{"exact name", &idm.PolicyGroupSingleQuery{Name: "Alpha"}, []string{"meta-a"}},
				{"name pattern", &idm.PolicyGroupSingleQuery{Name: "Al%", Like: true}, []string{"meta-a", "meta-c"}},
				{"negated name pattern", &idm.PolicyGroupSingleQuery{Name: "Al%", Like: true, Not: true}, []string{"meta-b"}},
				{"exact description", &idm.PolicyGroupSingleQuery{Description: "Shared description"}, []string{"meta-a", "meta-c"}},
				{"description pattern", &idm.PolicyGroupSingleQuery{Description: "Private%", Like: true}, []string{"meta-b"}},
				{"conjoined fields", &idm.PolicyGroupSingleQuery{Name: "Alpha", ResourceGroup: "acl"}, []string{}},
				{"quoted value stays literal", &idm.PolicyGroupSingleQuery{Name: "' OR 1=1 --"}, []string{}},
			} {
				Convey(tc.name, func() {
					assertPolicyGroupQuery(t, ctx, dao, tc.query, tc.want)
				})
			}
			Convey("UUID and name both constrain a single query", func() {
				assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{
					Uuid: "meta-b", Name: "Alpha",
				}, []string{})
			})
			Convey("Negated fields both constrain a single query", func() {
				assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{
					ResourceGroup: "rest", Name: "Beta", Not: true,
				}, []string{"meta-c"})
			})
			Convey("Separate subqueries compose with OR or AND", func() {
				a, err := anypb.New(&idm.PolicyGroupSingleQuery{Name: "Alpha"})
				So(err, ShouldBeNil)
				b, err := anypb.New(&idm.PolicyGroupSingleQuery{ResourceGroup: "acl"})
				So(err, ShouldBeNil)
				for _, operation := range []service.OperationType{service.OperationType_OR, service.OperationType_AND} {
					groups, err := dao.ListPolicyGroups(ctx, &service.Query{Operation: operation, SubQueries: []*anypb.Any{a, b}})
					So(err, ShouldBeNil)
					if operation == service.OperationType_OR {
						ids := []string{}
						for _, group := range groups {
							ids = append(ids, group.Uuid)
						}
						sort.Strings(ids)
						So(ids, ShouldResemble, []string{"meta-a", "meta-b"})
					} else {
						So(groups, ShouldBeEmpty)
					}
				}
			})
		})
	})
}

func TestPolicyGroupSelectorsRemainComplete(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		Convey("A selector match loads the entire group, not just matching selectors or policies", t, func() {
			dao, err := manager.Resolve[policy.DAO](ctx)
			So(err, ShouldBeNil)
			group := &idm.PolicyGroup{Uuid: "complete", ResourceGroup: idm.PolicyResourceGroup_acl,
				Policies: []*idm.Policy{
					{ID: "complete-allow", Effect: idm.PolicyEffect_allow, Subjects: []string{"user:a", "user:b"},
						Actions: []string{"read", "write"}, Resources: []string{"acl", "rest:<.*>"}},
					{ID: "complete-deny", Effect: idm.PolicyEffect_deny, Subjects: []string{"user:other"},
						Actions: []string{"delete"}, Resources: []string{"acl"},
						Conditions: map[string]*idm.PolicyCondition{"owner": {Type: "StringEqualCondition", JsonOptions: `{"equals":"{{ .actor }}"}`}}},
				}}
			_, err = dao.StorePolicyGroup(ctx, group)
			So(err, ShouldBeNil)
			for _, query := range []*idm.PolicyGroupSingleQuery{
				{PolicySubject: []string{"user:a"}}, {PolicyAction: []string{"read"}}, {PolicyResource: []string{"rest:<.*>"}},
			} {
				q, err := anypb.New(query)
				So(err, ShouldBeNil)
				groups, err := dao.ListPolicyGroups(ctx, &service.Query{SubQueries: []*anypb.Any{q}})
				So(err, ShouldBeNil)
				So(groups, ShouldHaveLength, 1)
				So(groups[0].Policies, ShouldHaveLength, 2)
				byID := map[string]*idm.Policy{}
				for _, p := range groups[0].Policies {
					byID[p.ID] = p
					So(p.OrmActions, ShouldBeNil)
					So(p.OrmResources, ShouldBeNil)
					So(p.OrmSubjects, ShouldBeNil)
				}
				So(byID["complete-allow"].Subjects, ShouldContain, "user:b")
				So(byID["complete-allow"].Actions, ShouldContain, "write")
				So(byID["complete-allow"].Resources, ShouldContain, "acl")
				So(byID["complete-deny"].Effect, ShouldEqual, idm.PolicyEffect_deny)
				So(byID["complete-deny"].Conditions["owner"].JsonOptions, ShouldEqual, `{"equals":"{{ .actor }}"}`)
			}
			// A stored pattern is a literal query value, not evaluated by this API.
			assertPolicyGroupQuery(t, ctx, dao, &idm.PolicyGroupSingleQuery{PolicyResource: []string{"rest:/doc"}}, []string{})
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
