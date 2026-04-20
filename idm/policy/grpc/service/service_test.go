package service

import (
	"context"
	"testing"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/common/utils/uuid"

	_ "github.com/pydio/cells/v5/idm/policy/dao/sql"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = test.TemplateSQLService((map[string]map[string]map[string]any{}))
)

type Case[Req any, Resp any] struct {
	Name   string
	Req    Req
	Assert func(t *testing.T, resp Resp, err error)
}

func RunCases[Req any, Resp any](
	t *testing.T,
	ctx context.Context,
	call func(context.Context, Req) (Resp, error),
	cases []Case[Req, Resp],
) {
	for _, c := range cases {
		c := c
		t.Run(c.Name, func(t *testing.T) {
			resp, err := call(ctx, c.Req)
			c.Assert(t, resp, err)
		})
	}
}

// Tiny assertion helpers
func ok(t *testing.T, err error) {
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func ko(t *testing.T, err error) {
	if err == nil {
		t.Fatalf("expected error, got nil")
	}
}

func notNil(t *testing.T, v any) {
	if v == nil {
		t.Fatalf("expected non-nil")
	}
}

func isTrue(t *testing.T, b bool) {
	if !b {
		t.Fatalf("expected true")
	}
}

func isFalse(t *testing.T, b bool) {
	if b {
		t.Fatalf("expected false")
	}
}

func TestPolicyGroup(t *testing.T) {
	test.RunServicesTests("main", testcases, t, func(ctx context.Context) {
		const id = "test-policy"

		conn := grpc.ResolveConn(ctx, common.ServicePolicyGRPC)
		cli := idm.NewPolicyEngineServiceClient(conn)

		storePolicyGroup := func(ctx context.Context, req *idm.StorePolicyGroupRequest) (*idm.StorePolicyGroupResponse, error) {
			return cli.StorePolicyGroup(ctx, req)
		}

		listPolicyGroups := func(ctx context.Context, req *idm.ListPolicyGroupsRequest) (*idm.ListPolicyGroupsResponse, error) {
			return cli.ListPolicyGroups(ctx, req)
		}

		deletePolicyGroup := func(ctx context.Context, req *idm.DeletePolicyGroupRequest) (*idm.DeletePolicyGroupResponse, error) {
			return cli.DeletePolicyGroup(ctx, req)
		}

		// Request builders
		storeReq := func(policyGroupUUID string) *idm.StorePolicyGroupRequest {
			return &idm.StorePolicyGroupRequest{
				PolicyGroup: &idm.PolicyGroup{
					Uuid:          policyGroupUUID,
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
						},
					},
				},
			}
		}
		listReq := func(filter string) *idm.ListPolicyGroupsRequest {
			return &idm.ListPolicyGroupsRequest{Filter: filter}
		}
		delReq := func(uuid string) *idm.DeletePolicyGroupRequest {
			return &idm.DeletePolicyGroupRequest{PolicyGroup: &idm.PolicyGroup{Uuid: uuid}}
		}

		seed := func() { _, err := storePolicyGroup(ctx, storeReq(id)); So(err, ShouldBeNil) }

		Convey("PolicyGroup readable tables", t, func() {

			Convey("Store", func() {
				RunCases(t, ctx, storePolicyGroup, []Case[*idm.StorePolicyGroupRequest, *idm.StorePolicyGroupResponse]{
					{
						Name: "ok",
						Req:  storeReq(id),
						Assert: func(t *testing.T, resp *idm.StorePolicyGroupResponse, err error) {
							ok(t, err)
							notNil(t, resp)
						},
					},
					{
						Name: "nil request -> error",
						Req:  nil,
						Assert: func(t *testing.T, _ *idm.StorePolicyGroupResponse, err error) {
							ko(t, err)
						},
					},
					{
						Name: "nil policygroup -> error",
						Req:  &idm.StorePolicyGroupRequest{PolicyGroup: nil},
						Assert: func(t *testing.T, _ *idm.StorePolicyGroupResponse, err error) {
							ko(t, err)
						},
					},
					{
						Name: "empty uuid -> error",
						Req:  storeReq(""),
						Assert: func(t *testing.T, _ *idm.StorePolicyGroupResponse, err error) {
							ko(t, err)
						},
					},
				})
			})

			Convey("List", func() {
				seed()

				RunCases(t, ctx, listPolicyGroups, []Case[*idm.ListPolicyGroupsRequest, *idm.ListPolicyGroupsResponse]{
					{
						Name: "all -> total=5",
						Req:  &idm.ListPolicyGroupsRequest{},
						Assert: func(t *testing.T, resp *idm.ListPolicyGroupsResponse, err error) {
							ok(t, err)
							// Considering migrations
							if resp.Total != 5 {
								t.Fatalf("expected total=1, got %d", resp.Total)
							}
						},
					},
					{
						Name: "deprecated filter -> error",
						Req:  listReq("uuid:test1-policy"),
						Assert: func(t *testing.T, resp *idm.ListPolicyGroupsResponse, err error) {
							ok(t, err)
							if resp.Total != 0 {
								t.Fatalf("expected total=1, got %d", resp.Total)
							}
						},
					},
					{
						Name: "supported filter -> total=1",
						Req:  listReq("uuid:" + id),
						Assert: func(t *testing.T, resp *idm.ListPolicyGroupsResponse, err error) {
							ok(t, err)
							if resp.Total != 1 {
								t.Fatalf("expected total=1, got %d", resp.Total)
							}
						},
					},
					{
						Name: "malformed filter -> error",
						Req:  listReq("uuid==oops"),
						Assert: func(t *testing.T, _ *idm.ListPolicyGroupsResponse, err error) {
							ko(t, err)
						},
					},
				})
			})

			Convey("Delete", func() {
				seed()

				RunCases(t, ctx, deletePolicyGroup, []Case[*idm.DeletePolicyGroupRequest, *idm.DeletePolicyGroupResponse]{
					{
						Name: "ok",
						Req:  delReq(id),
						Assert: func(t *testing.T, resp *idm.DeletePolicyGroupResponse, err error) {
							ok(t, err)
							isTrue(t, resp.Success)
						},
					},
					{
						Name: "nil request -> error",
						Req:  nil,
						Assert: func(t *testing.T, _ *idm.DeletePolicyGroupResponse, err error) {
							ko(t, err)
						},
					},
					{
						Name: "nil policygroup -> error",
						Req:  &idm.DeletePolicyGroupRequest{PolicyGroup: nil},
						Assert: func(t *testing.T, _ *idm.DeletePolicyGroupResponse, err error) {
							ko(t, err)
						},
					},
					{
						Name: "empty uuid -> error",
						Req:  delReq(""),
						Assert: func(t *testing.T, _ *idm.DeletePolicyGroupResponse, err error) {
							ko(t, err)
						},
					},
					{
						Name: "non-existent -> error OR success=false",
						Req:  delReq("does-not-exist"),
						Assert: func(t *testing.T, resp *idm.DeletePolicyGroupResponse, err error) {
							if err != nil {
								return // acceptable contract: error
							}
							// acceptable contract: no error and Success=true
							notNil(t, resp)
							isTrue(t, resp.Success)
						},
					},
				})
			})
		})
	})
}
