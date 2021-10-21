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

// Helper for building ResourcePolicies lists
type ResourcePoliciesBuilder struct {
	policies []*ResourcePolicy
}

func NewResourcePoliciesBuilder() *ResourcePoliciesBuilder {
	return &ResourcePoliciesBuilder{}
}

func (r *ResourcePoliciesBuilder) WithUserRead(login string) *ResourcePoliciesBuilder {
	r.policies = append(r.policies, &ResourcePolicy{
		Action:  ResourcePolicyAction_READ,
		Effect:  ResourcePolicy_allow,
		Subject: "user:" + login,
	})
	return r
}

func (r *ResourcePoliciesBuilder) WithProfileRead(profile string) *ResourcePoliciesBuilder {
	r.policies = append(r.policies, &ResourcePolicy{
		Action:  ResourcePolicyAction_READ,
		Effect:  ResourcePolicy_allow,
		Subject: "profile:" + profile,
	})
	return r
}

func (r *ResourcePoliciesBuilder) WithUserWrite(login string) *ResourcePoliciesBuilder {
	r.policies = append(r.policies, &ResourcePolicy{
		Action:  ResourcePolicyAction_WRITE,
		Effect:  ResourcePolicy_allow,
		Subject: "user:" + login,
	})
	return r
}

func (r *ResourcePoliciesBuilder) WithProfileWrite(profile string) *ResourcePoliciesBuilder {
	r.policies = append(r.policies, &ResourcePolicy{
		Action:  ResourcePolicyAction_WRITE,
		Effect:  ResourcePolicy_allow,
		Subject: "profile:" + profile,
	})
	return r
}

func (r *ResourcePoliciesBuilder) WithOwner(userUuid string) *ResourcePoliciesBuilder {
	r.policies = append(r.policies, &ResourcePolicy{
		Action:  ResourcePolicyAction_OWNER,
		Effect:  ResourcePolicy_allow,
		Subject: userUuid,
	})
	return r
}

func (r *ResourcePoliciesBuilder) WithStandardUserPolicies(userLogin string) *ResourcePoliciesBuilder {
	r.WithProfileWrite(common.PydioProfileAdmin).WithProfileRead(common.PydioProfileStandard).WithUserWrite(userLogin)
	return r
}

func (r *ResourcePoliciesBuilder) WithResourcePolicy(policy *ResourcePolicy) *ResourcePoliciesBuilder {
	r.policies = append(r.policies, policy)
	return r
}

func (r *ResourcePoliciesBuilder) Reset() *ResourcePoliciesBuilder {
	r.policies = []*ResourcePolicy{}
	return r
}

func (r *ResourcePoliciesBuilder) Policies() []*ResourcePolicy {
	return r.policies
}
