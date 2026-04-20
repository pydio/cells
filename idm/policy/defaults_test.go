package policy

import (
	"context"
	"errors"
	"testing"

	"github.com/ory/ladon"
	"github.com/pydio/cells/v5/common/proto/idm"
	pb "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/idm/policy/converter"

	_ "github.com/pydio/cells/v5/common/config/memory"
	_ "github.com/pydio/cells/v5/common/config/viper"
	_ "github.com/pydio/cells/v5/common/registry/config"
	_ "github.com/pydio/cells/v5/common/registry/service"

	. "github.com/smartystreets/goconvey/convey"
)

func TestSplitFrontendPostPolicies(t *testing.T) {
	Convey("happy path: it splits old unified frontend-post policy for migration", t, func() {
		oldUnified := converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
			ID:          "frontend-post",
			Description: "old unified policy",
			Subjects:    []string{"profile:standard", "profile:shared"},
			Resources: []string{
				"rest:/frontend/binaries/USER/<.+>",
				"rest:/frontend/enroll",
				"rest:/frontend/session",
			},
			Actions: []string{"POST"},
			Effect:  ladon.AllowAccess,
		})

		untouched := &idm.Policy{ID: "keep-me"}

		policies, changed := splitFrontendPostPolicies([]*idm.Policy{untouched, oldUnified})

		So(changed, ShouldBeTrue)
		So(policies, ShouldHaveLength, 3)
		So(policies[0].GetID(), ShouldEqual, "keep-me")

		standardPolicy := findPolicyByID(policies, "frontend-post")
		sharedPolicy := findPolicyByID(policies, "frontend-post-shared")

		So(standardPolicy, ShouldNotBeNil)
		So(sharedPolicy, ShouldNotBeNil)

		So(hasSubject(standardPolicy, "profile:standard"), ShouldBeTrue)
		So(hasSubject(standardPolicy, "profile:shared"), ShouldBeFalse)
		So(hasAction(standardPolicy, "POST"), ShouldBeTrue)
		So(hasResource(standardPolicy, "rest:/frontend/enroll"), ShouldBeTrue)
		So(hasResource(standardPolicy, "rest:/frontend/session"), ShouldBeTrue)

		So(hasSubject(sharedPolicy, "profile:shared"), ShouldBeTrue)
		So(hasSubject(sharedPolicy, "profile:standard"), ShouldBeFalse)
		So(hasAction(sharedPolicy, "POST"), ShouldBeTrue)
		So(hasResource(sharedPolicy, "rest:/frontend/enroll"), ShouldBeFalse)
		So(hasResource(sharedPolicy, "rest:/frontend/session"), ShouldBeTrue)
	})

	Convey("happy path: it also splits when subjects are stored in orm subjects", t, func() {
		oldUnified := &idm.Policy{
			ID: "frontend-post",
			OrmSubjects: []*idm.PolicySubject{
				{Template: "profile:standard"},
				{Template: "profile:shared"},
			},
		}

		policies, changed := splitFrontendPostPolicies([]*idm.Policy{oldUnified})

		So(changed, ShouldBeTrue)
		So(policies, ShouldHaveLength, 2)
		So(findPolicyByID(policies, "frontend-post"), ShouldNotBeNil)
		So(findPolicyByID(policies, "frontend-post-shared"), ShouldNotBeNil)
	})

	Convey("non-happy path: it does nothing when policies are already split", t, func() {
		standard := converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
			ID:        "frontend-post",
			Subjects:  []string{"profile:standard"},
			Resources: []string{"rest:/frontend/enroll", "rest:/frontend/session"},
			Actions:   []string{"POST"},
			Effect:    ladon.AllowAccess,
		})
		shared := converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
			ID:        "frontend-post-shared",
			Subjects:  []string{"profile:shared"},
			Resources: []string{"rest:/frontend/session"},
			Actions:   []string{"POST"},
			Effect:    ladon.AllowAccess,
		})

		policies, changed := splitFrontendPostPolicies([]*idm.Policy{standard, shared})

		So(changed, ShouldBeFalse)
		So(policies, ShouldHaveLength, 2)
		So(policies[0], ShouldEqual, standard)
		So(policies[1], ShouldEqual, shared)
	})

	Convey("non-happy path: it does nothing when frontend-post does not contain both profiles", t, func() {
		onlyShared := converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
			ID:        "frontend-post",
			Subjects:  []string{"profile:shared"},
			Resources: []string{"rest:/frontend/session"},
			Actions:   []string{"POST"},
			Effect:    ladon.AllowAccess,
		})

		policies, changed := splitFrontendPostPolicies([]*idm.Policy{onlyShared})

		So(changed, ShouldBeFalse)
		So(policies, ShouldHaveLength, 1)
		So(policies[0], ShouldEqual, onlyShared)
	})

	Convey("non-happy path: it ignores unrelated policies", t, func() {
		untouched := &idm.Policy{ID: "keep-me"}

		policies, changed := splitFrontendPostPolicies([]*idm.Policy{untouched})

		So(changed, ShouldBeFalse)
		So(policies, ShouldHaveLength, 1)
		So(policies[0], ShouldEqual, untouched)
	})
}

