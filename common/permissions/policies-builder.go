package permissions

import (
	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/proto/service"
)

// ResourcePoliciesBuilder is a helper for building ResourcePolicies lists
type ResourcePoliciesBuilder struct {
	policies []*service.ResourcePolicy
}

// NewResourcePoliciesBuilder creates a ResourcePoliciesBuilder
func NewResourcePoliciesBuilder() *ResourcePoliciesBuilder {
	return &ResourcePoliciesBuilder{}
}

// WithSubjectRead appends a read policy for this user:login
func (r *ResourcePoliciesBuilder) WithSubjectRead(uuid string) *ResourcePoliciesBuilder {
	r.policies = append(r.policies, &service.ResourcePolicy{
		Action:  service.ResourcePolicyAction_READ,
		Effect:  service.ResourcePolicy_allow,
		Subject: PolicySubjectUuidPrefix + uuid,
	})
	return r
}

// WithProfileRead appends a read policy for profile:profileName
func (r *ResourcePoliciesBuilder) WithProfileRead(profile string) *ResourcePoliciesBuilder {
	r.policies = append(r.policies, &service.ResourcePolicy{
		Action:  service.ResourcePolicyAction_READ,
		Effect:  service.ResourcePolicy_allow,
		Subject: PolicySubjectProfilePrefix + profile,
	})
	return r
}

// WithSubjectWrite appends a write policy for user:login
func (r *ResourcePoliciesBuilder) WithSubjectWrite(uuid string) *ResourcePoliciesBuilder {
	r.policies = append(r.policies, &service.ResourcePolicy{
		Action:  service.ResourcePolicyAction_WRITE,
		Effect:  service.ResourcePolicy_allow,
		Subject: PolicySubjectUuidPrefix + uuid,
	})
	return r
}

// WithProfileWrite appends a write policy for profile:profileName
func (r *ResourcePoliciesBuilder) WithProfileWrite(profile string) *ResourcePoliciesBuilder {
	r.policies = append(r.policies, &service.ResourcePolicy{
		Action:  service.ResourcePolicyAction_WRITE,
		Effect:  service.ResourcePolicy_allow,
		Subject: PolicySubjectProfilePrefix + profile,
	})
	return r
}

// WithOwner appends an owner policy with user uuid
func (r *ResourcePoliciesBuilder) WithOwner(userUuid string) *ResourcePoliciesBuilder {
	r.policies = append(r.policies, &service.ResourcePolicy{
		Action:  service.ResourcePolicyAction_OWNER,
		Effect:  service.ResourcePolicy_allow,
		Subject: userUuid,
	})
	return r
}

// WithStandardUserPolicies is a shortcut for WithProfileWrite(profile:admin).WithProfileRead(profile:standard).WithUserWrite(userLogin)
func (r *ResourcePoliciesBuilder) WithStandardUserPolicies() *ResourcePoliciesBuilder {
	r.WithProfileWrite(common.PydioProfileAdmin).
		WithProfileRead(common.PydioProfileStandard).
		WithSubjectWrite(PolicySubjectSelf)
	return r
}

// WithResourcePolicy appends arbitrary policy
func (r *ResourcePoliciesBuilder) WithResourcePolicy(policy *service.ResourcePolicy) *ResourcePoliciesBuilder {
	r.policies = append(r.policies, policy)
	return r
}

// Reset clears internal buffer
func (r *ResourcePoliciesBuilder) Reset() *ResourcePoliciesBuilder {
	r.policies = []*service.ResourcePolicy{}
	return r
}

// Policies returns internal buffer
func (r *ResourcePoliciesBuilder) Policies() []*service.ResourcePolicy {
	return r.policies
}
