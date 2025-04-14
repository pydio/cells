//go:build storage || sql

package sql

import (
	"context"
	"testing"

	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/idm/policy"

	. "github.com/smartystreets/goconvey/convey"
)

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
				},
			}

			// Test: Store PolicyGroup
			storedGroup, err := dao.StorePolicyGroup(ctx, group)
			So(err, ShouldBeNil)
			So(storedGroup, ShouldNotBeNil)

			// Test: List PolicyGroups
			groups, err := dao.ListPolicyGroups(ctx, "")
			So(err, ShouldBeNil)
			So(groups, ShouldHaveLength, 1)

			// Test: Delete PolicyGroup
			sql.TestPrintQueries = true
			err = dao.DeletePolicyGroup(ctx, group)
			So(err, ShouldBeNil)

			// Verify deletion
			groups, err = dao.ListPolicyGroups(ctx, "")
			So(err, ShouldBeNil)
			So(groups, ShouldHaveLength, 0)
		})

	})
}