func TestUpgrade4994(t *testing.T) {
	Convey("it updates target group when old unified policy exists", t, func() {
		dao := &fakePolicyDAO{
			groups: []*idm.PolicyGroup{{
				Uuid: "rest-apis-default-accesses",
				Policies: []*idm.Policy{
					converter.LadonToProtoPolicy(&ladon.DefaultPolicy{
						ID:          "frontend-post",
						Description: "old unified policy",
						Subjects:    []string{"profile:standard", "profile:shared"},
						Resources: []string{
							"rest:/frontend/binaries/USER/<.+>",
							"rest:/frontend/enroll",
							"rest:/frontend/session",
						},
						Actions: []string{"POST"},
						Effect:  ladon.AllowAccess,
					}),
				},
			}},
		}

		ctx, err := manager.DSNtoContextDAO(t.Context(), []string{}, func(context.Context) DAO { return dao })
		So(err, ShouldBeNil)

		err = Upgrade4994(ctx)

		So(err, ShouldBeNil)
		So(dao.storeCalls, ShouldEqual, 1)
		So(dao.storedGroups, ShouldHaveLength, 1)
		So(findPolicyByID(dao.storedGroups[0].Policies, "frontend-post"), ShouldNotBeNil)
		So(findPolicyByID(dao.storedGroups[0].Policies, "frontend-post-shared"), ShouldNotBeNil)
	})

	Convey("it does not store when target group is absent", t, func() {
		dao := &fakePolicyDAO{
			groups: []*idm.PolicyGroup{{Uuid: "other-group", Policies: []*idm.Policy{{ID: "keep-me"}}}},
		}

		ctx, err := manager.DSNtoContextDAO(t.Context(), []string{}, func(context.Context) DAO { return dao })
		So(err, ShouldBeNil)

		err = Upgrade4994(ctx)

		So(err, ShouldBeNil)
		So(dao.storeCalls, ShouldEqual, 0)
	})

	Convey("it does not store when target group is already migrated", t, func() {
		dao := &fakePolicyDAO{
			groups: []*idm.PolicyGroup{{
				Uuid: "rest-apis-default-accesses",
				Policies: []*idm.Policy{
					converter.LadonToProtoPolicy(&ladon.DefaultPolicy{ID: "frontend-post", Subjects: []string{"profile:standard"}, Resources: []string{"rest:/frontend/enroll", "rest:/frontend/session"}, Actions: []string{"POST"}, Effect: ladon.AllowAccess}),
					converter.LadonToProtoPolicy(&ladon.DefaultPolicy{ID: "frontend-post-shared", Subjects: []string{"profile:shared"}, Resources: []string{"rest:/frontend/session"}, Actions: []string{"POST"}, Effect: ladon.AllowAccess}),
				},
			}},
		}

		ctx, err := manager.DSNtoContextDAO(t.Context(), []string{}, func(context.Context) DAO { return dao })
		So(err, ShouldBeNil)

		err = Upgrade4994(ctx)

		So(err, ShouldBeNil)
		So(dao.storeCalls, ShouldEqual, 0)
	})

	Convey("it returns list error", t, func() {
		dao := &fakePolicyDAO{listErr: errors.New("list failed")}

		ctx, err := manager.DSNtoContextDAO(t.Context(), []string{}, func(context.Context) DAO { return dao })
		So(err, ShouldBeNil)

		err = Upgrade4994(ctx)

		So(err, ShouldNotBeNil)
		So(err.Error(), ShouldContainSubstring, "list failed")
	})

	Convey("it logs store error and continues", t, func() {
		dao := &fakePolicyDAO{
			groups: []*idm.PolicyGroup{{
				Uuid: "rest-apis-default-accesses",
				Policies: []*idm.Policy{
					converter.LadonToProtoPolicy(&ladon.DefaultPolicy{ID: "frontend-post", Subjects: []string{"profile:standard", "profile:shared"}, Resources: []string{"rest:/frontend/enroll", "rest:/frontend/session"}, Actions: []string{"POST"}, Effect: ladon.AllowAccess}),
				},
			}},
			storeErr: errors.New("store failed"),
		}

		ctx, err := manager.DSNtoContextDAO(t.Context(), []string{}, func(context.Context) DAO { return dao })
		So(err, ShouldBeNil)

		err = Upgrade4994(ctx)

		So(err, ShouldBeNil)
		So(dao.storeCalls, ShouldEqual, 1)
	})
}

