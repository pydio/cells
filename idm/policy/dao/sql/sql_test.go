//go:build storage || sql

package sql

import (
	"context"
	"testing"

	"github.com/ory/ladon"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/idm/policy"

	. "github.com/smartystreets/goconvey/convey"
)

func TestPolicyGroupReplacementAndCleanup(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		Convey("Replacing and deleting groups preserve referenced selectors and remove orphans", t, func() {
			dao, err := manager.Resolve[policy.DAO](ctx)
			So(err, ShouldBeNil)
			group := &idm.PolicyGroup{Name: "test-ws", OwnerUuid: "owner-uuid-a", ResourceGroup: idm.PolicyResourceGroup_acl,
				Policies: []*idm.Policy{{ID: "cleanup-old", Subjects: []string{"cleanup:old", "cleanup:shared"},
					Actions: []string{"cleanup:old", "cleanup:shared"}, Resources: []string{"cleanup:old", "cleanup:shared"}}}}
			original := proto.Clone(group)
			stored, err := dao.StorePolicyGroup(ctx, group)
			So(err, ShouldBeNil)
			So(stored.Uuid, ShouldNotBeEmpty)
			So(stored.LastUpdated, ShouldBeGreaterThan, 0)
			So(proto.Equal(group, original), ShouldBeTrue)
			_, err = dao.StorePolicyGroup(ctx, &idm.PolicyGroup{Uuid: "cleanup-survivor-uuid", Policies: []*idm.Policy{{
				ID: "cleanup-survivor-uuid", Subjects: []string{"cleanup:shared"}, Actions: []string{"cleanup:shared"}, Resources: []string{"cleanup:shared"},
			}}})
			So(err, ShouldBeNil)

			// Reuse the UUID, replacing metadata and the complete policy relation set.
			replacement := &idm.PolicyGroup{Uuid: stored.Uuid, Name: "test-replacement", Description: "Updated", OwnerUuid: "owner-b",
				ResourceGroup: idm.PolicyResourceGroup_oidc, Policies: []*idm.Policy{{ID: "cleanup-new",
					Subjects: []string{"cleanup:new"}, Actions: []string{"cleanup:new"}, Resources: []string{"cleanup:new"}}}}
			_, err = dao.StorePolicyGroup(ctx, replacement)
			So(err, ShouldBeNil)
			q, err := anypb.New(&idm.PolicyGroupSingleQuery{Uuid: stored.Uuid})
			So(err, ShouldBeNil)
			groups, err := dao.ListPolicyGroups(ctx, &service.Query{SubQueries: []*anypb.Any{q}})
			So(err, ShouldBeNil)
			So(groups, ShouldHaveLength, 1)
			So(groups[0].Name, ShouldEqual, replacement.Name)
			So(groups[0].Description, ShouldEqual, replacement.Description)
			So(groups[0].OwnerUuid, ShouldEqual, replacement.OwnerUuid)
			So(groups[0].ResourceGroup, ShouldEqual, idm.PolicyResourceGroup_oidc)
			So(groups[0].Policies, ShouldHaveLength, 1)
			So(groups[0].Policies[0].ID, ShouldEqual, replacement.Policies[0].ID)

			db := dao.(*sqlimpl).instance(ctx)
			for _, model := range []any{&idm.PolicyAction{}, &idm.PolicySubject{}, &idm.PolicyResource{}} {
				var count int64
				So(db.Model(model).Where("template = ?", "cleanup:old").Count(&count).Error, ShouldBeNil)
				So(count, ShouldEqual, 0)
				So(db.Model(model).Where("template = ?", "cleanup:shared").Count(&count).Error, ShouldBeNil)
				So(count, ShouldEqual, 1)
			}
			var count int64
			So(db.Model(&idm.Policy{}).Where("id = ?", "cleanup-old").Count(&count).Error, ShouldBeNil)
			So(count, ShouldEqual, 0)
			So(dao.DeletePolicyGroup(ctx, replacement), ShouldBeNil)
			for _, model := range []any{&idm.PolicyAction{}, &idm.PolicySubject{}, &idm.PolicyResource{}} {
				So(db.Model(model).Where("template = ?", "cleanup:new").Count(&count).Error, ShouldBeNil)
				So(count, ShouldEqual, 0)
				So(db.Model(model).Where("template = ?", "cleanup:shared").Count(&count).Error, ShouldBeNil)
				So(count, ShouldEqual, 1)
			}
			So(dao.DeletePolicyGroup(ctx, &idm.PolicyGroup{Uuid: "cleanup-survivor-uuid"}), ShouldBeNil)
			for _, model := range []any{&idm.PolicyAction{}, &idm.PolicySubject{}, &idm.PolicyResource{}} {
				So(db.Model(model).Where("template = ?", "cleanup:shared").Count(&count).Error, ShouldBeNil)
				So(count, ShouldEqual, 0)
			}
		})
	})
}

