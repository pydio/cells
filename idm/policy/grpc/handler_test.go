package grpc

import (
	"context"
	"testing"

	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/common/utils/uuid"
	"github.com/pydio/cells/v5/idm/policy/dao/sql"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = test.TemplateSQL(sql.NewDAO)
)

func Test(t *testing.T) {
	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		h := NewHandler()
		Convey("Test CRUD Policy Group", t, func() {
			r, e := h.StorePolicyGroup(ctx, &idm.StorePolicyGroupRequest{PolicyGroup: &idm.PolicyGroup{
				Uuid:          "test-policy",
				Name:          "Test Policy",
				Description:   "Policy for Testing",
				ResourceGroup: idm.PolicyResourceGroup_acl,
				Policies: []*idm.Policy{
					{
						ID:          uuid.New(),
						Description: "Pol",
						Subjects:    []string{"sub"},
						Resources:   []string{"res"},
						Actions:     []string{"read", "write"},
						Effect:      idm.PolicyEffect_allow,
						Conditions:  nil,
					},
				},
			}})
			So(e, ShouldBeNil)
			So(r, ShouldNotBeNil)

			lr, er := h.ListPolicyGroups(ctx, &idm.ListPolicyGroupsRequest{})
			So(er, ShouldBeNil)
			So(lr.Total, ShouldEqual, 1)

			dr, er := h.DeletePolicyGroup(ctx, &idm.DeletePolicyGroupRequest{PolicyGroup: &idm.PolicyGroup{Uuid: "test-policy"}})
			So(er, ShouldBeNil)
			So(dr.Success, ShouldBeTrue)
		})
	})
}
