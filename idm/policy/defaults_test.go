package policy

import (
	"testing"

	"github.com/ory/ladon"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/idm/policy/converter"

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
