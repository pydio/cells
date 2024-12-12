/*
 * Copyright (c) 2022. Abstrium SAS <team (at) pydio.com>
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

package share

import (
	"context"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

// InheritPolicies find possible SecurityPolicy currently implied and compute a new one based on it.
func (sc *Client) InheritPolicies(ctx context.Context, policyName string, read, write bool) (string, error) {
	polClient := idm.NewPolicyEngineServiceClient(grpc.ResolveConn(ctx, common.ServicePolicyGRPC))
	parent, err := sc.policyByName(ctx, polClient, policyName)
	if err != nil {
		return "", err
	}
	var suffix = ""
	if read && write {
		suffix = "rw"
	} else if read {
		suffix = "ro"
	} else if write {
		suffix = "wo"
	} else {
		return "", errors.WithStack(errors.InvalidParameters)
	}
	// Create inherited flavours
	if ro, er := sc.policyByName(ctx, polClient, policyName+"-"+suffix); er == nil && ro != nil {
		// Already exist, just return
		return ro.GetUuid(), nil
	}
	roPol, e := sc.derivePolicy(parent, read, write, suffix)
	if e != nil {
		return "", e
	}
	if _, e := polClient.StorePolicyGroup(ctx, &idm.StorePolicyGroupRequest{PolicyGroup: roPol}); e != nil {
		return "", e
	}
	permissions.ClearCachedPolicies(ctx, "acl")
	return roPol.GetUuid(), nil
}

func (sc *Client) derivePolicy(policy *idm.PolicyGroup, read, write bool, suffix string) (*idm.PolicyGroup, error) {
	var label string
	switch suffix {
	case "ro":
		label = "Read Only"
	case "rw":
		label = "Read Write"
	case "wo":
		label = "Write Only"
	}
	newG := &idm.PolicyGroup{
		Uuid:          policy.GetUuid() + "-" + suffix,
		Name:          policy.Name + " (" + label + ")",
		Description:   policy.Description + " (generated for sharing)",
		ResourceGroup: policy.ResourceGroup,
		OwnerUuid:     policy.GetOwnerUuid(),
	}
	var hasRead, hasWrite bool
	var allowPol *idm.Policy
	for _, p := range policy.Policies {
		// Deny : append policy
		if p.Effect == idm.PolicyEffect_deny {
			p.ID = uuid.New()
			p.Subjects = []string{"policy:" + newG.GetUuid()}
			newG.Policies = append(newG.Policies, p)
			continue
		}
		// Allow : check action effect
		allowPol = p
		for _, a := range p.Actions {
			if a == permissions.AclRead.Name {
				hasRead = true
			} else if a == permissions.AclWrite.Name {
				hasWrite = true
			}
		}
	}
	if allowPol == nil {
		return nil, errors.WithMessagef(errors.StatusForbidden, "cannot derive parent policy (no allow rule set)")
	}
	if read && !hasRead {
		return nil, errors.WithMessagef(errors.StatusForbidden, "cannot assign read as parent policy does not provide read access")
	}
	if write && !hasWrite {
		return nil, errors.WithMessagef(errors.StatusForbidden, "cannot assign write as parent policy does not provide write access")
	}
	// Reset actions
	allowPol.ID = uuid.New()
	allowPol.Subjects = []string{"policy:" + newG.GetUuid()}
	allowPol.Actions = []string{}
	if read {
		allowPol.Actions = append(allowPol.Actions, permissions.AclRead.Name)
	}
	if write {
		allowPol.Actions = append(allowPol.Actions, permissions.AclWrite.Name)
	}
	newG.Policies = append(newG.Policies, allowPol)

	return newG, nil
}

func (sc *Client) policyByName(ctx context.Context, cl idm.PolicyEngineServiceClient, name string) (*idm.PolicyGroup, error) {
	response, e := cl.ListPolicyGroups(ctx, &idm.ListPolicyGroupsRequest{Filter: "uuid:" + name})
	if e != nil {
		return nil, e
	}
	if len(response.PolicyGroups) == 0 {
		return nil, errors.WithMessagef(errors.StatusNotFound, "cannot find policy with uuid %s", name)
	}
	return response.PolicyGroups[0], nil
}

// InterpretInheritedPolicy translates a SecurityPolicy to read/write permissions for user readability
func (sc *Client) InterpretInheritedPolicy(ctx context.Context, name string) (read, write bool, e error) {
	polClient := idm.NewPolicyEngineServiceClient(grpc.ResolveConn(ctx, common.ServicePolicyGRPC))
	parent, er := sc.policyByName(ctx, polClient, name)
	if er != nil {
		return false, false, er
	}

	for _, p := range parent.Policies {
		// Deny : append policy
		if p.Effect == idm.PolicyEffect_deny {
			continue
		}
		// Allow : check action effect
		for _, a := range p.Actions {
			if a == permissions.AclRead.Name {
				read = true
			} else if a == permissions.AclWrite.Name {
				write = true
			}
		}
	}
	return
}