func TestPolicyDAOAuthorizationAndCancellation(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		Convey("DAO authorization uses stored policies and canceled operations preserve data", t, func() {
			dao, err := manager.Resolve[policy.DAO](ctx)
			So(err, ShouldBeNil)
			group := &idm.PolicyGroup{Uuid: "dao-access-uuid", Policies: []*idm.Policy{{ID: "dao-access-uuid",
				Effect: idm.PolicyEffect_allow, Subjects: []string{"user:dao"}, Resources: []string{"acl"}, Actions: []string{"read"}}}}
			_, err = dao.StorePolicyGroup(ctx, group)
			So(err, ShouldBeNil)
			So(dao.IsAllowed(ctx, &ladon.Request{Subject: "user:dao", Resource: "acl", Action: "read"}), ShouldBeNil)
			So(errors.Is(dao.IsAllowed(ctx, &ladon.Request{Subject: "user:other", Resource: "acl", Action: "read"}), ladon.ErrRequestDenied), ShouldBeTrue)
			canceled, cancel := context.WithCancel(ctx)
			cancel()
			_, err = dao.ListPolicyGroups(canceled, nil)
			So(errors.Is(err, context.Canceled), ShouldBeTrue)
			_, err = dao.StorePolicyGroup(canceled, group)
			So(errors.Is(err, context.Canceled), ShouldBeTrue)
			So(errors.Is(dao.DeletePolicyGroup(canceled, group), context.Canceled), ShouldBeTrue)
			q, err := anypb.New(&idm.PolicyGroupSingleQuery{Uuid: group.Uuid})
			So(err, ShouldBeNil)
			groups, err := dao.ListPolicyGroups(ctx, &service.Query{SubQueries: []*anypb.Any{q}})
			So(err, ShouldBeNil)
			So(groups, ShouldHaveLength, 1)
			So(groups[0].Policies, ShouldHaveLength, 1)
		})
	})
}

func Test(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {

		dao, err := manager.Resolve[policy.DAO](ctx)
		if err != nil {
			t.Fatal(err)
		}

		Convey("CRUD PolicyGroup", t, func() {

			// Create a new PolicyGroup
			group := &idm.PolicyGroup{
				Uuid:          "test-group",
				Name:          "Test Group",
				Description:   "A test policy group",
				OwnerUuid:     "owner-123",
				ResourceGroup: idm.PolicyResourceGroup_acl,
				Policies: []*idm.Policy{
					{
						ID:          "policy-1",
						Description: "Test Policy 1",
						Actions: []string{
							"read",
						},
						Resources: []string{
							"resource:1",
						},
						Subjects: []string{
							"user:1",
						},
						Conditions: map[string]*idm.PolicyCondition{
							"ctest": {Type: "something", JsonOptions: `{"key":"value"}`},
						},
					},
					{
						ID:          "policy-2",
						Description: "Test Policy 2",
						Actions: []string{
							"read",
						},
						Resources: []string{
							"resource:2",
						},
						Subjects: []string{
							"user:2",
						},
						Conditions: map[string]*idm.PolicyCondition{
							"ctest": {Type: "something", JsonOptions: `{"key":"value"}`},
						},
					},
					{
						ID:          "policy-3",
						Description: "Test Policy3",
						Actions: []string{
							"read",
						},
						Resources: []string{
							"resource:3",
						},
						Subjects: []string{
							"user:3",
						},
						Conditions: map[string]*idm.PolicyCondition{
							"ctest": {Type: "something", JsonOptions: `{"key":"value"}`},
						},
					},
				},
			}

			// Test: Store PolicyGroup
			storedGroup, err := dao.StorePolicyGroup(ctx, group)
			So(err, ShouldBeNil)
			So(storedGroup, ShouldNotBeNil)

			// Test: List PolicyGroups
			groups, err := dao.ListPolicyGroups(ctx, nil)
			So(err, ShouldBeNil)
			So(groups, ShouldHaveLength, 1)
			So(groups[0].Policies, ShouldHaveLength, 3)

			// Add some policies and update
			group.Policies = append(group.Policies, &idm.Policy{
				ID:          "policy-4",
				Description: "Test Policy4",
				Actions: []string{
					"read",
				},
				Resources: []string{
					"resource:4",
				},
				Subjects: []string{
					"user:4",
				},
			})
			storedGroup, err = dao.StorePolicyGroup(ctx, group)
			So(err, ShouldBeNil)
			So(storedGroup, ShouldNotBeNil)

			// Test: List PolicyGroups
			groups, err = dao.ListPolicyGroups(ctx, nil)
			So(err, ShouldBeNil)
			So(groups, ShouldHaveLength, 1)
			So(groups[0].Policies, ShouldHaveLength, 4)

			// Remove some policies and update
			group.Policies = group.Policies[:1]
			storedGroup, err = dao.StorePolicyGroup(ctx, group)
			So(err, ShouldBeNil)
			So(storedGroup, ShouldNotBeNil)

			// Test: List PolicyGroups
			groups, err = dao.ListPolicyGroups(ctx, nil)
			So(err, ShouldBeNil)
			So(groups, ShouldHaveLength, 1)
			So(groups[0].Policies, ShouldHaveLength, 1)

			var queries []*anypb.Any
			q1, _ := anypb.New(&idm.PolicyGroupSingleQuery{Description: "A test%", Like: true})
			queries = append(queries, q1)

			q2, _ := anypb.New(&idm.PolicyGroupSingleQuery{PolicyAction: []string{"read"}})
			queries = append(queries, q2)

			groupsFromQuery, err := dao.ListPolicyGroups(ctx, &service.Query{
				SubQueries: queries,
				Operation:  service.OperationType_AND,
			})

			So(err, ShouldBeNil)
			So(groupsFromQuery, ShouldHaveLength, 1)

			// Test: Delete PolicyGroup
			sql.TestPrintQueries = true
			err = dao.DeletePolicyGroup(ctx, group)
			So(err, ShouldBeNil)

			// Verify deletion
			groups, err = dao.ListPolicyGroups(ctx, nil)
			So(err, ShouldBeNil)
			So(groups, ShouldHaveLength, 0)
		})

	})
}
