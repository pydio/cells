/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package service

import "github.com/pydio/cells/common"

// ResourcePoliciesBuilder is a helper for building ResourcePolicies lists
type ResourcePoliciesBuilder struct {
	policies []*ResourcePolicy
}

// NewResourcePoliciesBuilder creates a ResourcePoliciesBuilder
func NewResourcePoliciesBuilder() *ResourcePoliciesBuilder {
	return &ResourcePoliciesBuilder{}
}

// WithUserRead appends a read policy for this user:login
func (r *ResourcePoliciesBuilder) WithUserRead(login string) *ResourcePoliciesBuilder {
	r.policies = append(r.policies, &ResourcePolicy{
		Action:  ResourcePolicyAction_READ,
		Effect:  ResourcePolicy_allow,
		Subject: "user:" + login,
	})
	return r
}

// WithProfileRead appends a read policy for profile:profileName
func (r *ResourcePoliciesBuilder) WithProfileRead(profile string) *ResourcePoliciesBuilder {
	r.policies = append(r.policies, &ResourcePolicy{
		Action:  ResourcePolicyAction_READ,
		Effect:  ResourcePolicy_allow,
		Subject: "profile:" + profile,
	})
	return r
}

// WithUserWrite appends a write policy for user:login
func (r *ResourcePoliciesBuilder) WithUserWrite(login string) *ResourcePoliciesBuilder {
	r.policies = append(r.policies, &ResourcePolicy{
		Action:  ResourcePolicyAction_WRITE,
		Effect:  ResourcePolicy_allow,
		Subject: "user:" + login,
	})
	return r
}

// WithProfileWrite appends a write policy for profile:profileName
func (r *ResourcePoliciesBuilder) WithProfileWrite(profile string) *ResourcePoliciesBuilder {
	r.policies = append(r.policies, &ResourcePolicy{
		Action:  ResourcePolicyAction_WRITE,
		Effect:  ResourcePolicy_allow,
		Subject: "profile:" + profile,
	})
	return r
}

// WithOwner appends an owner policy with user uuid
func (r *ResourcePoliciesBuilder) WithOwner(userUuid string) *ResourcePoliciesBuilder {
	r.policies = append(r.policies, &ResourcePolicy{
		Action:  ResourcePolicyAction_OWNER,
		Effect:  ResourcePolicy_allow,
		Subject: userUuid,
	})
	return r
}

// WithStandardUserPolicies is a shortcut for WithProfileWrite(profile:admin).WithProfileRead(profile:standard).WithUserWrite(userLogin)
func (r *ResourcePoliciesBuilder) WithStandardUserPolicies(userLogin string) *ResourcePoliciesBuilder {
	r.WithProfileWrite(common.PydioProfileAdmin).WithProfileRead(common.PydioProfileStandard).WithUserWrite(userLogin)
	return r
}

// WithResourcePolicy appends arbitrary policy
func (r *ResourcePoliciesBuilder) WithResourcePolicy(policy *ResourcePolicy) *ResourcePoliciesBuilder {
	r.policies = append(r.policies, policy)
	return r
}

// Reset clears internal buffer
func (r *ResourcePoliciesBuilder) Reset() *ResourcePoliciesBuilder {
	r.policies = []*ResourcePolicy{}
	return r
}

// Policies returns internal buffer
func (r *ResourcePoliciesBuilder) Policies() []*ResourcePolicy {
	return r.policies
}