func findPolicyByID(policies []*idm.Policy, id string) *idm.Policy {
	for _, p := range policies {
		if p.GetID() == id {
			return p
		}
	}
	return nil
}

func hasSubject(p *idm.Policy, subject string) bool {
	for _, s := range p.OrmSubjects {
		if s.Template == subject {
			return true
		}
	}
	return false
}

func hasResource(p *idm.Policy, resource string) bool {
	for _, r := range p.OrmResources {
		if r.Template == resource {
			return true
		}
	}
	return false
}

func hasAction(p *idm.Policy, action string) bool {
	for _, a := range p.OrmActions {
		if a.Template == action {
			return true
		}
	}
	return false
}

type fakePolicyDAO struct {
	groups       []*idm.PolicyGroup
	storedGroups []*idm.PolicyGroup
	listErr      error
	storeErr     error
	storeCalls   int
}

func (f *fakePolicyDAO) Migrate(ctx context.Context) error { return nil }
func (f *fakePolicyDAO) MigrateLegacy(ctx context.Context) error { return nil }
func (f *fakePolicyDAO) IsAllowed(ctx context.Context, r *ladon.Request) error { return nil }
func (f *fakePolicyDAO) Create(ctx context.Context, policy ladon.Policy) error { return nil }
func (f *fakePolicyDAO) Update(ctx context.Context, policy ladon.Policy) error { return nil }
func (f *fakePolicyDAO) Get(ctx context.Context, id string) (ladon.Policy, error) { return nil, nil }
func (f *fakePolicyDAO) Delete(ctx context.Context, id string) error { return nil }
func (f *fakePolicyDAO) GetAll(ctx context.Context, limit, offset int64) (ladon.Policies, error) {
	return nil, nil
}
func (f *fakePolicyDAO) FindRequestCandidates(ctx context.Context, r *ladon.Request) (ladon.Policies, error) {
	return nil, nil
}
func (f *fakePolicyDAO) FindPoliciesForSubject(ctx context.Context, subject string) (ladon.Policies, error) {
	return nil, nil
}
func (f *fakePolicyDAO) FindPoliciesForResource(ctx context.Context, resource string) (ladon.Policies, error) {
	return nil, nil
}
func (f *fakePolicyDAO) StorePolicyGroup(ctx context.Context, group *idm.PolicyGroup) (*idm.PolicyGroup, error) {
	f.storeCalls++
	f.storedGroups = append(f.storedGroups, group)
	if f.storeErr != nil {
		return nil, f.storeErr
	}
	return group, nil
}
func (f *fakePolicyDAO) ListPolicyGroups(ctx context.Context, query pb.Enquirer) ([]*idm.PolicyGroup, error) {
	if f.listErr != nil {
		return nil, f.listErr
	}
	return f.groups, nil
}
func (f *fakePolicyDAO) DeletePolicyGroup(ctx context.Context, group *idm.PolicyGroup) error { return nil }
